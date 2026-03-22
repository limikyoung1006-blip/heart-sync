export default async function handler(req, res) {
  // CORS 처리 (로컬 개발 환경용)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Vercel 환경 변수(OPENAI_API_KEY) 우선 사용. 미설정 시 기존 하위 호환을 위해 헤더에서 추출.
  const apiKey = process.env.OPENAI_API_KEY || (req.headers.authorization ? req.headers.authorization.split(' ')[1] : null);

  if (!apiKey || apiKey === 'null' || apiKey === 'undefined') {
    return res.status(401).json({ error: 'OpenAI API Error: 키가 설정되지 않았습니다. Vercel 환경 변수(OPENAI_API_KEY)를 등록해주세요.' });
  }

  try {
    const { model, messages, temperature } = req.body;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model || 'gpt-4o-mini',
        messages: messages,
        temperature: temperature || 0.7,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || 'OpenAI API Error' });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
