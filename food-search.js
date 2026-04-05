export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  const { q } = req.query;
  if (!q || q.trim().length < 2) {
    return res.status(400).json({ error: 'Query too short' });
  }

  try {
    // Try USDA FoodData Central first
    const usdaRes = await fetch(
      `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(q)}&pageSize=10&dataType=SR%20Legacy,Survey%20(FNDDS),Foundation&api_key=DEMO_KEY`,
      { headers: { 'Content-Type': 'application/json' } }
    );

    if (usdaRes.ok) {
      const data = await usdaRes.json();
      const foods = (data.foods || []).slice(0, 8).map(f => {
        const n = {};
        (f.foodNutrients || []).forEach(fn => {
          const name = (fn.nutrientName || '').toLowerCase();
          if (name.includes('energy') && !name.includes('kj')) n['energy-kcal_100g'] = fn.value;
          if (name === 'protein') n['proteins_100g'] = fn.value;
          if (name.includes('carbohydrate')) n['carbohydrates_100g'] = fn.value;
          if (name === 'total lipid (fat)') n['fat_100g'] = fn.value;
          if (name.includes('fiber')) n['fiber_100g'] = fn.value;
          if (name.includes('sugars, total')) n['sugars_100g'] = fn.value;
        });
        return {
          product_name: f.description,
          brands: f.brandOwner || f.brandName || '',
          nutriments: n,
          serving_quantity: f.servingSize || null,
        };
      }).filter(p => p.nutriments['energy-kcal_100g'] != null);

      if (foods.length > 0) {
        return res.status(200).json({ products: foods, source: 'usda' });
      }
    }
  } catch {}

  // Fallback: Open Food Facts
  try {
    const offRes = await fetch(
      `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(q)}&search_simple=1&action=process&json=1&page_size=10&fields=product_name,brands,nutriments,serving_quantity`,
      { headers: { 'User-Agent': 'BlueprintTracker/1.0 (personal fitness app)' } }
    );
    if (!offRes.ok) throw new Error('OFF failed');
    const data = await offRes.json();
    const products = (data.products || [])
      .filter(p => p.product_name && p.nutriments && p.nutriments['energy-kcal_100g'] != null)
      .slice(0, 8);
    return res.status(200).json({ products, source: 'off' });
  } catch (err) {
    return res.status(500).json({ error: 'Both food APIs failed', detail: err.message });
  }
}
