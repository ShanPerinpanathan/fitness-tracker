import { useCallback } from 'react';
import { supabase } from './data';

const lsGet = (k, def = null) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : def; } catch { return def; } };
const lsSet = (k, v)          => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

const isConfigured = () => {
  const url = process.env.REACT_APP_SUPABASE_URL || '';
  return url.length > 10 && url.startsWith('https://');
};

// Fixed user ID — single user, all devices sync automatically
const USER_ID = 'user_ahiacgzh';

export function useDb() {
  const online = isConfigured();

  const loadDay = useCallback(async (date) => {
    const cached = lsGet(`day_${date}`, {});
    if (!online) return cached;
    try {
      const { data, error } = await supabase.from('days').select('data').eq('user_id', USER_ID).eq('date', date).single();
      if (error && error.code !== 'PGRST116') throw error;
      const result = data?.data || {};
      lsSet(`day_${date}`, result);
      return result;
    } catch { return cached; }
  }, [online]);

  const saveDay = useCallback(async (date, dayData) => {
    lsSet(`day_${date}`, dayData);
    if (!online) return;
    try { await supabase.from('days').upsert({ user_id: USER_ID, date, data: dayData }, { onConflict: 'user_id,date' }); } catch {}
  }, [online]);

  const loadWeights = useCallback(async () => {
    const cached = lsGet('blueprint_weights', []);
    if (!online) return cached;
    try {
      const { data, error } = await supabase.from('weights').select('*').eq('user_id', USER_ID).order('date', { ascending: false });
      if (error) throw error;
      const result = data || [];
      lsSet('blueprint_weights', result);
      return result;
    } catch { return cached; }
  }, [online]);

  const saveWeight = useCallback(async (date, weight, note = '') => {
    const entry = { user_id: USER_ID, date, weight: parseFloat(weight), note };
    if (online) { try { await supabase.from('weights').upsert(entry, { onConflict: 'user_id,date' }); } catch {} }
    const all = lsGet('blueprint_weights', []);
    const updated = [entry, ...all.filter(w => w.date !== date)].sort((a, b) => b.date.localeCompare(a.date));
    lsSet('blueprint_weights', updated);
    return updated;
  }, [online]);

  const deleteWeight = useCallback(async (date) => {
    if (online) { try { await supabase.from('weights').delete().eq('user_id', USER_ID).eq('date', date); } catch {} }
    const all = lsGet('blueprint_weights', []);
    const updated = all.filter(w => w.date !== date);
    lsSet('blueprint_weights', updated);
    return updated;
  }, [online]);

  const loadHistory = useCallback(async () => {
    const cached = lsGet('blueprint_history', []);
    if (!online) return cached;
    try {
      const since = new Date(); since.setDate(since.getDate() - 60);
      const { data, error } = await supabase.from('days').select('date, data').eq('user_id', USER_ID).gte('date', since.toISOString().split('T')[0]).order('date', { ascending: false });
      if (error) throw error;
      const result = data || [];
      lsSet('blueprint_history', result);
      return result;
    } catch { return cached; }
  }, [online]);

  const loadMeasurements = useCallback(async () => {
    const cached = lsGet('blueprint_measurements', []);
    if (!online) return cached;
    try {
      const { data, error } = await supabase.from('measurements').select('*').eq('user_id', USER_ID).order('date', { ascending: false });
      if (error) throw error;
      const result = data || [];
      lsSet('blueprint_measurements', result);
      return result;
    } catch { return cached; }
  }, [online]);

  const saveMeasurement = useCallback(async (entry) => {
    const row = { ...entry, user_id: USER_ID };
    if (online) { try { await supabase.from('measurements').upsert(row, { onConflict: 'user_id,date' }); } catch {} }
    const all = lsGet('blueprint_measurements', []);
    const updated = [row, ...all.filter(m => m.date !== entry.date)].sort((a, b) => b.date.localeCompare(a.date));
    lsSet('blueprint_measurements', updated);
    return updated;
  }, [online]);

  const deleteMeasurement = useCallback(async (date) => {
    if (online) { try { await supabase.from('measurements').delete().eq('user_id', USER_ID).eq('date', date); } catch {} }
    const all = lsGet('blueprint_measurements', []);
    const updated = all.filter(m => m.date !== date);
    lsSet('blueprint_measurements', updated);
    return updated;
  }, [online]);

  return {
    online, userId: USER_ID,
    loadDay, saveDay,
    loadWeights, saveWeight, deleteWeight,
    loadHistory,
    loadMeasurements, saveMeasurement, deleteMeasurement,
  };
}
