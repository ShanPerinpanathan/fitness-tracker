import { useState, useEffect, useCallback } from 'react';
import { supabase } from './data';

const lsGet  = (k, def = null) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : def; } catch { return def; } };
const lsSet  = (k, v)          => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

const isConfigured = () => {
  const url = process.env.REACT_APP_SUPABASE_URL || '';
  return url.length > 10 && url.startsWith('https://');
};

export function useDb() {
  const [userId] = useState(() => {
    let id = lsGet('blueprint_user_id');
    if (!id) { id = 'user_' + Math.random().toString(36).slice(2, 10); lsSet('blueprint_user_id', id); }
    return id;
  });
  const [online] = useState(isConfigured());

  const loadDay = useCallback(async (date) => {
    const cached = lsGet(`day_${date}`, {});
    if (!online) return cached;
    try {
      const { data, error } = await supabase.from('days').select('data').eq('user_id', userId).eq('date', date).single();
      if (error && error.code !== 'PGRST116') throw error;
      const result = data?.data || {};
      lsSet(`day_${date}`, result);
      return result;
    } catch { return cached; }
  }, [userId, online]);

  const saveDay = useCallback(async (date, dayData) => {
    lsSet(`day_${date}`, dayData);
    if (!online) return;
    try { await supabase.from('days').upsert({ user_id: userId, date, data: dayData }, { onConflict: 'user_id,date' }); } catch {}
  }, [userId, online]);

  const loadWeights = useCallback(async () => {
    const cached = lsGet('blueprint_weights', []);
    if (!online) return cached;
    try {
      const { data, error } = await supabase.from('weights').select('*').eq('user_id', userId).order('date', { ascending: false });
      if (error) throw error;
      const result = data || [];
      lsSet('blueprint_weights', result);
      return result;
    } catch { return cached; }
  }, [userId, online]);

  const saveWeight = useCallback(async (date, weight, note = '') => {
    const entry = { user_id: userId, date, weight: parseFloat(weight), note };
    if (online) { try { await supabase.from('weights').upsert(entry, { onConflict: 'user_id,date' }); } catch {} }
    const all = lsGet('blueprint_weights', []);
    const updated = [entry, ...all.filter(w => w.date !== date)].sort((a, b) => b.date.localeCompare(a.date));
    lsSet('blueprint_weights', updated);
    return updated;
  }, [userId, online]);

  const deleteWeight = useCallback(async (date) => {
    if (online) { try { await supabase.from('weights').delete().eq('user_id', userId).eq('date', date); } catch {} }
    const all = lsGet('blueprint_weights', []);
    const updated = all.filter(w => w.date !== date);
    lsSet('blueprint_weights', updated);
    return updated;
  }, [userId, online]);

  const loadHistory = useCallback(async () => {
    const cached = lsGet('blueprint_history', []);
    if (!online) return cached;
    try {
      const since = new Date(); since.setDate(since.getDate() - 60);
      const { data, error } = await supabase.from('days').select('date, data').eq('user_id', userId).gte('date', since.toISOString().split('T')[0]).order('date', { ascending: false });
      if (error) throw error;
      const result = data || [];
      lsSet('blueprint_history', result);
      return result;
    } catch { return cached; }
  }, [userId, online]);

  const loadMeasurements = useCallback(async () => {
    const cached = lsGet('blueprint_measurements', []);
    if (!online) return cached;
    try {
      const { data, error } = await supabase.from('measurements').select('*').eq('user_id', userId).order('date', { ascending: false });
      if (error) throw error;
      const result = data || [];
      lsSet('blueprint_measurements', result);
      return result;
    } catch { return cached; }
  }, [userId, online]);

  const saveMeasurement = useCallback(async (entry) => {
    const row = { ...entry, user_id: userId };
    if (online) { try { await supabase.from('measurements').upsert(row, { onConflict: 'user_id,date' }); } catch {} }
    const all = lsGet('blueprint_measurements', []);
    const updated = [row, ...all.filter(m => m.date !== entry.date)].sort((a, b) => b.date.localeCompare(a.date));
    lsSet('blueprint_measurements', updated);
    return updated;
  }, [userId, online]);

  const deleteMeasurement = useCallback(async (date) => {
    if (online) { try { await supabase.from('measurements').delete().eq('user_id', userId).eq('date', date); } catch {} }
    const all = lsGet('blueprint_measurements', []);
    const updated = all.filter(m => m.date !== date);
    lsSet('blueprint_measurements', updated);
    return updated;
  }, [userId, online]);

  return { online, userId, loadDay, saveDay, loadWeights, saveWeight, deleteWeight, loadHistory, loadMeasurements, saveMeasurement, deleteMeasurement };
}
