import { useState, useEffect } from 'react';
import { getMeds, createMed, toggleMed, deleteMed } from '../services/api';
import './Meds.css';

export default function Meds() {
  const [meds, setMeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: '', dose: '', time: '08:00' });
  const [formError, setFormError] = useState('');

  const today = new Date().toLocaleDateString('tr-TR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  useEffect(() => { fetchMeds(); }, []);

  async function fetchMeds() {
    try {
      const res = await getMeds();
      setMeds(res.data);
    } catch {
      // backend henüz bağlı değil
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd() {
    if (!form.name.trim()) { setFormError('İlaç adı zorunludur.'); return; }
    setFormError('');
    setAdding(true);
    try {
      await createMed(form);
      setForm({ name: '', dose: '', time: '08:00' });
      await fetchMeds();
    } catch {
      setFormError('İlaç eklenemedi.');
    } finally {
      setAdding(false);
    }
  }

  async function handleToggle(id) {
    setMeds((prev) =>
      prev.map((m) => (m._id === id ? { ...m, takenToday: !m.takenToday } : m))
    );
    try {
      await toggleMed(id);
      await fetchMeds();
    } catch {
      await fetchMeds(); // revert
    }
  }

  async function handleDelete(id) {
    if (!confirm('Bu ilacı silmek istiyor musun?')) return;
    try {
      await deleteMed(id);
      setMeds((prev) => prev.filter((m) => m._id !== id));
    } catch {
      alert('Silme başarısız.');
    }
  }

  const takenCount = meds.filter((m) => m.takenToday).length;
  const totalCount = meds.length;
  const progress = totalCount > 0 ? (takenCount / totalCount) * 100 : 0;

  const sorted = [...meds].sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className="meds-page fade-up">
      <div className="page-header">
        <h1>İlaç Takibi</h1>
        <p className="page-sub">{today}</p>
      </div>

      {/* PROGRESS */}
      {totalCount > 0 && (
        <div className="card progress-card fade-up fade-up-1">
          <div className="progress-header">
            <p className="progress-label">Bugünkü İlerleme</p>
            <p className="progress-count">
              <span className="progress-taken">{takenCount}</span>
              <span className="progress-total">/{totalCount} alındı</span>
            </p>
          </div>
          <div className="progress-bar-bg">
            <div
              className="progress-bar-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          {takenCount === totalCount && (
            <p className="progress-complete">🎉 Bugün tüm ilaçlarını aldın!</p>
          )}
        </div>
      )}

      {/* ADD FORM */}
      <div className="card add-form-card fade-up fade-up-2">
        <p className="section-title">Yeni İlaç Ekle</p>
        <div className="add-form-grid">
          <div className="form-group form-group--full">
            <label className="field-label" htmlFor="med-name">İlaç Adı *</label>
            <input
              id="med-name"
              className="input-field"
              type="text"
              placeholder="ör: Sertraline"
              value={form.name}
              onChange={(e) => { setForm({ ...form, name: e.target.value }); setFormError(''); }}
            />
          </div>
          <div className="form-group">
            <label className="field-label" htmlFor="med-dose">Doz (opsiyonel)</label>
            <input
              id="med-dose"
              className="input-field"
              type="text"
              placeholder="ör: 50mg"
              value={form.dose}
              onChange={(e) => setForm({ ...form, dose: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="field-label" htmlFor="med-time">Saat</label>
            <input
              id="med-time"
              className="input-field"
              type="time"
              value={form.time}
              onChange={(e) => setForm({ ...form, time: e.target.value })}
            />
          </div>
          {formError && <p className="form-error">{formError}</p>}
          <button
            className="btn btn-sky btn-full add-submit-btn"
            onClick={handleAdd}
            disabled={adding}
            type="button"
          >
            {adding ? (
              <><div className="spinner" style={{ borderTopColor: '#fff' }} /> Ekleniyor…</>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                İlaç Ekle
              </>
            )}
          </button>
        </div>
      </div>

      {/* MED LIST */}
      <div className="fade-up fade-up-3">
        <p className="section-title">Bugünün İlaçları</p>
        {loading ? (
          <div className="empty-state"><div className="spinner" /></div>
        ) : meds.length === 0 ? (
          <div className="empty-state">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.5 20H4a2 2 0 01-2-2V5c0-1.1.9-2 2-2h3.93a2 2 0 011.66.9l.82 1.2a2 2 0 001.66.9H20a2 2 0 012 2v3"/>
              <circle cx="18" cy="18" r="4"/><path d="M15.5 18h5"/><path d="M18 15.5v5"/>
            </svg>
            <p>Henüz ilaç eklenmedi.<br />Yukarıdan ilk ilacını ekleyebilirsin.</p>
          </div>
        ) : (
          <div className="meds-list card">
            {sorted.map((med, i) => (
              <div key={med._id} className={`med-item ${i > 0 ? 'med-item--bordered' : ''}`}>
                {/* CHECK */}
                <button
                  className={`med-check ${med.takenToday ? 'med-check--done' : ''}`}
                  onClick={() => handleToggle(med._id)}
                  type="button"
                  aria-label={med.takenToday ? 'Alındı işaretini kaldır' : 'Alındı olarak işaretle'}
                >
                  {med.takenToday && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  )}
                </button>

                {/* INFO */}
                <div className="med-info">
                  <p className={`med-name ${med.takenToday ? 'med-name--done' : ''}`}>
                    {med.name}
                    {med.dose && <span className="med-dose"> — {med.dose}</span>}
                  </p>
                  <p className="med-time">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: '-1px', marginRight: 4 }}>
                      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                    {med.time}
                  </p>
                </div>

                {/* STATUS + STREAK */}
                <div className="med-right">
                  {med.takenToday && (
                    <span className="badge badge-sage">✓ Alındı</span>
                  )}
                  {med.streak > 0 && (
                    <span className="med-streak">🔥 {med.streak} gün</span>
                  )}
                </div>

                {/* DELETE */}
                <button
                  className="med-delete"
                  onClick={() => handleDelete(med._id)}
                  type="button"
                  title="Sil"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
