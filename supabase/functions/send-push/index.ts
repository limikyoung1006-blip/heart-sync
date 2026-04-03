import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import webpush from "npm:web-push"

// 🗝️ VAPID Details (서버 설정에서 VAPID_PRIVATE_KEY를 가져옵니다)
// ⚠️ CRITICAL: Set these as project-level environment variables in your Supabase Dashboard
const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY") || "REPLACE_WITH_YOUR_ACTUAL_VAPID_PUBLIC_KEY"
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY")
const VAPID_EMAIL = Deno.env.get("VAPID_EMAIL") || "admin@heartsync.com"

if (VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(`mailto:${VAPID_EMAIL}`, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)
}

serve(async (req) => {
  try {
    const { record, old_record, type } = await req.json()
    
    // ✅ 1. 신호(Green/Amber/Red)가 변경되었을 때만 발송
    if (type === 'UPDATE' && record.info.signal !== old_record.info.signal) {
       const userRole = record.user_role
       const coupleCode = record.couple_id
       const newSignal = record.info.signal
       
       const signalMap = { 
         green: '🟢 초록 (기분 좋음)', 
         amber: '🟡 주황 (대화 필요)', 
         red: '🔴 빨강 (휴식 필요)', 
         purple: '🟣 보라 (접근 금지/혼자만의 시간)' 
       }
       const senderLabel = userRole === 'husband' ? '남편' : '아내'
       const receiverLabel = userRole === 'husband' ? '아내' : '남편'
       
       // 📡 Supabase에서 상대방의 푸시 구독 정보 가져오기
       const supabase = createClient(
         Deno.env.get('SUPABASE_URL') ?? '',
         Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
       )
       
       const { data: partnerProfile } = await supabase
         .from('profiles')
         .select('info')
         .eq('couple_id', coupleCode)
         .neq('user_role', userRole)
         .single()
       
       if (partnerProfile?.info?.pushSubscription) {
          const subscription = JSON.parse(partnerProfile.info.pushSubscription)
          
          let title = `${senderLabel}님의 마음 신호가 도착했습니다 🚦`
          let body = `배우자의 마음이 ${signalMap[newSignal]}색으로 바뀌었어요! 확인해보세요.`
          
          if (newSignal === 'purple') {
             title = `⚠️ ${senderLabel}님이 절대적인 혼자만의 시간이 필요합니다.`
             body = `지금은 접근 금지(보라색) 상태입니다. 배우자를 위해 조용히 기다려주세요. 💜`
          }
          
          const payload = JSON.stringify({
            title,
            body,
            url: '/',
            tab: 'home'
          })
          
          await webpush.sendNotification(subscription, payload)
          console.log(`Push sent to ${receiverLabel} ✅`)
       }
    }

    return new Response(JSON.stringify({ message: "Success" }), { headers: { "Content-Type": "application/json" } })

  } catch (err) {
    console.error("Function Error:", err.message)
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { "Content-Type": "application/json" } })
  }
})
