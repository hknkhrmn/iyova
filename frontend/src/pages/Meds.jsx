import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getMeds, createMed, toggleMed, deleteMed } from '../services/api';
import './Meds.css';

const container = { hidden:{}, show:{ transition:{ staggerChildren:0.07 } } };
const fadeItem  = { hidden:{ opacity:0, y:14 }, show:{ opacity:1, y:0, transition:{ duration:0.4, ease:[0.4,0,0.2,1] } } };

export default function Meds() {
  const [meds, setMeds]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding]   = useState(false);
  const [form, setForm]       = useState({ name:'', dose:'', time:'08:00' });
  const [formError, setFormError] = useState('');

  const today = new Date().toLocaleDateString('tr-TR',{ weekday:'long', day:'numeric', month:'long', year:'numeric' });

  useEffect(() => { fetchMeds(); }, []);

  async function fetchMeds() {
    try { const r = await getMeds(); setMeds(r.data); }
    catch (err) { console.error('İlaçlar alınırken hata oluştu:', err); }
    finally { setLoading(false); }
  }

  async function handleAdd() {
    if (!form.name.trim()) { setFormError('İlaç adı zorunludur.'); return; }
    setFormError(''); setAdding(true);
    try { await createMed(form); setForm({ name:'', dose:'', time:'08:00' }); await fetchMeds(); }
    catch { setFormError('İlaç eklenemedi.'); }
    finally { setAdding(false); }
  }

  async function handleToggle(id) {
    setMeds(p => p.map(m => m._id===id ? { ...m, takenToday:!m.takenToday } : m));
    try { await toggleMed(id); await fetchMeds(); }
    catch { await fetchMeds(); }
  }

  async function handleDelete(id) {
    if (!confirm('Bu ilacı silmek istiyor musun?')) return;
    try { await deleteMed(id); setMeds(p => p.filter(m => m._id!==id)); }
    catch { alert('Silme başarısız.'); }
  }

  const takenCount = meds.filter(m => m.takenToday).length;
  const total      = meds.length;
  const progress   = total > 0 ? (takenCount/total)*100 : 0;
  const sorted     = [...meds].sort((a,b) => a.time.localeCompare(b.time));

  return (
    <motion.div className="meds-page" variants={container} initial="hidden" animate="show">
      {/* HEADER */}
      <motion.div variants={fadeItem} className="page-header">
        <p className="section-label">İlaç Takibi</p>
        <h1 className="page-title">Günlük İlaçlar</h1>
        <p className="page-sub">{today}</p>
      </motion.div>

      {/* PROGRESS */}
      {total > 0 && (
        <motion.div variants={fadeItem} className="progress-card glass-card">
          <div className="progress-top">
            <div>
              <p className="section-label" style={{ marginBottom:'3px' }}>Bugünkü İlerleme</p>
              <p className="progress-fraction">
                <span className="progress-taken">{takenCount}</span>
                <span className="progress-sep">/{total}</span>
                <span className="progress-unit"> ilaç alındı</span>
              </p>
            </div>
            <div className="progress-pct" style={{ color: progress===100?'#35b86a':'#7aab8a' }}>
              {Math.round(progress)}%
            </div>
          </div>
          <div className="progress-bar-bg">
            <motion.div
              className="progress-bar-fill"
              initial={{ width:0 }}
              animate={{ width:`${progress}%` }}
              transition={{ duration:0.8, ease:[0.4,0,0.2,1] }}
            />
          </div>
          {takenCount===total && total>0 && (
            <motion.p
              className="progress-complete"
              initial={{ opacity:0, y:4 }} animate={{ opacity:1, y:0 }}
            >
              🎉 Harika! Bugün tüm ilaçlarını aldın.
            </motion.p>
          )}
        </motion.div>
      )}

      {/* ADD FORM */}
      <motion.div variants={fadeItem} className="add-card glass-card">
        <p className="section-label" style={{ marginBottom:'1rem' }}>Yeni İlaç Ekle</p>
        <div className="add-grid">
          <div className="form-group form-group--full">
            <label className="form-label" htmlFor="med-name">İlaç Adı *</label>
            <input id="med-name" className="input-mint" type="text" placeholder="ör: Sertraline"
              value={form.name} onChange={e => { setForm({...form,name:e.target.value}); setFormError(''); }} />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="med-dose">Doz (opsiyonel)</label>
            <input id="med-dose" className="input-mint" type="text" placeholder="ör: 50mg"
              value={form.dose} onChange={e => setForm({...form,dose:e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="med-time">Saat</label>
            <input id="med-time" className="input-mint" type="time"
              value={form.time} onChange={e => setForm({...form,time:e.target.value})} />
          </div>
          {formError && <p className="form-error">{formError}</p>}
          <motion.button
            className="btn-glow add-btn"
            onClick={handleAdd} disabled={adding}
            whileHover={{ scale: adding?1:1.02, y: adding?0:-2 }}
            whileTap={{ scale:0.98 }}
            type="button"
          >
            {adding
              ? <><div className="spinner-mint" style={{ borderTopColor:'#fff', borderColor:'rgba(255,255,255,0.3)' }} /> Ekleniyor…</>
              : <><span style={{ fontSize:'18px' }}>+</span> İlaç Ekle</>
            }
          </motion.button>
        </div>
      </motion.div>

      {/* MED LIST */}
      <motion.div variants={fadeItem}>
        <p className="section-label" style={{ marginBottom:'1rem' }}>Bugünün Listesi</p>
        {loading ? (
          <div className="empty-state"><div className="spinner-mint" /></div>
        ) : meds.length===0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">❋</div>
            <p>Henüz ilaç eklenmedi.<br />Yukarıdan ilk ilacını ekleyebilirsin.</p>
          </div>
        ) : (
          <div className="meds-list glass-card">
            <AnimatePresence>
              {sorted.map((med, i) => (
                <motion.div
                  key={med._id}
                  className={`med-item ${i>0?'med-item--bordered':''}`}
                  layout
                  initial={{ opacity:0, x:-10 }}
                  animate={{ opacity:1, x:0 }}
                  exit={{ opacity:0, x:20 }}
                  transition={{ delay:i*0.05, duration:0.3 }}
                >
                  {/* CHECK */}
                  <motion.button
                    className={`med-check ${med.takenToday?'med-check--done':''}`}
                    onClick={() => handleToggle(med._id)}
                    whileHover={{ scale:1.08 }} whileTap={{ scale:0.92 }}
                    type="button"
                  >
                    <AnimatePresence>
                      {med.takenToday && (
                        <motion.span
                          initial={{ scale:0, opacity:0 }}
                          animate={{ scale:1, opacity:1 }}
                          exit={{ scale:0, opacity:0 }}
                          transition={{ type:'spring', stiffness:300 }}
                        >✓</motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>

                  {/* INFO */}
                  <div className="med-info">
                    <p className={`med-name ${med.takenToday?'med-name--done':''}`}>
                      {med.name}
                      {med.dose && <span className="med-dose"> — {med.dose}</span>}
                    </p>
                    <p className="med-time">⏱ {med.time}</p>
                  </div>

                  {/* STATUS */}
                  <div className="med-right">
                    {med.takenToday && <span className="badge-mint">✓ Alındı</span>}
                    {med.streak>0 && <span className="streak-badge">🔥 {med.streak} gün</span>}
                  </div>

                  {/* DELETE */}
                  <motion.button
                    className="med-delete"
                    onClick={() => handleDelete(med._id)}
                    whileHover={{ scale:1.1 }} whileTap={{ scale:0.9 }}
                    type="button"
                  >✕</motion.button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
