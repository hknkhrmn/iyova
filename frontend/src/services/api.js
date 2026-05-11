import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({ baseURL: BASE_URL });

// ─── Journal ─────────────────────────────────────────────────
export const getEntries   = ()       => api.get('/journal');
export const createEntry  = (data)   => api.post('/journal', data);
export const deleteEntry  = (id)     => api.delete(`/journal/${id}`);

// ─── AI Analysis ─────────────────────────────────────────────
export const analyzeText  = (text)   => api.post('/ai/analyze', { text });

// ─── Medications ─────────────────────────────────────────────
export const getMeds      = ()       => api.get('/meds');
export const createMed    = (data)   => api.post('/meds', data);
export const toggleMed    = (id)     => api.patch(`/meds/${id}/toggle`);
export const deleteMed    = (id)     => api.delete(`/meds/${id}`);
