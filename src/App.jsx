import { useState, useEffect, useCallback } from 'react';
import {
  SCHEDULE, WORKOUTS, MEALS, SUPPLEMENTS, MEAL_LABELS, ALL_EXERCISES,
  todayKey, getDayKey, getMealType, isRestDay
} from './data';
import { useDb } from './useDb';
import { FoodSearch } from './FoodSearch';
import './index.css';

// ─── Icons ───────────────────────────────────────────────────────
const IC = {
  check:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,
  dumbbell: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 4v16M18 4v16M6 8h12M6 16h12M2 8h4M2 16h4M18 8h4M18 16h4"/></svg>,
  food:     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>,
  pill:     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m10.5 20H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H20a2 2 0 0 1 2 2v3"/><circle cx="18" cy="18" r="4"/><path d="m15.5 15.5 5 5"/></svg>,
  scale:    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6l9 4 9-4M3 6v12l9 4 9-4V6"/></svg>,
  trend:    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>,
  run:      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="13" cy="4" r="2"/><path d="M7.5 16.5l2-4 3 3 2-5 3 1.5M4 19l4-8 2 3 3-6 2 2 4-4"/></svg>,
  bed:      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 4v16M2 8h20a2 2 0 0 1 2 2v10M2 16h20M22 12v8"/></svg>,
  plus:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  back:     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>,
  next:     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>,
  link:     <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
  flame:    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 17c1.4 0 2.5-1.1 2.5-2.5 0-1.4-.9-2.7-2.5-4-1.6 1.3-2.5 2.6-2.5 4zM12 2c0 5 4 7 4 12a4 4 0 0 1-8 0c0-5 4-7 4-12z"/></svg>,
  body:     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="4" r="2"/><path d="M12 8c-4 0-6 2-6 5v3h3l1 6h4l1-6h3v-3c0-3-2-5-6-5z"/></svg>,
  trash:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
  cloud:    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>,
  star:     <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  close:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
};

// ─── Daily calorie target (change this whenever you want) ────────
const CAL_TARGET = 1700;

const NAV = [
  { id: 'today',        icon: 'flame',    label: 'Today'    },
  { id: 'workout',      icon: 'dumbbell', label: 'Workout'  },
  { id: 'food',         icon: 'food',     label: 'Nutrition'},
  { id: 'supps',        icon: 'pill',     label: 'Supps'    },
  { id: 'weight',       icon: 'scale',    label: 'Weight'   },
  { id: 'measurements', icon: 'body',     label: 'Body'     },
  { id: 'progress',     icon: 'trend',    label: 'Progress' },
];

