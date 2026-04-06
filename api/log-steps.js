export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  // Accept both GET (?steps=8500&date=2026-04-06) and POST {steps, date}
  const steps = parseInt(req.query.steps || req.body?.steps);
  const date  = req.query.date  || req.body?.date || new Date().toISOString().split('T')[0];
  const key   = req.query.key   || req.body?.key  || '';

  // Simple secret key check — prevents random people from writing to your data
  const SECRET = process.env.STEPS_SECRET || 'blueprint2026';
  if (key !== SECRET) {
    return res.status(401).json({ error: 'Invalid key' });
  }

  if (!steps || isNaN(steps) || steps < 0) {
    return res.status(400).json({ error: 'Invalid steps value' });
  }

  const USER_ID = 'user_ahiacgzh';

  try {
    const SUPABASE_URL     = process.env.REACT_APP_SUPABASE_URL;
    const SUPABASE_KEY     = process.env.REACT_APP_SUPABASE_ANON_KEY;

    if (!SUPABASE_URL || !SUPABASE_KEY) {
      return res.status(500).json({ error: 'Supabase not configured' });
    }

    // Load existing day data
    const getRes = await fetch(
      `${SUPABASE_URL}/rest/v1/days?user_id=eq.${USER_ID}&date=eq.${date}&select=data`,
      { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } }
    );
    const rows = await getRes.json();
    const existing = rows?.[0]?.data || {};

    // Merge steps into day data
    const updated = { ...existing, steps };

    // Upsert
    await fetch(`${SUPABASE_URL}/rest/v1/days`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates',
      },
      body: JSON.stringify({ user_id: USER_ID, date, data: updated })
    });

    return res.status(200).json({ success: true, steps, date });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
