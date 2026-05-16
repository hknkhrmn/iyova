import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getEntries } from '../services/api';
import './Analysis.css';

const container = { hidden:{}, show:{ transition:{ staggerChildren:0.07 } } };
const fadeItem = { hidden:{ opacity:0, y:14 }, show:{ opacity:1, y:0, transition:{ duration:0.4, ease:[0.4,0,0.2,1] } } };

function DistortionCard({ d, index }) {
  return (
    <motion.div
      className="distortion-card glass-card"
      initial={{ opacity:0, y:12 }}
      animate={{ opacity:1, y:0 }}
      transition={{ delay: index*0.08, duration:0.4 }}
      whileHover={{ y:-2, boxShadow:'0 8px 32px rgba(142,228,175,0.18)' }}
    >
      <div className="dc-header">
        <span className="badge-purple">🧠 Düşünce Hatası</span>
        <h3 className="dc-name">{d.distortion}</h3>
      </div>
      <div className="dc-section">
        <p className="dc-section-label">💬 Açıklama</p>
        <p className="dc-section-text">{d.explanation}</p>
      </div>
      <div className="dc-reframe">
        <p className="dc-reframe-label">🔁 Dengeli Bakış</p>
        <p className="dc-reframe-text">{d.reframe}</p>
      </div>
    </motion.div>
  );
}

export default function Analysis() {
  const [entries, setEntries]   = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    getEntries()
      .then(r => {
        const analyzed = r.data.filter(e => e.distortions != null);
        setEntries(analyzed);
        if (analyzed.length > 0) setSelected(analyzed[0]);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const total   = entries.length;
  const allD    = entries.reduce((a, e) => a + (e.distortions?.length||0), 0);
  const clean   = entries.filter(e => e.distortions?.length===0).length;

  if (loading) return <div className="empty-state" style={{ paddingTop:'4rem' }}><div className="spinner-mint" /></div>;

  return (
    <motion.div className="analysis-page" variants={container} initial="hidden" animate="show">
      <motion.div variants={fadeItem} className="page-header">
        <p className="section-label">Analiz</p>
        <h1 className="page-title">Düşünce Kalıpları</h1>
        <p className="page-sub">Zihnini tanı, dengeli bakış geliştir.</p>
      </motion.div>

      {/* STATS BAR */}
      {total > 0 && (
        <motion.div variants={fadeItem} className="analysis-stats glass-card">
          <div className="astat">
            <p className="astat-value">{total}</p>
            <p className="astat-label">Analiz edilen giriş</p>
          </div>
          <div className="astat-sep" />
          <div className="astat">
            <p className="astat-value" style={{ color:'#7c5cc4' }}>{allD}</p>
            <p className="astat-label">Tespit edilen hata</p>
          </div>
          <div className="astat-sep" />
          <div className="astat">
            <p className="astat-value" style={{ color:'#35b86a' }}>{clean}</p>
            <p className="astat-label">Temiz giriş</p>
          </div>
        </motion.div>
      )}

      {total === 0 ? (
        <motion.div variants={fadeItem} className="empty-state">
          <div className="empty-state-icon">◎</div>
          <p>Henüz analiz yok.<br />Günlük ekranından bir şeyler yaz ve analiz et.</p>
        </motion.div>
      ) : (
        <motion.div variants={fadeItem} className="analysis-layout">
          {/* ENTRY SIDEBAR */}
          <aside className="entry-sidebar glass-card">
            <p className="section-label" style={{ marginBottom:'0.875rem' }}>Girişler</p>
            <div className="entry-sidebar-list">
              {entries.map(entry => (
                <motion.button
                  key={entry._id}
                  className={`esi-btn ${selected?._id===entry._id ? 'esi-btn--active' : ''}`}
                  onClick={() => setSelected(entry)}
                  whileHover={{ x:2 }} whileTap={{ scale:0.98 }}
                  type="button"
                >
                  <div className="esi-top">
                    <span className="esi-date">
                      {new Date(entry.createdAt).toLocaleDateString('tr-TR',{ day:'numeric', month:'short' })}
                    </span>
                    {entry.distortions?.length===0
                      ? <span className="badge-mint" style={{ fontSize:'10px', padding:'2px 8px' }}>✓</span>
                      : <span className="badge-purple" style={{ fontSize:'10px', padding:'2px 8px' }}>{entry.distortions.length}</span>
                    }
                  </div>
                  <p className="esi-preview">{entry.text.length>55 ? entry.text.slice(0,55)+'…' : entry.text}</p>
                  {selected?._id===entry._id && <div className="esi-active-bar" />}
                </motion.button>
              ))}
            </div>
          </aside>

          {/* DETAIL */}
          <div className="analysis-detail">
            <AnimatePresence mode="wait">
              {selected && (
                <motion.div
                  key={selected._id}
                  initial={{ opacity:0, y:10 }}
                  animate={{ opacity:1, y:0 }}
                  exit={{ opacity:0, y:-10 }}
                  transition={{ duration:0.3 }}
                >
                  {/* SOURCE */}
                  <div className="detail-source glass-card">
                    <p className="section-label" style={{ marginBottom:'0.625rem' }}>Giriş</p>
                    <p className="detail-source-text">
                      "{selected.text.length>200 ? selected.text.slice(0,200)+'…' : selected.text}"
                    </p>
                    <p className="detail-source-date">
                      {new Date(selected.createdAt).toLocaleDateString('tr-TR',{ day:'numeric', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit' })}
                    </p>
                  </div>

                  {selected.distortions?.length===0 ? (
                    <motion.div
                      className="no-distortion"
                      initial={{ opacity:0, scale:0.97 }}
                      animate={{ opacity:1, scale:1 }}
                      transition={{ duration:0.35 }}
                    >
                      <div className="no-d-icon">✅</div>
                      <div>
                        <p className="no-d-title">Düşünce hatası tespit edilmedi</p>
                        <p className="no-d-sub">Bu yazıda belirgin bir düşünce hatası gözlemlenmedi. Bu an için zihnin dengeli görünüyor.</p>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="distortions-list" style={{ marginTop:'1rem' }}>
                      {selected.distortions.map((d,i) => (
                        <DistortionCard key={i} d={d} index={i} />
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
