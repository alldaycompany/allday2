export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const NOTION_TOKEN = process.env.NOTION_TOKEN;
  const NOTION_DB_ID = process.env.NOTION_DB_ID;

  try {
    const data = req.body;

    const payload = {
      parent: { database_id: NOTION_DB_ID },
      properties: {
        '이름':     { title:        [{ text: { content: data.name     || '' } }] },
        '연락처':   { phone_number: data.phone    || null },
        '이메일':   { email:        data.email    || null },
        '업종':     { select:       { name: data.industry || '미입력' } },
        '월광고비': { select:       { name: data.budget   || '미입력' } },
        '광고채널': { multi_select: (data.channels || []).map(c => ({ name: c })) },
        '고민내용': { rich_text:    [{ text: { content: data.inquiry  || '' } }] },
        '신청일시': { date:         { start: new Date().toISOString() } },
        '상태':     { select:       { name: '신규' } }
      }
    };

    const response = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization':  `Bearer ${NOTION_TOKEN}`,
        'Content-Type':   'application/json',
        'Notion-Version': '2022-06-28'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (response.ok) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(response.status).json({ success: false, error: result.message });
    }

  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