// ─── Exercise Card ───────────────────────────────────────────────
function ExerciseCard({ ex, sets, onLogSet, expanded, onToggle }) {
  const [imgErr, setImgErr] = useState(false);
  const logged = sets ? sets.filter(Boolean).length : 0;
  const done = logged >= ex.sets;
  return (
    <div className={`ex-card ${done ? 'done' : ''}`} onClick={onToggle}>
      <div className="ex-header">
        <div className="ex-img">
          {!imgErr
            ? <img src={ex.img} alt={ex.name} onError={() => setImgErr(true)} loading="lazy" />
            : <div className="ex-img-fallback">{IC.dumbbell}</div>}
        </div>
        <div className="ex-info">
          <div className="ex-name">{ex.name}</div>
          <div className="ex-muscles">{ex.muscles}</div>
          <div className="ex-meta">
            <span>{ex.sets} sets</span><span>{ex.reps}</span><span>{ex.rest}</span>
          </div>
        </div>
        <div className={`ex-badge ${done ? 'badge-done' : ''}`}>
          {done ? IC.check : `${logged}/${ex.sets}`}
        </div>
      </div>
      {expanded && (
        <div className="ex-body" onClick={e => e.stopPropagation()}>
          <div className="ex-note">💡 {ex.notes}</div>
          <a href={ex.url} target="_blank" rel="noreferrer" className="ex-link">{IC.link} View on LiftManual</a>
          <div className="set-grid">
            {Array.from({ length: ex.sets }).map((_, i) => (
              <div key={i} className={`set-btn ${sets?.[i] ? 'set-done' : ''}`} onClick={() => onLogSet(i)}>
                {sets?.[i] ? IC.check : `Set ${i + 1}`}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Bonus Logger (rest day / extra activity) ────────────────────
function BonusLogger({ dayData, onUpdate }) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState('cardio');
  const [name, setName] = useState('');
  const [detail, setDetail] = useState('');

  const bonus = dayData?.bonus || [];

  const add = () => {
    if (!name.trim()) return;
    const entry = { id: Date.now(), type, name: name.trim(), detail: detail.trim(), ts: new Date().toISOString() };
    onUpdate({ ...dayData, bonus: [...bonus, entry] });
    setName(''); setDetail(''); setOpen(false);
  };

  const remove = (id) => onUpdate({ ...dayData, bonus: bonus.filter(b => b.id !== id) });

  return (
    <div className="bonus-section">
      <div className="bonus-header">
        <span className="bonus-title">Bonus Activity</span>
        <button className="add-bonus-btn" onClick={() => setOpen(!open)}>{IC.plus} Log Extra</button>
      </div>

      {bonus.length > 0 && (
        <div className="bonus-list">
          {bonus.map(b => (
            <div key={b.id} className="bonus-item">
              <span className={`bonus-type-badge type-${b.type}`}>{b.type}</span>
              <span className="bonus-name">{b.name}</span>
              {b.detail && <span className="bonus-detail">{b.detail}</span>}
              <button className="bonus-del" onClick={() => remove(b.id)}>{IC.trash}</button>
            </div>
          ))}
        </div>
      )}

      {open && (
        <div className="bonus-form">
          <div className="bonus-type-row">
            {['cardio','workout','stretch','other'].map(t => (
              <button key={t} className={`type-pill ${type === t ? 'active' : ''}`} onClick={() => setType(t)}>{t}</button>
            ))}
          </div>
          <input className="bonus-input" placeholder="Activity name (e.g. Incline Walk, Push-ups)" value={name} onChange={e => setName(e.target.value)} />
          <input className="bonus-input" placeholder="Detail (e.g. 30 min, 3x15, optional)" value={detail} onChange={e => setDetail(e.target.value)} />
          <div className="bonus-actions">
            <button className="btn-cancel" onClick={() => setOpen(false)}>Cancel</button>
            <button className="btn-save" onClick={add}>Save</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Progress Tab ────────────────────────────────────────────────
function ProgressTab({ db }) {
  const [history, setHistory] = useState([]);
  const [weights, setWeights] = useState([]);

  useEffect(() => {
    db.loadHistory().then(setHistory);
    db.loadWeights().then(setWeights);
  }, []);

  const last30 = (() => {
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const date = d.toISOString().split('T')[0];
      const dow = d.getDay();
      const sched = SCHEDULE[dow];
      const rec = history.find(h => h.date === date);
      const dayData = rec?.data || {};
      const dayKey = getDayKey(date);
      const workout = dayKey ? WORKOUTS[dayKey] : null;

      let workoutScore = null;
      if (workout) {
        const total = workout.exercises.reduce((a, ex) => a + ex.sets, 0);
        const done  = workout.exercises.reduce((acc, ex) => acc + (dayData?.exercises?.[ex.id] || []).filter(Boolean).length, 0);
        workoutScore = total > 0 ? Math.round((done / total) * 100) : 0;
      }
      const allMeals = MEALS[getMealType(date)];
      const totalMeals = Object.values(allMeals.meals).flat().length;
      const doneMeals  = Object.values(dayData?.meals || {}).filter(Boolean).length;
      const mealScore  = Math.round((doneMeals / totalMeals) * 100);
      const allSupps = Object.values(SUPPLEMENTS).flatMap(g => g.items).length;
      const doneSupps  = Object.values(dayData?.supps || {}).filter(Boolean).length;
      const suppScore  = Math.round((doneSupps / allSupps) * 100);
      const hasBonus   = (dayData?.bonus || []).length > 0;

      days.push({ date, dow, sched, workoutScore, mealScore, suppScore, hasBonus, isToday: date === todayKey() });
    }
    return days;
  })();

  const workoutDays = last30.filter(d => d.sched.type === 'workout' || d.sched.type === 'cardio');
  const completedWorkouts = workoutDays.filter(d => (d.workoutScore || 0) >= 80).length;
  const streak = (() => {
    let s = 0;
    for (let i = last30.length - 1; i >= 0; i--) {
      const d = last30[i];
      if (d.isToday && d.workoutScore === null) continue;
      if ((d.workoutScore || 0) >= 80 || d.sched.type === 'rest') s++;
      else break;
    }
    return s;
  })();

  const avgMeal = Math.round(last30.reduce((a, d) => a + d.mealScore, 0) / last30.length);
  const avgSupp = Math.round(last30.reduce((a, d) => a + d.suppScore, 0) / last30.length);

  const startWeight = 187;
  const latest = weights[0]?.weight;
  const lost = latest ? (startWeight - latest) : null;

  return (
    <div className="tab-content">
      <div className="section-header"><div className="section-title">Progress</div><div className="section-sub">Last 30 days</div></div>

      <div className="stat-grid">
        <div className="stat-card"><div className="stat-val" style={{ color: '#E94560' }}>{streak}</div><div className="stat-lbl">Day streak</div></div>
        <div className="stat-card"><div className="stat-val" style={{ color: '#10B981' }}>{completedWorkouts}/{workoutDays.length}</div><div className="stat-lbl">Workouts hit</div></div>
        <div className="stat-card"><div className="stat-val" style={{ color: '#6C63FF' }}>{avgMeal}%</div><div className="stat-lbl">Avg nutrition</div></div>
        <div className="stat-card"><div className="stat-val" style={{ color: '#f59e0b' }}>{avgSupp}%</div><div className="stat-lbl">Avg supps</div></div>
      </div>

      {lost !== null && (
        <div className="weight-progress-card">
          <div className="wp-row">
            <div className="wp-item"><div className="wp-val">{startWeight} lbs</div><div className="wp-lbl">Start</div></div>
            <div className="wp-arrow">→</div>
            <div className="wp-item"><div className="wp-val">{latest} lbs</div><div className="wp-lbl">Current</div></div>
            <div className="wp-arrow">→</div>
            <div className="wp-item">
              <div className="wp-val" style={{ color: lost > 0 ? '#10B981' : '#E94560' }}>
                {lost > 0 ? `−${lost.toFixed(1)}` : `+${Math.abs(lost).toFixed(1)}`} lbs
              </div>
              <div className="wp-lbl">Lost</div>
            </div>
          </div>
          <div className="goal-bar-wrap">
            <div className="goal-bar" style={{ width: `${Math.min(100, Math.max(0, (lost / 30) * 100)).toFixed(0)}%` }} />
          </div>
          <div className="goal-label">{lost > 0 ? lost.toFixed(1) : 0} / 30 lbs goal</div>
        </div>
      )}

      <div className="section-sub" style={{ marginTop: 8, marginBottom: 6 }}>Daily completion heatmap</div>
      <div className="heatmap">
        {last30.map((d, i) => {
          const dt = new Date(d.date + 'T12:00:00');
          const label = dt.toLocaleDateString('en-CA', { weekday: 'short', month: 'short', day: 'numeric' });
          let score = 0;
          let color = '#1a1a24';
          if (d.sched.type === 'rest' && !d.hasBonus) { color = '#222'; score = -1; }
          else if (d.sched.type === 'workout' || d.sched.type === 'cardio') {
            score = d.workoutScore || 0;
            color = score >= 80 ? '#10B981' : score >= 40 ? '#f59e0b' : score > 0 ? '#E94560' : '#1a1a24';
          }
          return (
            <div key={d.date} className="heat-cell" title={`${label}: ${score === -1 ? 'Rest' : score + '%'}`}
              style={{ background: color, opacity: d.isToday ? 1 : 0.85 }}>
              {d.hasBonus && <div className="heat-bonus" />}
            </div>
          );
        })}
      </div>
      <div className="heat-legend">
        <span style={{ color: '#10B981' }}>■</span> 80%+
        <span style={{ color: '#f59e0b' }}>■</span> 40–79%
        <span style={{ color: '#E94560' }}>■</span> &lt;40%
        <span style={{ color: '#333' }}>■</span> rest
      </div>

      <div className="section-sub" style={{ marginTop: 12, marginBottom: 6 }}>Weekly workout completion</div>
      <div className="weekly-bars">
        {Array.from({ length: 5 }, (_, wi) => {
          const weekDays = last30.slice(wi * 7, wi * 7 + 7);
          const wDays = weekDays.filter(d => d.sched.type !== 'rest');
          const pct = wDays.length > 0 ? Math.round(wDays.filter(d => (d.workoutScore || 0) >= 80).length / wDays.length * 100) : 0;
          const wStart = weekDays[0]?.date?.slice(5) || '';
          return (
            <div key={wi} className="weekly-bar-col">
              <div className="weekly-bar-bg">
                <div className="weekly-bar-fill" style={{ height: `${pct}%`, background: pct >= 80 ? '#10B981' : pct >= 50 ? '#f59e0b' : '#E94560' }} />
              </div>
              <div className="weekly-bar-pct">{pct}%</div>
              <div className="weekly-bar-lbl">{wStart}</div>
            </div>
          );
        })}
      </div>

      <div className="section-sub" style={{ marginTop: 12, marginBottom: 6 }}>Exercise history log</div>
      <div className="history-log">
        {history.slice(0, 30).map(h => {
          const dayKey = getDayKey(h.date);
          const workout = dayKey ? WORKOUTS[dayKey] : null;
          const bonus = h.data?.bonus || [];
          const dt = new Date(h.date + 'T12:00:00');
          const label = dt.toLocaleDateString('en-CA', { weekday: 'short', month: 'short', day: 'numeric' });
          if (!workout && bonus.length === 0) return null;
          let completedEx = [];
          if (workout) {
            completedEx = workout.exercises.filter(ex => {
              const s = h.data?.exercises?.[ex.id] || [];
              return s.filter(Boolean).length >= ex.sets;
            });
          }
          if (completedEx.length === 0 && bonus.length === 0) return null;
          return (
            <div key={h.date} className="log-entry">
              <div className="log-date">{label}</div>
              {workout && completedEx.length > 0 && (
                <div className="log-session">{workout.label} — {completedEx.length}/{workout.exercises.length} exercises complete</div>
              )}
              {completedEx.map(ex => (
                <div key={ex.id} className="log-ex"><span className="log-check">✓</span>{ex.name}</div>
              ))}
              {bonus.map(b => (
                <div key={b.id} className="log-ex bonus"><span className={`bonus-type-badge type-${b.type}`}>{b.type}</span>{b.name} {b.detail && `— ${b.detail}`}</div>
              ))}
            </div>
          );
        })}
        {history.length === 0 && <div className="empty-log">No history yet. Start logging your workouts!</div>}
      </div>
    </div>
  );
}

// ─── Navy Body Fat Formula (men) ─────────────────────────────────
// BF% = 86.010 × log10(waist − neck) − 70.041 × log10(height) + 36.76
const navyBF = ({ waist, neck, height }) => {
  if (!waist || !neck || !height) return null;
  const bf = 86.010 * Math.log10(waist - neck) - 70.041 * Math.log10(height) + 36.76;
  return Math.max(0, Math.min(60, parseFloat(bf.toFixed(1))));
};

const BF_FIELDS = [
  { key: 'waist',  label: 'Waist',       unit: 'in', hint: 'Narrowest point, exhale naturally' },
  { key: 'hips',   label: 'Hips',        unit: 'in', hint: 'Widest point' },
  { key: 'neck',   label: 'Neck',        unit: 'in', hint: 'Just below Adam\'s apple' },
  { key: 'chest',  label: 'Chest',       unit: 'in', hint: 'At nipple line, arms relaxed' },
  { key: 'arm',    label: 'Bicep (L)',   unit: 'in', hint: 'Flexed, at peak of bicep' },
  { key: 'thigh',  label: 'Thigh (L)',   unit: 'in', hint: 'Mid-thigh, standing relaxed' },
  { key: 'height', label: 'Height',      unit: 'in', hint: 'In inches — 5\'11\" = 71 in', fixed: 71 },
];

// Body fat category for men
const bfCategory = (bf) => {
  if (bf === null) return null;
  if (bf < 6)  return { label: 'Essential', color: '#6C63FF' };
  if (bf < 14) return { label: 'Athletic',  color: '#10B981' };
  if (bf < 18) return { label: 'Fit',       color: '#10B981' };
  if (bf < 25) return { label: 'Average',   color: '#f59e0b' };
  return               { label: 'Above avg',color: '#E94560' };
};

function MeasurementsTab({ db }) {
  const [measurements, setMeasurements] = useState([]);
  const [form, setForm]     = useState({ height: '71' });
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const today = todayKey();

  useEffect(() => {
    db.loadMeasurements().then(m => { setMeasurements(m); setLoaded(true); });
  }, []);

  // Pre-fill form with most recent entry
  useEffect(() => {
    if (measurements.length > 0) {
      const last = measurements[0];
      setForm({
        height: String(last.height || 71),
        waist:  last.waist  ? String(last.waist)  : '',
        hips:   last.hips   ? String(last.hips)   : '',
        neck:   last.neck   ? String(last.neck)   : '',
        chest:  last.chest  ? String(last.chest)  : '',
        arm:    last.arm    ? String(last.arm)     : '',
        thigh:  last.thigh  ? String(last.thigh)  : '',
      });
    }
  }, [measurements.length]);

  const save = async () => {
    if (!form.waist || !form.neck) return;
    setSaving(true);
    const entry = {
      date:   today,
      height: parseFloat(form.height) || 71,
      waist:  parseFloat(form.waist)  || null,
      hips:   parseFloat(form.hips)   || null,
      neck:   parseFloat(form.neck)   || null,
      chest:  parseFloat(form.chest)  || null,
      arm:    parseFloat(form.arm)    || null,
      thigh:  parseFloat(form.thigh)  || null,
    };
    const updated = await db.saveMeasurement(entry);
    setMeasurements(updated);
    setSaving(false);
  };

  const del = async (date) => {
    const updated = await db.deleteMeasurement(date);
    setMeasurements(updated);
  };

  const latest    = measurements[0] || null;
  const latestBF  = navyBF(latest || {});
  const startBF   = 28;
  const bfCat     = bfCategory(latestBF);

  // Build chart data — last 8 entries, oldest first
  const chartData = [...measurements].slice(0, 8).reverse();
  const bfPoints  = chartData.map(m => navyBF(m)).filter(v => v !== null);
  const bfMax     = bfPoints.length ? Math.max(...bfPoints, startBF) : startBF;
  const bfMin     = bfPoints.length ? Math.min(...bfPoints, 15)      : 15;
  const bfRange   = bfMax - bfMin || 5;

  return (
    <div className="tab-content">
      <div className="section-header">
        <div className="section-title">Body Measurements</div>
        <div className="section-sub">Measure weekly — same time, same conditions</div>
      </div>

      {/* Summary cards */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-val">{startBF}%</div>
          <div className="stat-lbl">Start BF%</div>
        </div>
        <div className="stat-card">
          <div className="stat-val" style={{ color: latestBF !== null ? bfCat?.color : 'var(--txt)' }}>
            {latestBF !== null ? `${latestBF}%` : '—'}
          </div>
          <div className="stat-lbl">Current BF%</div>
        </div>
        <div className="stat-card">
          <div className="stat-val" style={{ color: '#10B981' }}>15%</div>
          <div className="stat-lbl">Goal BF%</div>
        </div>
        <div className="stat-card">
          <div className="stat-val" style={{ color: latestBF !== null && latestBF < startBF ? '#10B981' : '#E94560' }}>
            {latestBF !== null ? `${(startBF - latestBF) > 0 ? '−' : '+'}${Math.abs(startBF - latestBF).toFixed(1)}%` : '—'}
          </div>
          <div className="stat-lbl">BF% Change</div>
        </div>
      </div>

      {/* BF% progress bar toward 15% goal */}
      {latestBF !== null && (
        <div className="bf-progress-card">
          <div className="bf-progress-header">
            <span className="bf-progress-label">Progress toward 15% goal</span>
            <span className="bf-cat-badge" style={{ background: bfCat?.color + '22', color: bfCat?.color }}>{bfCat?.label}</span>
          </div>
          <div className="bf-bar-track">
            <div className="bf-bar-fill" style={{ width: `${Math.min(100, Math.max(0, ((startBF - latestBF) / (startBF - 15)) * 100)).toFixed(0)}%` }} />
            <div className="bf-goal-marker" />
          </div>
          <div className="bf-bar-labels">
            <span>{startBF}% start</span>
            <span style={{ color: '#10B981' }}>15% goal</span>
          </div>
        </div>
      )}

      {/* Body fat chart */}
      {bfPoints.length > 1 && (
        <div className="chart-card">
          <div className="chart-label">Body fat % over time</div>
          <svg viewBox={`0 0 ${chartData.length * 60 + 20} 90`} style={{ width: '100%', overflow: 'visible' }}>
            {/* Goal line at 15% */}
            <line
              x1="10" y1={75 - ((15 - bfMin) / bfRange) * 55}
              x2={chartData.length * 60 + 10} y2={75 - ((15 - bfMin) / bfRange) * 55}
              stroke="#10B981" strokeWidth="1" strokeDasharray="4 3" opacity="0.5"
            />
            <text x="12" y={75 - ((15 - bfMin) / bfRange) * 55 - 4} fontSize="8" fill="#10B981" opacity="0.7">goal 15%</text>
            <polyline
              points={chartData.map((m, i) => {
                const bf = navyBF(m);
                if (bf === null) return null;
                return `${i * 60 + 20},${75 - ((bf - bfMin) / bfRange) * 55}`;
              }).filter(Boolean).join(' ')}
              fill="none" stroke="#6C63FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            />
            {chartData.map((m, i) => {
              const bf = navyBF(m);
              if (bf === null) return null;
              const x = i * 60 + 20, y = 75 - ((bf - bfMin) / bfRange) * 55;
              return (
                <g key={i}>
                  <circle cx={x} cy={y} r="4" fill="#6C63FF" />
                  <text x={x} y={y - 8} textAnchor="middle" fontSize="9" fill="#aaa">{bf}%</text>
                  <text x={x} y="85" textAnchor="middle" fontSize="7" fill="#666">{m.date.slice(5)}</text>
                </g>
              );
            })}
          </svg>
        </div>
      )}

      {/* Waist chart */}
      {chartData.filter(m => m.waist).length > 1 && (
        <div className="chart-card">
          <div className="chart-label">Waist circumference (in)</div>
          <svg viewBox={`0 0 ${chartData.length * 60 + 20} 70`} style={{ width: '100%', overflow: 'visible' }}>
            {(() => {
              const vals = chartData.map(m => m.waist).filter(Boolean);
              const mx = Math.max(...vals), mn = Math.min(...vals), rng = mx - mn || 2;
              return (
                <>
                  <polyline
                    points={chartData.map((m, i) => m.waist ? `${i * 60 + 20},${55 - ((m.waist - mn) / rng) * 40}` : null).filter(Boolean).join(' ')}
                    fill="none" stroke="#E94560" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  />
                  {chartData.map((m, i) => {
                    if (!m.waist) return null;
                    const x = i * 60 + 20, y = 55 - ((m.waist - mn) / rng) * 40;
                    return <g key={i}><circle cx={x} cy={y} r="4" fill="#E94560" /><text x={x} y={y - 7} textAnchor="middle" fontSize="9" fill="#aaa">{m.waist}"</text><text x={x} y="65" textAnchor="middle" fontSize="7" fill="#666">{m.date.slice(5)}</text></g>;
                  })}
                </>
              );
            })()}
          </svg>
        </div>
      )}

      {/* Log form */}
      <div className="meas-form">
        <div className="meas-form-title">Log measurements — {today}</div>
        <div className="meas-hint">All measurements in inches. Measure in the morning before eating.</div>
        <div className="meas-fields">
          {BF_FIELDS.map(f => (
            <div key={f.key} className="meas-field">
              <div className="meas-field-label">{f.label} <span className="meas-unit">({f.unit})</span></div>
              <div className="meas-hint-sm">{f.hint}</div>
              <input
                type="number"
                className="meas-input"
                placeholder={f.key === 'height' ? '71' : '0.0'}
                value={form[f.key] || ''}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                step="0.1"
                disabled={!!f.fixed}
              />
            </div>
          ))}
        </div>

        {/* Live BF% preview */}
        {form.waist && form.neck && form.height && (
          <div className="bf-preview">
            <span className="bf-preview-label">Estimated Body Fat</span>
            <span className="bf-preview-val" style={{ color: bfCategory(navyBF({ waist: parseFloat(form.waist), neck: parseFloat(form.neck), height: parseFloat(form.height) }))?.color }}>
              {navyBF({ waist: parseFloat(form.waist), neck: parseFloat(form.neck), height: parseFloat(form.height) })}%
            </span>
            <span className="bf-preview-method">US Navy formula</span>
          </div>
        )}

        <button className="meas-save-btn" onClick={save} disabled={!form.waist || !form.neck || saving}>
          {saving ? 'Saving…' : 'Save Measurements'}
        </button>
      </div>

      {/* History */}
      <div className="meal-group">
        <div className="meal-header">📋 History</div>
        {!loaded && <div className="empty-log">Loading…</div>}
        {loaded && measurements.length === 0 && <div className="empty-log">No entries yet. Log your first measurements above.</div>}
        {measurements.map((m, i) => {
          const bf = navyBF(m);
          const prev = measurements[i + 1];
          const prevBf = prev ? navyBF(prev) : null;
          const bfDelta = bf !== null && prevBf !== null ? (bf - prevBf).toFixed(1) : null;
          return (
            <div key={m.date} className="meas-history-row">
              <div className="meas-hist-header">
                <span className="meas-hist-date">{new Date(m.date + 'T12:00:00').toLocaleDateString('en-CA', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                {bf !== null && (
                  <span className="meas-hist-bf" style={{ color: bfCategory(bf)?.color }}>{bf}% BF
                    {bfDelta !== null && (
                      <span className={parseFloat(bfDelta) < 0 ? 'delta-good' : 'delta-bad'} style={{ fontSize: 11, marginLeft: 5 }}>
                        {parseFloat(bfDelta) < 0 ? '▼' : '▲'}{Math.abs(bfDelta)}%
                      </span>
                    )}
                  </span>
                )}
                <button className="w-del" onClick={() => del(m.date)}>{IC.trash}</button>
              </div>
              <div className="meas-hist-grid">
                {BF_FIELDS.filter(f => f.key !== 'height').map(f => m[f.key] ? (
                  <span key={f.key} className="meas-hist-item"><span className="meas-hist-key">{f.label}</span> {m[f.key]}"</span>
                ) : null)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Today Tab ───────────────────────────────────────────────────
function TodayTab({ date, dayData, onUpdate, sched, db }) {
  const dayKey = getDayKey(date);
  const workout = dayKey ? WORKOUTS[dayKey] : null;
  const mealType = getMealType(date);
  const meals = MEALS[mealType];
  const restDay = isRestDay(date);

  const totalEx = workout ? workout.exercises.reduce((a, ex) => a + ex.sets, 0) : 0;
  const doneEx  = workout ? workout.exercises.reduce((acc, ex) => acc + (dayData?.exercises?.[ex.id] || []).filter(Boolean).length, 0) : 0;
  const allMeals = Object.values(meals.meals).flat();
  const doneMeals = Object.values(dayData?.meals || {}).filter(Boolean).length;
  const allSupps = Object.values(SUPPLEMENTS).flatMap(g => g.items).length;
  const doneSupps = Object.values(dayData?.supps || {}).filter(Boolean).length;
  const pct = (n, t) => t > 0 ? Math.round((n / t) * 100) : 0;

  const fmtDate = d => new Date(d + 'T12:00:00').toLocaleDateString('en-CA', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="tab-content">
      <div className="today-hero">
        <div>
          <div className="today-date">{fmtDate(date)}</div>
          <div className="today-badge" style={{ background: sched.color }}>{sched.label}</div>
        </div>
        <div className="cloud-status">
          {IC.cloud}
          <span style={{ color: db.online ? '#10B981' : '#f59e0b' }}>{db.online ? 'Synced' : 'Local'}</span>
        </div>
      </div>

      <div className="prog-list">
        {workout && (
          <div className="prog-row">
            <span className="prog-lbl">Workout</span>
            <div className="prog-bar-bg"><div className="prog-bar-fill" style={{ width: `${pct(doneEx, totalEx)}%`, background: '#E94560' }} /></div>
            <span className="prog-val">{doneEx}/{totalEx}</span>
          </div>
        )}
        <div className="prog-row">
          <span className="prog-lbl">Nutrition</span>
          <div className="prog-bar-bg"><div className="prog-bar-fill" style={{ width: `${pct(doneMeals, allMeals.length)}%`, background: '#10B981' }} /></div>
          <span className="prog-val">{doneMeals}/{allMeals.length}</span>
        </div>
        <div className="prog-row">
          <span className="prog-lbl">Supplements</span>
          <div className="prog-bar-bg"><div className="prog-bar-fill" style={{ width: `${pct(doneSupps, allSupps)}%`, background: '#6C63FF' }} /></div>
          <span className="prog-val">{doneSupps}/{allSupps}</span>
        </div>
      </div>

      <div className="macro-bar">
        <div className="macro-item"><span className="macro-val">{meals.macros.carbs}g</span><span className="macro-lbl">Carbs</span></div>
        <div className="macro-div" />
        <div className="macro-item"><span className="macro-val">{meals.macros.protein}g</span><span className="macro-lbl">Protein</span></div>
        <div className="macro-div" />
        <div className="macro-item"><span className="macro-val">{meals.macros.fats}g</span><span className="macro-lbl">Fats</span></div>
        <div className="macro-div" />
        <div className="macro-item"><span className="macro-val" style={{ color: '#E94560', fontSize: 12 }}>{meals.label}</span><span className="macro-lbl">Plan</span></div>
      </div>

      {(sched.type === 'workout' || sched.type === 'cardio') && (
        <div className="cardio-row" onClick={() => onUpdate({ ...dayData, cardio: !dayData?.cardio })}>
          {IC.run}
          <div className="cardio-info">
            <div className="cardio-name">{sched.type === 'cardio' ? '45 min Cardio' : '20 min Post-Workout Cardio'}</div>
            <div className="cardio-spec">Incline 8.0 · Speed 2.0</div>
          </div>
          <div className={`cardio-check ${dayData?.cardio ? 'cardio-done' : ''}`}>{dayData?.cardio && IC.check}</div>
        </div>
      )}

      <BonusLogger dayData={dayData} onUpdate={onUpdate} />
    </div>
  );
}

// ─── Workout Tab ─────────────────────────────────────────────────
function WorkoutTab({ date, dayData, onUpdate, sched }) {
  const [expandedId, setExpandedId] = useState(null);
  const dayKey = getDayKey(date);
  const workout = dayKey ? WORKOUTS[dayKey] : null;

  const logSet = (exId, i) => {
    const curr = dayData?.exercises?.[exId] || [];
    const updated = [...curr];
    updated[i] = !updated[i];
    onUpdate({ ...dayData, exercises: { ...dayData?.exercises, [exId]: updated } });
  };

  if (!workout) return (
    <div className="tab-content">
      <div className="empty-state">{IC.bed}<h3>{sched.label}</h3><p>Rest day. Your muscles grow today.</p></div>
      <BonusLogger dayData={dayData} onUpdate={onUpdate} />
    </div>
  );

  return (
    <div className="tab-content">
      <div className="section-header"><div className="section-title">{workout.label}</div><div className="section-sub">{workout.muscles}</div></div>
      <div className="ex-list">
        {workout.exercises.map(ex => (
          <ExerciseCard key={ex.id} ex={ex} sets={dayData?.exercises?.[ex.id]}
            onLogSet={i => logSet(ex.id, i)} expanded={expandedId === ex.id}
            onToggle={() => setExpandedId(expandedId === ex.id ? null : ex.id)} />
        ))}
      </div>
      <div className="cardio-check-row" onClick={() => onUpdate({ ...dayData, cardio: !dayData?.cardio })}>
        <div className="cardio-check-left">
          <span style={{ color: '#6C63FF' }}>{IC.run}</span>
          <div>
            <div className="cardio-check-title">{sched.type === 'cardio' ? '45 min Cardio' : '20 min Post-Workout Cardio'}</div>
            <div className="cardio-check-spec">Incline 8.0 · Speed 2.0</div>
          </div>
        </div>
        <div className={`cardio-chk ${dayData?.cardio ? 'cardio-chk-done' : ''}`}>
          {dayData?.cardio && IC.check}
        </div>
      </div>
      <BonusLogger dayData={dayData} onUpdate={onUpdate} />
    </div>
  );
}

// ─── Nutrition Tab ───────────────────────────────────────────────
function NutritionTab({ date, dayData, onUpdate }) {
  const plan = MEALS[getMealType(date)];
  const toggle = id => onUpdate({ ...dayData, meals: { ...dayData?.meals, [id]: !dayData?.meals?.[id] } });

  // Sum checked blueprint meal macros
  const checkedMeals = dayData?.meals || {};
  const blueprintTotals = Object.values(plan.meals).flat().reduce((acc, item) => {
    if (checkedMeals[item.id]) {
      acc.cal     += item.cal     || 0;
      acc.carbs   += item.carbs   || 0;
      acc.protein += item.protein || 0;
      acc.fats    += item.fats    || 0;
    }
    return acc;
  }, { cal: 0, carbs: 0, protein: 0, fats: 0 });

  // Sum custom searched foods
  const allCustom = Object.values(dayData?.customFoods || {}).flat();
  const customFoodTotals = allCustom.reduce((acc, f) => ({
    carbs:   acc.carbs   + (f.carbs   || 0),
    protein: acc.protein + (f.protein || 0),
    fats:    acc.fats    + (f.fats    || 0),
    cal:     acc.cal     + (f.cal     || 0),
  }), { carbs: 0, protein: 0, fats: 0, cal: 0 });

  // Combined totals — blueprint checked + custom searched
  const customTotals = {
    cal:     blueprintTotals.cal     + customFoodTotals.cal,
    carbs:   blueprintTotals.carbs   + customFoodTotals.carbs,
    protein: blueprintTotals.protein + customFoodTotals.protein,
    fats:    blueprintTotals.fats    + customFoodTotals.fats,
  };

  const remaining = {
    carbs:   Math.max(0, plan.macros.carbs   - Math.round(customTotals.carbs)),
    protein: Math.max(0, plan.macros.protein - Math.round(customTotals.protein)),
    fats:    Math.max(0, plan.macros.fats    - Math.round(customTotals.fats)),
  };
  const over = customTotals.carbs > plan.macros.carbs || customTotals.protein > plan.macros.protein || customTotals.fats > plan.macros.fats;

  return (
    <div className="tab-content">
      <div className="section-header">
        <div className="section-title">Nutrition</div>
        <div className="section-sub">{plan.label} · {plan.macros.carbs}C / {plan.macros.protein}P / {plan.macros.fats}F</div>
      </div>

      {/* Live macro + calorie budget */}
      <div className="macro-budget-card">
        {/* Calorie bar */}
        <div className="cal-budget-row">
          <div className="cal-budget-info">
            <span className="cal-budget-val" style={{ color: customTotals.cal > CAL_TARGET ? '#E94560' : '#f59e0b' }}>
              {Math.round(customTotals.cal)}
            </span>
            <span className="cal-budget-slash">/</span>
            <span className="cal-budget-target">{CAL_TARGET} cal</span>
            <span className="cal-budget-left" style={{ color: customTotals.cal > CAL_TARGET ? '#E94560' : '#10B981' }}>
              {customTotals.cal > CAL_TARGET
                ? `${Math.round(customTotals.cal - CAL_TARGET)} over`
                : `${Math.round(CAL_TARGET - customTotals.cal)} left`}
            </span>
          </div>
          <div className="cal-bar-track">
            <div className="cal-bar-fill" style={{
              width: `${Math.min(100, Math.round((customTotals.cal / CAL_TARGET) * 100))}%`,
              background: customTotals.cal > CAL_TARGET ? '#E94560' : customTotals.cal > CAL_TARGET * 0.85 ? '#f59e0b' : '#10B981'
            }} />
          </div>
        </div>
        {/* Macro row */}
        <div className="mb-row" style={{ marginTop: 10 }}>
          <div className="mb-item">
            <span className="mb-val" style={{ color: customTotals.carbs > plan.macros.carbs ? '#E94560' : '#E94560' }}>{Math.round(customTotals.carbs)}g</span>
            <span className="mb-lbl">carbs used</span>
          </div>
          <div className="mb-divider" />
          <div className="mb-item">
            <span className="mb-val" style={{ color: '#10B981' }}>{Math.round(customTotals.protein)}g</span>
            <span className="mb-lbl">protein used</span>
          </div>
          <div className="mb-divider" />
          <div className="mb-item">
            <span className="mb-val" style={{ color: '#6C63FF' }}>{Math.round(customTotals.fats)}g</span>
            <span className="mb-lbl">fats used</span>
          </div>
          <div className="mb-divider" />
          <div className="mb-item">
            <span className="mb-val" style={{ color: over ? '#E94560' : 'var(--txt2)' }}>
              {over ? 'Over!' : remaining.carbs + 'g'}
            </span>
            <span className="mb-lbl">carbs left</span>
          </div>
        </div>
      </div>

      {/* Blueprint meals + food search per section */}
      {Object.entries(plan.meals).map(([key, items]) => (
        <div key={key} className="meal-group">
          <div className="meal-header">{MEAL_LABELS[key].emoji} {MEAL_LABELS[key].label}</div>
          {items.map(item => {
            const done = dayData?.meals?.[item.id];
            return (
              <div key={item.id} className={`check-item ${done ? 'checked' : ''}`} onClick={() => toggle(item.id)}>
                <div className={`chk ${done ? 'chk-done' : ''}`}>{done && IC.check}</div>
                <div><div className="chk-label">{item.item}</div>{item.note && <div className="chk-note">{item.note}</div>}</div>
              </div>
            );
          })}
          <div style={{ padding: '8px 14px 12px' }}>
            <FoodSearch
              mealKey={key}
              mealLabel={MEAL_LABELS[key].label}
              dayData={dayData}
              onUpdate={onUpdate}
              macroTargets={plan.macros}
              alreadyLoggedMacros={customTotals}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Supplements Tab ─────────────────────────────────────────────
function SuppsTab({ date, dayData, onUpdate }) {
  const dow = new Date(date + 'T12:00:00').getDay();
  const isWorkout = ![1, 5].includes(dow);
  const toggle = id => onUpdate({ ...dayData, supps: { ...dayData?.supps, [id]: !dayData?.supps?.[id] } });
  return (
    <div className="tab-content">
      <div className="section-header"><div className="section-title">Supplements</div><div className="section-sub">Tap each when taken</div></div>
      {Object.entries(SUPPLEMENTS).map(([key, group]) => {
        if (key === 'preWorkout' && !isWorkout) return null;
        return (
          <div key={key} className="meal-group">
            <div className="meal-header">{group.icon} {group.label}</div>
            {group.items.map(s => {
              const done = dayData?.supps?.[s.id];
              return (
                <div key={s.id} className={`check-item ${done ? 'checked' : ''}`} onClick={() => toggle(s.id)}>
                  <div className={`chk ${done ? 'chk-done' : ''}`}>{done && IC.check}</div>
                  <div><div className="chk-label">{s.name}</div><div className="chk-note">{s.dose}</div></div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

// ─── Weight Tab ──────────────────────────────────────────────────
function WeightTab({ db }) {
  const [weights, setWeights] = useState([]);
  const [input, setInput]     = useState('');
  const [note, setNote]       = useState('');
  const [loaded, setLoaded]   = useState(false);

  useEffect(() => { db.loadWeights().then(w => { setWeights(w); setLoaded(true); }); }, []);

  const add = async () => {
    if (!input) return;
    const updated = await db.saveWeight(todayKey(), input, note);
    setWeights(updated); setInput(''); setNote('');
  };

  const del = async (date) => {
    const updated = await db.deleteWeight(date);
    setWeights(updated);
  };

  const startW = 187;
  const latest = weights[0]?.weight;
  const lost   = latest ? (startW - latest) : null;
  const last8  = [...weights].slice(0, 8).reverse();
  const maxW   = last8.length ? Math.max(...last8.map(w => w.weight)) : startW;
  const minW   = last8.length ? Math.min(...last8.map(w => w.weight)) : startW - 10;
  const range  = maxW - minW || 10;

  return (
    <div className="tab-content">
      <div className="section-header"><div className="section-title">Weight Tracker</div><div className="section-sub">Weigh weekly — same day, same time</div></div>
      <div className="stat-grid">
        <div className="stat-card"><div className="stat-val">{startW} lbs</div><div className="stat-lbl">Start</div></div>
        <div className="stat-card"><div className="stat-val">{latest ? `${latest} lbs` : '—'}</div><div className="stat-lbl">Current</div></div>
        <div className="stat-card"><div className="stat-val" style={{ color: lost > 0 ? '#10B981' : '#E94560' }}>{lost !== null ? `${lost > 0 ? '−' : '+'}${Math.abs(lost).toFixed(1)} lbs` : '—'}</div><div className="stat-lbl">Lost</div></div>
        <div className="stat-card"><div className="stat-val" style={{ color: '#6C63FF' }}>30 lbs</div><div className="stat-lbl">Goal</div></div>
      </div>

      {last8.length > 1 && (
        <div className="chart-card">
          <svg viewBox={`0 0 ${last8.length * 60 + 20} 90`} style={{ width: '100%', overflow: 'visible' }}>
            <polyline points={last8.map((w, i) => `${i * 60 + 20},${75 - ((w.weight - minW) / range) * 55}`).join(' ')}
              fill="none" stroke="#E94560" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            {last8.map((w, i) => {
              const x = i * 60 + 20, y = 75 - ((w.weight - minW) / range) * 55;
              return <g key={i}><circle cx={x} cy={y} r="4" fill="#E94560" /><text x={x} y={y - 8} textAnchor="middle" fontSize="9" fill="#aaa">{w.weight}</text><text x={x} y="85" textAnchor="middle" fontSize="7" fill="#666">{w.date.slice(5)}</text></g>;
            })}
          </svg>
        </div>
      )}

      <div className="weight-form">
        <div className="weight-form-title">Log weight</div>
        <div className="weight-form-row">
          <input type="number" className="w-input" placeholder="lbs" value={input} onChange={e => setInput(e.target.value)} step="0.1" />
          <input type="text" className="w-note" placeholder="Note (optional)" value={note} onChange={e => setNote(e.target.value)} />
          <button className="w-add-btn" onClick={add}>{IC.plus}</button>
        </div>
      </div>

      <div className="meal-group">
        <div className="meal-header">History</div>
        {!loaded && <div className="empty-log">Loading…</div>}
        {loaded && weights.length === 0 && <div className="empty-log">No entries yet.</div>}
        {weights.map((w, i) => (
          <div key={w.date} className="w-row">
            <span className="w-date">{new Date(w.date + 'T12:00:00').toLocaleDateString('en-CA', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
            <span className="w-val">{w.weight} lbs</span>
            {i < weights.length - 1 && (
              <span className={`w-delta ${w.weight < weights[i + 1]?.weight ? 'delta-good' : 'delta-bad'}`}>
                {w.weight < weights[i + 1]?.weight ? '▼' : '▲'} {Math.abs(w.weight - weights[i + 1]?.weight).toFixed(1)}
              </span>
            )}
            {w.note && <span className="w-note-txt">{w.note}</span>}
            <button className="w-del" onClick={() => del(w.date)}>{IC.trash}</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── App Shell ───────────────────────────────────────────────────
export default function App() {
  const [tab, setTab]         = useState('today');
  const [date, setDate]       = useState(todayKey());
  const [dayData, setDayData] = useState({});
  const [saving, setSaving]   = useState(false);
  const db = useDb();

  useEffect(() => { db.loadDay(date).then(setDayData); }, [date]);

  const updateData = useCallback(async (newData) => {
    setDayData(newData);
    setSaving(true);
    await db.saveDay(date, newData);
    setSaving(false);
  }, [date, db]);

  const changeDate = (d) => {
    const dt = new Date(date + 'T12:00:00'); dt.setDate(dt.getDate() + d);
    setDate(dt.toISOString().split('T')[0]);
  };

  const dow   = new Date(date + 'T12:00:00').getDay();
  const sched = SCHEDULE[dow];

  return (
    <div className="app">
      <div className="app-header">
        <button className="nav-arr" onClick={() => changeDate(-1)}>{IC.back}</button>
        <div className="header-center" onClick={() => { const d = prompt('Enter date (YYYY-MM-DD)', date); if (d) setDate(d); }}>
          <div className="header-title">BLUEPRINT</div>
          <div className="header-sub">{date === todayKey() ? 'Today' : new Date(date + 'T12:00:00').toLocaleDateString('en-CA', { weekday: 'short', month: 'short', day: 'numeric' })}{saving && ' · saving…'}</div>
        </div>
        <button className="nav-arr" onClick={() => changeDate(1)}>{IC.next}</button>
      </div>

      <div className="tab-scroller">
        {tab === 'today'        && <TodayTab        date={date} dayData={dayData} onUpdate={updateData} sched={sched} db={db} />}
        {tab === 'workout'      && <WorkoutTab      date={date} dayData={dayData} onUpdate={updateData} sched={sched} />}
        {tab === 'food'         && <NutritionTab    date={date} dayData={dayData} onUpdate={updateData} />}
        {tab === 'supps'        && <SuppsTab        date={date} dayData={dayData} onUpdate={updateData} />}
        {tab === 'weight'       && <WeightTab       db={db} />}
        {tab === 'measurements' && <MeasurementsTab db={db} />}
        {tab === 'progress'     && <ProgressTab     db={db} />}
      </div>

      <div className="bottom-nav">
        {NAV.map(n => (
          <button key={n.id} className={`nav-btn ${tab === n.id ? 'active' : ''}`} onClick={() => setTab(n.id)}>
            {IC[n.icon]}<span>{n.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
