export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  const { q } = req.query;
  if (!q || q.trim().length < 2) {
    return res.status(400).json({ error: 'Query too short' });
  }

  // USDA FoodData Central — branded + foundation foods
  try {
    const usdaRes = await fetch(
      `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(q)}&pageSize=12&api_key=DEMO_KEY`,
      { headers: { 'Content-Type': 'application/json' } }
    );
    if (usdaRes.ok) {
      const data = await usdaRes.json();
      const foods = (data.foods || [])
        .filter(f => f.description)
        .slice(0, 10)
        .map(f => {
          const n = {};
          (f.foodNutrients || []).forEach(fn => {
            const name = (fn.nutrientName || fn.name || '').toLowerCase();
            const val  = fn.value ?? fn.amount ?? 0;
            if ((name.includes('energy') || name === 'energy (atwater general factors)') && !name.includes('kj')) {
              if (!n['energy-kcal_100g'] || val > 0) n['energy-kcal_100g'] = val;
            }
            if (name === 'protein') n['proteins_100g'] = val;
            if (name.includes('carbohydrate, by difference') || name === 'carbohydrates') n['carbohydrates_100g'] = val;
            if (name === 'total lipid (fat)' || name === 'fat') n['fat_100g'] = val;
            if (name.includes('fiber, total dietary') || name.includes('fiber')) n['fiber_100g'] = val;
            if (name.includes('sugars, total') || name === 'sugars') n['sugars_100g'] = val;
          });
          // fallback: grab any carb field
          if (!n['carbohydrates_100g']) {
            const carbEntry = (f.foodNutrients || []).find(fn =>
              (fn.nutrientName || fn.name || '').toLowerCase().includes('carbohydrate')
            );
            if (carbEntry) n['carbohydrates_100g'] = carbEntry.value ?? carbEntry.amount ?? 0;
          }
          return {
            product_name: f.description,
            brands: f.brandOwner || f.brandName || f.publishedDate || '',
            nutriments: n,
            serving_quantity: f.servingSize || null,
          };
        })
        .filter(p => (p.nutriments['energy-kcal_100g'] ?? 0) > 0);

      if (foods.length > 0) {
        return res.status(200).json({ products: foods, source: 'usda' });
      }
    }
  } catch (e) {
    console.error('USDA error:', e.message);
  }

  // Fallback: Open Food Facts
  try {
    const offRes = await fetch(
      `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(q)}&search_simple=1&action=process&json=1&page_size=10&fields=product_name,brands,nutriments,serving_quantity&lc=en`,
      { headers: { 'User-Agent': 'BlueprintTracker/1.0' } }
    );
    if (!offRes.ok) throw new Error('OFF failed');
    const data = await offRes.json();
    const products = (data.products || [])
      .filter(p =>
        p.product_name &&
        p.nutriments &&
        (p.nutriments['energy-kcal_100g'] ?? 0) > 0 &&
        /^[a-zA-Z]/.test(p.product_name)   // filter out non-English results
      )
      .slice(0, 8);
    return res.status(200).json({ products, source: 'off' });
  } catch (err) {
    return res.status(500).json({ error: 'Search unavailable', detail: err.message });
  }
}
