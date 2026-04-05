import { useState, useRef, useEffect } from 'react';

// ─── API — calls our own Vercel proxy (avoids CORS) ─────────────
const searchFood = async (query) => {
  const res = await fetch(`/api/food-search?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error(`Proxy error ${res.status}`);
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data.products || [];
};

const safe = (val) => { const n = parseFloat(val); return isNaN(n) ? 0 : n; };

const getMacros = (nutriments, grams) => {
  const n = nutriments || {};
  const s = safe(grams) / 100;
  return {
    cal:     Math.round(safe(n['energy-kcal_100g']) * s),
    carbs:   parseFloat((safe(n['carbohydrates_100g']) * s).toFixed(1)),
    protein: parseFloat((safe(n['proteins_100g']) * s).toFixed(1)),
    fats:    parseFloat((safe(n['fat_100g']) * s).toFixed(1)),
    sugar:   parseFloat((safe(n['sugars_100g']) * s).toFixed(1)),
    fiber:   parseFloat((safe(n['fiber_100g']) * s).toFixed(1)),
  };
};

function MacroPill({ label, val, color, unit = 'g' }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:2, flex:1 }}>
      <span style={{ fontSize:15, fontWeight:800, color }}>{val}{unit}</span>
      <span style={{ fontSize:9, color:'var(--txt3)', textTransform:'uppercase', letterSpacing:'.4px', fontWeight:600 }}>{label}</span>
    </div>
  );
}

function BudgetBar({ label, used, budget, color }) {
  const pct = budget > 0 ? Math.min(100, Math.round((used / budget) * 100)) : 0;
  const over = used > budget;
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:5 }}>
      <span style={{ fontSize:11, color:'var(--txt3)', width:52, flexShrink:0 }}>{label}</span>
      <div style={{ flex:1, height:5, background:'var(--bg4)', borderRadius:3, overflow:'hidden' }}>
        <div style={{ height:'100%', width:`${pct}%`, background: over ? '#E94560' : color, borderRadius:3, transition:'width .3s' }} />
      </div>
      <span style={{ fontSize:11, color: over ? '#E94560' : 'var(--txt3)', width:60, textAlign:'right', flexShrink:0 }}>
        {used}g / {budget}g
      </span>
    </div>
  );
}

export function FoodSearch({ mealKey, mealLabel, dayData, onUpdate, macroTargets, alreadyLoggedMacros }) {
  const [open,     setOpen]     = useState(false);
  const [query,    setQuery]    = useState('');
  const [results,  setResults]  = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [selected, setSelected] = useState(null);
  const [grams,    setGrams]    = useState('100');
  const [error,    setError]    = useState('');
  const inputRef = useRef(null);
  const timerRef = useRef(null);

  const safeDay     = dayData || {};
  const safeTargets = macroTargets || { carbs: 175, protein: 175, fats: 70 };
  const safeLogged  = alreadyLoggedMacros || { carbs: 0, protein: 0, fats: 0 };
  const customFoods = ((safeDay.customFoods || {})[mealKey]) || [];

  useEffect(() => { if (open && inputRef.current) inputRef.current.focus(); }, [open]);
  useEffect(() => () => clearTimeout(timerRef.current), []);

  const doSearch = (q) => {
    setError('');
    if (!q || q.trim().length < 2) { setResults([]); setLoading(false); return; }
    setLoading(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      try {
        const r = await searchFood(q);
        setResults(r);
        if (r.length === 0) setError('No results. Try a different term.');
      } catch { setError('Search failed — check your connection.'); setResults([]); }
      finally { setLoading(false); }
    }, 500);
  };

  const selectFood = (p) => {
    setSelected(p);
    const parsed = parseFloat(p.serving_quantity);
    setGrams(!isNaN(parsed) && parsed > 0 ? String(Math.round(parsed)) : '100');
  };

  const logFood = () => {
    try {
      if (!selected || !selected.nutriments) return;
      const g = parseFloat(grams);
      if (!g || g <= 0 || isNaN(g)) return;
      const macros = getMacros(selected.nutriments, g);
      const entry = {
        id: Date.now(),
        name: String(selected.product_name || 'Unknown food'),
        brand: String(selected.brands || ''),
        grams: g,
        cal: macros.cal,
        carbs: macros.carbs,
        protein: macros.protein,
        fats: macros.fats,
        sugar: macros.sugar,
        fiber: macros.fiber,
      };
      const prevList   = ((safeDay.customFoods || {})[mealKey]) || [];
      const nextCustom = { ...(safeDay.customFoods || {}), [mealKey]: [...prevList, entry] };
      onUpdate({ ...safeDay, customFoods: nextCustom });
      setQuery(''); setResults([]); setSelected(null); setGrams('100'); setOpen(false); setError('');
    } catch (err) {
      setError('Could not save — please try again.');
      console.error('logFood error:', err);
    }
  };

  const removeFood = (id) => {
    const updated    = customFoods.filter(f => f.id !== id);
    const nextCustom = { ...(safeDay.customFoods || {}), [mealKey]: updated };
    onUpdate({ ...safeDay, customFoods: nextCustom });
  };

  const closeSearch = () => { setOpen(false); setSelected(null); setResults([]); setQuery(''); setError(''); };

  const gramsNum    = parseFloat(grams) || 100;
  const preview     = selected ? getMacros(selected.nutriments || {}, gramsNum) : null;
  const totalCarbs   = safe(safeLogged.carbs)   + safe(preview?.carbs);
  const totalProtein = safe(safeLogged.protein)  + safe(preview?.protein);
  const totalFats    = safe(safeLogged.fats)     + safe(preview?.fats);
  const overCarbs    = totalCarbs   > safeTargets.carbs;
  const overProtein  = totalProtein > safeTargets.protein;
  const overFats     = totalFats    > safeTargets.fats;
  const anyOver      = overCarbs || overProtein || overFats;
  const verdictText  = overCarbs
    ? `⚠️ ${Math.round(totalCarbs - safeTargets.carbs)}g over carb target`
    : overFats
    ? `⚠️ ${Math.round(totalFats - safeTargets.fats)}g over fat target`
    : overProtein
    ? `⚠️ ${Math.round(totalProtein - safeTargets.protein)}g over protein target`
    : '✓ Fits within your daily targets';

  return (
    <div className="food-search-wrap">
      {customFoods.length > 0 && (
        <div className="custom-foods-list">
          {customFoods.map(f => (
            <div key={f.id} className="custom-food-item">
              <div className="cf-main">
                <span className="cf-name">{f.name}</span>
                <span className="cf-grams">{f.grams}g</span>
              </div>
              <div className="cf-macros">
                <span style={{ color:'#f59e0b' }}>{f.cal} cal</span>
                <span style={{ color:'#E94560' }}>{f.carbs}C</span>
                <span style={{ color:'#10B981' }}>{f.protein}P</span>
                <span style={{ color:'#6C63FF' }}>{f.fats}F</span>
                <button className="cf-del" onClick={() => removeFood(f.id)}>✕</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!open ? (
        <button className="food-search-btn" onClick={() => setOpen(true)}>
          <span style={{ fontSize:16 }}>🔍</span> Search &amp; check food macros
        </button>
      ) : (
        <div className="food-search-panel">
          <div className="fs-input-row">
            <input ref={inputRef} className="fs-input" placeholder="Type a food name (e.g. banana, greek yogurt…)" value={query} onChange={e => { setQuery(e.target.value); doSearch(e.target.value); }} />
            <button className="fs-close-btn" onClick={closeSearch}>✕</button>
          </div>

          {loading && <div className="fs-status">Searching…</div>}
          {error   && !selected && <div className="fs-status" style={{ color:'#E94560' }}>{error}</div>}

          {!selected && results.length > 0 && (
            <div className="fs-results">
              {results.map((p, i) => {
                const n = p.nutriments || {};
                return (
                  <div key={i} className="fs-result-item" onClick={() => selectFood(p)}>
                    <div className="fs-result-name">{p.product_name}</div>
                    {p.brands && <div className="fs-result-brand">{p.brands}</div>}
                    <div className="fs-result-macros">
                      <span>{Math.round(safe(n['energy-kcal_100g']))} cal</span>
                      <span style={{ color:'#E94560' }}>{Math.round(safe(n['carbohydrates_100g']))}C</span>
                      <span style={{ color:'#10B981' }}>{Math.round(safe(n['proteins_100g']))}P</span>
                      <span style={{ color:'#6C63FF' }}>{Math.round(safe(n['fat_100g']))}F</span>
                      <span style={{ color:'var(--txt3)', fontSize:10 }}>per 100g</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {selected && preview && (
            <div className="fs-calculator">
              <div className="fs-calc-header">
                <div style={{ flex:1, minWidth:0 }}>
                  <div className="fs-calc-name">{selected.product_name}</div>
                  {selected.brands && <div className="fs-calc-brand">{selected.brands}</div>}
                </div>
                <button className="fs-back-btn" onClick={() => { setSelected(null); setGrams('100'); }}>← Back</button>
              </div>

              <div className="fs-grams-row">
                <span className="fs-grams-label">Quantity</span>
                <input type="range" min="10" max="500" step="5" value={gramsNum} onChange={e => setGrams(e.target.value)} className="fs-slider" />
                <div className="fs-grams-input-wrap">
                  <input type="number" className="fs-grams-input" value={grams} onChange={e => setGrams(e.target.value)} min="1" max="2000" />
                  <span className="fs-grams-unit">g</span>
                </div>
              </div>

              <div className="fs-macro-row">
                <MacroPill label="Calories" val={preview.cal}     color="#f59e0b" unit="" />
                <div style={{ width:1, background:'var(--bdr)' }} />
                <MacroPill label="Carbs"    val={preview.carbs}   color="#E94560" />
                <div style={{ width:1, background:'var(--bdr)' }} />
                <MacroPill label="Protein"  val={preview.protein} color="#10B981" />
                <div style={{ width:1, background:'var(--bdr)' }} />
                <MacroPill label="Fats"     val={preview.fats}    color="#6C63FF" />
              </div>

              {(preview.sugar > 0 || preview.fiber > 0) && (
                <div className="fs-extra-macros">
                  {preview.sugar > 0 && <span>Sugar: <strong style={{ color: preview.sugar > 15 ? '#E94560' : 'var(--txt2)' }}>{preview.sugar}g</strong></span>}
                  {preview.fiber > 0 && <span>Fibre: <strong style={{ color:'#10B981' }}>{preview.fiber}g</strong></span>}
                </div>
              )}

              <div className="fs-budget">
                <div className="fs-budget-title">Daily macro impact</div>
                <BudgetBar label="Carbs"   used={Math.round(totalCarbs)}   budget={safeTargets.carbs}   color="#E94560" />
                <BudgetBar label="Protein" used={Math.round(totalProtein)} budget={safeTargets.protein} color="#10B981" />
                <BudgetBar label="Fats"    used={Math.round(totalFats)}    budget={safeTargets.fats}    color="#6C63FF" />
              </div>

              <div className={`fs-verdict ${anyOver ? 'verdict-warn' : 'verdict-ok'}`}>{verdictText}</div>

              {error && <div className="fs-status" style={{ color:'#E94560' }}>{error}</div>}

              <div className="fs-action-row">
                <button className="fs-cancel-btn" onClick={() => { setSelected(null); setGrams('100'); }}>Cancel</button>
                <button className="fs-log-btn" onClick={logFood}>Add to {mealLabel}</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
