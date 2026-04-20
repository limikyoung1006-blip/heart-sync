import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import webpush from "npm:web-push"

// 🗝️ VAPID Details (서버 설정에서 VAPID_PRIVATE_KEY를 가져옵니다)
// ⚠️ CRITICAL: Set these as project-level environment variables in your Supabase Dashboard
const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY") || "BHiG5Sf9bEN47pzCzCbyZEtSrXyL2IXkw45e-l9TQ6hvCd-OP964Zm8zxnq3Ys83FPT8qW5Ep2C86k5WrqUs178KEY"
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY")
const VAPID_EMAIL = Deno.env.get("VAPID_EMAIL") || "admin@heartsync.com"

if (VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(`mailto:${VAPID_EMAIL}`, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const payload_raw = await req.json()
    console.log("Push trigger received:", JSON.stringify(payload_raw, null, 2))
    
    if (payload_raw.check_config) {
      return new Response(JSON.stringify({
        status: "alive",
        vapid_configured: !!VAPID_PRIVATE_KEY,
        vapid_public_key_exists: !!VAPID_PUBLIC_KEY,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } })
    }

    const { type, record, sender_role, couple_id, custom_title, custom_body, target_tab } = payload_raw
    
    // Determine target user and couple
    const final_couple_id = couple_id || record?.couple_id
    const final_sender_role = sender_role || record?.user_role
    
    if (!final_couple_id || !final_sender_role) {
      throw new Error("Missing couple_id or sender_role")
    }

    // 1. Prepare Content
    let title = custom_title || 'Heart Sync'
    let body = custom_body || '새로운 소식이 도착했습니다!'
    let tab = target_tab || 'home'

    // 2. Automate content for specific table triggers (Webhooks)
    if (type === 'PRAYER' || (payload_raw.table === 'prayers' && payload_raw.type === 'INSERT')) {
      const senderLabel = final_sender_role === 'husband' ? '남편' : '아내'
      title = `${senderLabel}님의 속마음 기도 🙏`
      body = record?.text?.substring(0, 50) || '새로운 기도 제목이 도착했습니다.'
      tab = 'heartPrayer'
    } else if (type === 'SIGNAL' || (record?.info?.signal && payload_raw.old_record?.info?.signal !== record?.info?.signal)) {
      const senderLabel = final_sender_role === 'husband' ? '남편' : '아내'
      const newSignal = record?.info?.signal
      const signalMap: Record<string, string> = { green: '🟢 초록', amber: '🟡 주황', red: '🔴 빨강', purple: '🟣 보라' }
      title = `${senderLabel}님의 마음 신호가 도착했습니다 🚦`
      body = `배우자의 마음이 ${signalMap[newSignal] || newSignal}색으로 바뀌었어요!`
      if (newSignal === 'purple') {
        title = `⚠️ ${senderLabel}님의 집중 시간`
        body = `지금은 접근 금지(보라색) 상태입니다. 잠시 기다려주세요. 💜`
      }
    } else if (type === 'GARDEN') {
      title = '🌱 마음 정원 알림'
      body = '배우자가 마음 정원에 새로운 변화를 주었어요!'
      tab = 'garden'
    }

    // 3. Get Partner Subscription
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: partnerProfile } = await supabase
      .from('profiles')
      .select('info')
      .eq('couple_id', final_couple_id)
      .neq('user_role', final_sender_role)
      .single()

    if (partnerProfile?.info?.pushSubscription) {
      const subscription = JSON.parse(partnerProfile.info.pushSubscription)
      const pushPayload = JSON.stringify({ title, body, url: '/', tab })
      
      await webpush.sendNotification(subscription, pushPayload, {
        TTL: 86400,
        urgency: 'high'
      })
      console.log("Push sent successfully ✅")
    }

    return new Response(JSON.stringify({ message: "Success" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } })

  } catch (err) {
    console.error("Function Error:", err.message)
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } })
  }
})
