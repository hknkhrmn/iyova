import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getEntries, getMeds } from '../services/api';
import './Dashboard.css';

const MOODS = { 'İyi': '😊', 'Karışık': '😐', 'Yorgun': '😔', 'Kaygılı': '😰', 'Kötü': '😞' };

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 18 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.4,0,0.2,1] } },
};

function StatCard({ label, value, sub, gradient, icon }) {
  return (
    <motion.div variants={item} className="stat-card" style={{ background: gradient }}>
      <div className="stat-icon">{icon}</div>
      <p className="stat-value">{value}</p>
      <p className="stat-label">{label}</p>
      {sub && <p className="stat-sub">{sub}</p>}
      <div className="stat-glow" />
    </motion.div>
  );
}

export default function Dashboard() {
  const [entries, setEntries] = useState([]);
  const [meds, setMeds]       = useState([]);
  const [loading, setLoading] = useState(true);

  const now     = new Date();
  const hour    = now.getHours();
  const greeting = hour < 12 ? 'Günaydın' : hour < 18 ? 'İyi günler' : 'İyi akşamlar';
  const days    = ['Pazar','Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi'];
  const dateLabel = `${days[now.getDay()]}, ${now.toLocaleDateString('tr-TR', { day:'numeric', month:'long', year:'numeric' })}`;

  useEffect(() => {
    Promise.all([getEntries(), getMeds()])
      .then(([e, m]) => { setEntries(e.data); setMeds(m.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const takenCount    = meds.filter(m => m.takenToday).length;
  const analysedCount = entries.filter(e => e.distortions != null).length;

  return (
    <motion.div
      className="dashboard"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* HEADER */}
      <motion.div variants={item} className="dash-header">
        <div>
          <p className="dash-eyebrow section-label">{dateLabel}</p>
          <h1 className="dash-greeting">{greeting} <span className="wave">👋</span></h1>
          <p className="dash-sub">Bugün nasılsın? Kendine zaman ayırmayı unutma.</p>
        </div>
        <Link to="/journal" className="btn-glow dash-cta">
          <span>✦</span> Yeni Giriş
        </Link>
      </motion.div>

      {/* STATS */}
      <motion.div variants={item} className="stats-row">
        <StatCard
          label="Günlük Girişi"
          value={entries.length}
          icon="✿"
          gradient="linear-gradient(135deg, #d8fbe0 0%, #c2f5d3 100%)"
        />
        <StatCard
          label="İlaç Alındı"
          value={`${takenCount}/${meds.length}`}
          sub={meds.length === 0 ? 'İlaç eklenmedi' : takenCount === meds.length && meds.length > 0 ? '✓ Tamamlandı' : 'Devam ediyor'}
          icon="❋"
          gradient="linear-gradient(135deg, #e0f0fb 0%, #c8e4f7 100%)"
        />
        <StatCard
          label="Analiz"
          value={analysedCount}
          icon="◎"
          gradient="linear-gradient(135deg, #ede8fb 0%, #ddd0f7 100%)"
        />
      </motion.div>

      {/* QUICK ACTIONS */}
      <motion.div variants={item} className="quick-row">
        <Link to="/journal" className="quick-card">
          <div className="quick-icon" style={{ background: 'linear-gradient(135deg,#b6f0c7,#8ee4af)' }}>✿</div>
          <div className="quick-body">
            <p className="quick-title">Günlüğünü Yaz</p>
            <p className="quick-sub">Bugünü kaydet, zihnini analiz et</p>
          </div>
          <span className="quick-arrow">→</span>
          <div className="quick-hover-glow" />
        </Link>
        <Link to="/meds" className="quick-card">
          <div className="quick-icon" style={{ background: 'linear-gradient(135deg,#c8e4f7,#a0ccf0)' }}>❋</div>
          <div className="quick-body">
            <p className="quick-title">İlaç Takibi</p>
            <p className="quick-sub">{meds.length === 0 ? 'İlaç ekle' : `${takenCount}/${meds.length} alındı`}</p>
          </div>
          <span className="quick-arrow">→</span>
          <div className="quick-hover-glow" />
        </Link>
      </motion.div>

      {/* RECENT ENTRIES */}
      <motion.div variants={item} className="glass-card recent-card">
        <div className="recent-header">
          <p className="section-label">Son Girişler</p>
          <Link to="/journal" className="text-link">Tümünü gör →</Link>
        </div>

        {loading ? (
          <div className="empty-state"><div className="spinner-mint" /></div>
        ) : entries.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">✿</div>
            <p>Henüz giriş yok.<br />İlk günlüğünü yazmaya başla!</p>
          </div>
        ) : (
          <div className="entries-list">
            {entries.slice(0, 4).map((entry, i) => (
              <motion.div
                key={entry._id}
                className="entry-row"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06, duration: 0.35 }}
              >
                <div className="entry-dot" />
                <div className="entry-body">
                  <div className="entry-meta">
                    <span className="entry-date">
                      {new Date(entry.createdAt).toLocaleDateString('tr-TR', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}
                    </span>
                    {entry.mood && <span className="entry-mood">{MOODS[entry.mood]} {entry.mood}</span>}
                    {entry.distortions?.length === 0 && <span className="badge-mint">✓ Temiz</span>}
                    {entry.distortions?.length > 0 && <span className="badge-purple">{entry.distortions.length} hata</span>}
                  </div>
                  <p className="entry-preview">{entry.text.length > 90 ? entry.text.slice(0,90)+'…' : entry.text}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
