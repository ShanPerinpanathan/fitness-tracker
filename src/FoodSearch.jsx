import { useState, useRef, useEffect } from 'react';

// ─── Open Food Facts search ──────────────────────────────────────
const searchFood = async (query) => {
  const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=10&fields=product_name,brands,nutriments,serving_size,serving_quantity,image_small_url`;
  const res = await fetch(url);
  const data = await res.json();
  return (data.products || []).filter(p =>
    p.product_name &&
    p.nutriments &&
    (p.nutriments['energy-kcal_100g'] || p.nutriments['energy_100g'])
  ).slice(0, 8);
};

const getMacros = (p, grams) => {
  const n = p.nutriments;
  const scale = grams / 100;
  return {
    cal:     Math.round((n['energy-kcal_100g'] || n['energy-kcal'] || 0) * scale),
    protein: parseFloat(((n['proteins_100g'] || 0) * scale).toFixed(1)),
    carbs:   parseFloat(((n['carbohydrates_100g'] || 0) * scale).toFixed(1)),
    fats:    parseFloat(((n['fat_100g'] || 0) * scale).toFixed(1)),
    fiber:   parseFloat(((n['fiber_100g'] || 0) * scale).toFixed(1)),
    sugar:   parseFloat(((n['sugars_100g'] || 0) * scale).toFixed(1)),
  };
};

// ─── Macro pill ──────────────────────────────────────────────────
function MacroPill({ label, val, color, unit = 'g' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, flex: 1 }}>
      <span style={{ fontSize: 15, fontWeight: 800, color }}>{val}{unit}</span>
      <span style={{ fontSize: 9, color: 'var(--txt3)', textTransform: 'uppercase', letterSpacing: '.4px', fontWeight: 600 }}>{label}</span>
    </div>
  );
}

// ─── Budget bar — shows how much of daily target this food uses ──
function BudgetBar({ label, used, budget, color }) {
  const pct = Math.min(100, Math.round((used / budget) * 100));
  const over = used > budget;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
      <span style={{ fontSize: 11, color: 'var(--txt3)', width: 52, flexShrink: 0 }}>{label}</span>
      <div style={{ flex: 1, height: 5, background: 'var(--bg4)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: over ? '#E94560' : color, borderRadius: 3, transition: 'width .3s' }} />
      </div>
      <span style={{ fontSize: 11, color: over ? '#E94560' : 'var(--txt3)', width: 60, textAlign: 'right', flexShrink: 0 }}>
        {used}g / {budget}g
      </span>
    </div>
  );
}

// ─── FoodSearch component ────────────────────────────────────────
export function FoodSearch({ mealKey, mealLabel, dayData, onUpdate, macroTargets, alreadyLoggedMacros }) {
  const [open, setOpen]       = useState(false);
  const [query, setQuery]     = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [grams, setGrams]     = useState('100');
  const [error, setError]     = useState('');
  const inputRef = useRef(null);
  const debounce = useRef(null);

  // Custom foods already logged for this meal
  const customFoods = dayData?.customFoods?.[mealKey] || [];

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  const doSearch = (q) => {
    if (!q.trim() || q.length < 2) { setResults([]); return; }
    setLoading(true); setError('');
    clearTimeout(debounce.current);
    debounce.current = setTimeout(async () => {
      try {
        const r = await searchFood(q);
        setResults(r);
        if (r.length === 0) setError('No results found. Try a different search term.');
      } catch {
        setError('Search failed. Check your connection and try again.');
      } finally { setLoading(false); }
    }, 500);
  };

  const selectFood = (p) => {
    setSelected(p);
    // Default grams to serving size if available
    const serving = p.serving_quantity || p.nutriments?.serving_size || 100;
    const parsed = parseFloat(serving);
    setGrams(isNaN(parsed) || parsed <= 0 ? '100' : String(Math.round(parsed)));
  };

  const logFood = () => {
    if (!selected) return;
    const g = parseFloat(grams);
    if (!g || g <= 0) return;
    const macros = getMacros(selected, g);
    const entry = {
      id: Date.now(),
      name: selected.product_name,
      brand: selected.brands || '',
      grams: g,
      ...macros,
    };
    const existing = dayData?.customFoods?.[mealKey] || [];
    onUpdate({
      ...dayData,
      customFoods: {
        ...dayData?.customFoods,
        [mealKey]: [...existing, entry],
      }
    });
    // Reset
    setQuery(''); setResults([]); setSelected(null); setGrams('100'); setOpen(false);
  };

  const removeFood = (id) => {
    const updated = customFoods.filter(f => f.id !== id);
    onUpdate({ ...dayData, customFoods: { ...dayData?.customFoods, [mealKey]: updated } });
  };

  const preview = selected ? getMacros(selected, parseFloat(grams) || 100) : null;

  // Total macros already eaten today (blueprint + custom)
  const totalCarbs   = (alreadyLoggedMacros?.carbs   || 0) + (preview?.carbs   || 0);
  const totalProtein = (alreadyLoggedMacros?.protein || 0) + (preview?.protein || 0);
  const totalFats    = (alreadyLoggedMacros?.fats    || 0) + (preview?.fats    || 0);

  return (
    <div className="food-search-wrap">
      {/* Logged custom foods for this meal */}
      {customFoods.length > 0 && (
        <div className="custom-foods-list">
          {customFoods.map(f => (
            <div key={f.id} className="custom-food-item">
              <div className="cf-main">
                <span className="cf-name">{f.name}</span>
                <span className="cf-grams">{f.grams}g</span>
              </div>
              <div className="cf-macros">
                <span style={{ color: '#f59e0b' }}>{f.cal} cal</span>
                <span style={{ color: '#E94560' }}>{f.carbs}C</span>
                <span style={{ color: '#10B981' }}>{f.protein}P</span>
                <span style={{ color: '#6C63FF' }}>{f.fats}F</span>
                <button className="cf-del" onClick={() => removeFood(f.id)}>✕</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Search toggle button */}
      {!open ? (
        <button className="food-search-btn" onClick={() => setOpen(true)}>
          <span style={{ fontSize: 16 }}>🔍</span> Search & check food macros
        </button>
      ) : (
        <div className="food-search-panel">
          {/* Search input */}
          <div className="fs-input-row">
            <input
              ref={inputRef}
              className="fs-input"
              placeholder="Search any food (e.g. banana, greek yogurt...)"
              value={query}
              onChange={e => { setQuery(e.target.value); doSearch(e.target.value); }}
            />
            <button className="fs-close-btn" onClick={() => { setOpen(false); setSelected(null); setResults([]); setQuery(''); }}>✕</button>
          </div>

          {/* Loading */}
          {loading && <div className="fs-status">Searching…</div>}
          {error && <div className="fs-status" style={{ color: '#E94560' }}>{error}</div>}

          {/* Results list */}
          {!selected && results.length > 0 && (
            <div className="fs-results">
              {results.map((p, i) => {
                const n = p.nutriments;
                const cal = Math.round(n['energy-kcal_100g'] || n['energy-kcal'] || 0);
                const prot = Math.round(n['proteins_100g'] || 0);
                const carb = Math.round(n['carbohydrates_100g'] || 0);
                const fat  = Math.round(n['fat_100g'] || 0);
                return (
                  <div key={i} className="fs-result-item" onClick={() => selectFood(p)}>
                    <div className="fs-result-name">{p.product_name}</div>
                    {p.brands && <div className="fs-result-brand">{p.brands}</div>}
                    <div className="fs-result-macros">
                      <span>{cal} cal</span>
                      <span style={{ color: '#E94560' }}>{carb}C</span>
                      <span style={{ color: '#10B981' }}>{prot}P</span>
                      <span style={{ color: '#6C63FF' }}>{fat}F</span>
                      <span style={{ color: 'var(--txt3)', fontSize: 10 }}>per 100g</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Selected food — macro calculator */}
          {selected && preview && (
            <div className="fs-calculator">
              <div className="fs-calc-header">
                <div>
                  <div className="fs-calc-name">{selected.product_name}</div>
                  {selected.brands && <div className="fs-calc-brand">{selected.brands}</div>}
                </div>
                <button className="fs-back-btn" onClick={() => setSelected(null)}>← Back</button>
              </div>

              {/* Grams slider + input */}
              <div className="fs-grams-row">
                <span className="fs-grams-label">Quantity</span>
                <input
                  type="range"
                  min="10" max="500" step="5"
                  value={parseFloat(grams) || 100}
                  onChange={e => setGrams(e.target.value)}
                  className="fs-slider"
                />
                <div className="fs-grams-input-wrap">
                  <input
                    type="number"
                    className="fs-grams-input"
                    value={grams}
                    onChange={e => setGrams(e.target.value)}
                    min="1" max="1000"
                  />
                  <span className="fs-grams-unit">g</span>
                </div>
              </div>

              {/* Macro display */}
              <div className="fs-macro-row">
                <MacroPill label="Calories" val={preview.cal} color="#f59e0b" unit="" />
                <div style={{ width: 1, background: 'var(--bdr)' }} />
                <MacroPill label="Carbs"   val={preview.carbs}   color="#E94560" />
                <div style={{ width: 1, background: 'var(--bdr)' }} />
                <MacroPill label="Protein" val={preview.protein} color="#10B981" />
                <div style={{ width: 1, background: 'var(--bdr)' }} />
                <MacroPill label="Fats"    val={preview.fats}    color="#6C63FF" />
              </div>

              {preview.sugar > 0 && (
                <div className="fs-extra-macros">
                  <span>Sugar: <strong style={{ color: preview.sugar > 15 ? '#E94560' : 'var(--txt2)' }}>{preview.sugar}g</strong></span>
                  {preview.fiber > 0 && <span>Fibre: <strong style={{ color: '#10B981' }}>{preview.fiber}g</strong></span>}
                </div>
              )}

              {/* Budget impact — shows how this food affects daily targets */}
              <div className="fs-budget">
                <div className="fs-budget-title">Daily macro impact</div>
                <BudgetBar label="Carbs"   used={Math.round(totalCarbs)}   budget={macroTargets.carbs}   color="#E94560" />
                <BudgetBar label="Protein" used={Math.round(totalProtein)} budget={macroTargets.protein} color="#10B981" />
                <BudgetBar label="Fats"    used={Math.round(totalFats)}    budget={macroTargets.fats}    color="#6C63FF" />
              </div>

              {/* Verdict */}
              <div className={`fs-verdict ${totalCarbs > macroTargets.carbs || totalProtein > macroTargets.protein || totalFats > macroTargets.fats ? 'verdict-warn' : 'verdict-ok'}`}>
                {totalCarbs > macroTargets.carbs
                  ? `⚠️ This puts you ${Math.round(totalCarbs - macroTargets.carbs)}g over your carb target`
                  : totalFats > macroTargets.fats
                  ? `⚠️ This puts you ${Math.round(totalFats - macroTargets.fats)}g over your fat target`
                  : `✓ Fits within your daily ${getMealType ? 'targets' : 'macros'}`}
              </div>

              <div className="fs-action-row">
                <button className="fs-cancel-btn" onClick={() => { setSelected(null); setResults([]); }}>Cancel</button>
                <button className="fs-log-btn" onClick={logFood}>Add to {mealLabel}</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
