import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getEntries, createEntry, deleteEntry } from '../services/api';
import './Journal.css';

const MOODS = [
  { key:'İyi',    emoji:'😊', color:'#d8fbe0', border:'#8ee4af' },
  { key:'Karışık', emoji:'😐', color:'#fef9e7', border:'#f7d070' },
  { key:'Yorgun', emoji:'😔', color:'#e8f4fd', border:'#90c8f0' },
  { key:'Kaygılı', emoji:'😰', color:'#fce8e8', border:'#f09090' },
  { key:'Kötü',   emoji:'😞', color:'#f0e8fc', border:'#c090f0' },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};
const fadeItem = {
  hidden: { opacity: 0, y: 14 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.4, ease:[0.4,0,0.2,1] } },
};

export default function Journal() {
  const navigate = useNavigate();
  const [text, setText]         = useState('');
  const [mood, setMood]         = useState(null);
  const [entries, setEntries]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]       = useState('');

  useEffect(() => { fetchEntries(); }, []);

  async function fetchEntries() {
    try { const r = await getEntries(); setEntries(r.data); }
    catch (err) { console.error('Girişler alınırken hata oluştu:', err); }
    finally { setLoading(false); }
  }

  async function handleSubmit() {
    if (text.trim().length < 20) { setError('Lütfen en az 20 karakter yaz.'); return; }
    setError(''); setSubmitting(true);
    try {
      await createEntry({ text: text.trim(), mood });
      setText(''); setMood(null);
      await fetchEntries();
      navigate('/analysis');
    } catch { setError('Giriş kaydedilemedi. Backend bağlantısını kontrol et.'); }
    finally  { setSubmitting(false); }
  }

  async function handleDelete(id) {
    if (!confirm('Bu girişi silmek istiyor musun?')) return;
    try { await deleteEntry(id); setEntries(p => p.filter(e => e._id !== id)); }
    catch { alert('Silme başarısız.'); }
  }

  return (
    <motion.div className="journal-page" variants={container} initial="hidden" animate="show">
      {/* HEADER */}
      <motion.div variants={fadeItem} className="page-header">
        <p className="section-label">Günlük</p>
        <h1 className="page-title">Bugünü Anlat</h1>
        <p className="page-sub">Yazdıkça hafiflersin. Zihnin burada güvende.</p>
      </motion.div>

      {/* WRITE CARD */}
      <motion.div variants={fadeItem} className="write-card glass-card">
        {/* MOOD */}
        <div className="mood-section">
          <p className="section-label" style={{ marginBottom:'0.75rem' }}>Şu an nasıl hissediyorsun?</p>
          <div className="mood-row">
            {MOODS.map(m => (
              <motion.button
                key={m.key}
                className={`mood-btn ${mood === m.key ? 'mood-btn--active' : ''}`}
                style={mood === m.key ? { background: m.color, borderColor: m.border } : {}}
                onClick={() => setMood(mood === m.key ? null : m.key)}
                whileHover={{ scale: 1.06, y: -2 }}
                whileTap={{ scale: 0.96 }}
                type="button"
              >
                <span className="mood-emoji">{m.emoji}</span>
                <span className="mood-label">{m.key}</span>
              </motion.button>
            ))}
          </div>
        </div>

        <div className="divider-mint" />

        {/* TEXTAREA */}
        <div>
          <p className="section-label" style={{ marginBottom:'0.75rem' }}>Bugününü yaz</p>
          <textarea
            className="textarea-mint journal-textarea"
            placeholder="Bugün neler hissettin? Ne yaşadın? Zihninde ne dolaşıyor…"
            value={text}
            onChange={e => { setText(e.target.value); setError(''); }}
            rows={7}
          />
          <div className="textarea-footer">
            {error && <p className="error-msg">{error}</p>}
            <span className={`char-count ${text.length < 20 ? 'char-count--warn' : 'char-count--ok'}`}>
              {text.length} / min 20
            </span>
          </div>
        </div>

        <motion.button
          className="btn-glow submit-btn"
          onClick={handleSubmit}
          disabled={submitting}
          whileHover={{ scale: submitting ? 1 : 1.02, y: submitting ? 0 : -2 }}
          whileTap={{ scale: 0.98 }}
          type="button"
        >
          {submitting
            ? <><div className="spinner-mint" style={{ borderTopColor:'#fff', borderColor:'rgba(255,255,255,0.3)' }} /> Analiz ediliyor…</>
            : <><span>◎</span> Analiz Et</>
          }
        </motion.button>
      </motion.div>

      {/* HISTORY */}
      <motion.div variants={fadeItem}>
        <p className="section-label" style={{ marginBottom:'1rem' }}>Geçmiş Girişler</p>
        {loading ? (
          <div className="empty-state"><div className="spinner-mint" /></div>
        ) : entries.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">✿</div>
            <p>Henüz giriş yok.<br />Yukarıdan ilk girişini yapabilirsin.</p>
          </div>
        ) : (
          <div className="history-list">
            <AnimatePresence>
              {entries.map((entry, i) => (
                <motion.div
                  key={entry._id}
                  className="history-card glass-card"
                  initial={{ opacity:0, y:10 }}
                  animate={{ opacity:1, y:0 }}
                  exit={{ opacity:0, x:-20 }}
                  transition={{ delay: i*0.05, duration:0.35 }}
                  layout
                >
                  <div className="history-top">
                    <div className="history-meta">
                      <span className="history-date">
                        {new Date(entry.createdAt).toLocaleDateString('tr-TR', { day:'numeric', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit' })}
                      </span>
                      {entry.mood && <span className="badge-mint">{MOODS.find(m=>m.key===entry.mood)?.emoji} {entry.mood}</span>}
                      {entry.distortions?.length > 0 && <span className="badge-purple">{entry.distortions.length} hata</span>}
                    </div>
                    <motion.button
                      className="delete-btn"
                      onClick={() => handleDelete(entry._id)}
                      whileHover={{ scale:1.1 }} whileTap={{ scale:0.9 }}
                      type="button"
                    >✕</motion.button>
                  </div>
                  <p className="history-text">{entry.text}</p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
