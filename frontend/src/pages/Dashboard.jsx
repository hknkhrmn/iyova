import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getEntries, getMeds } from '../services/api';
import './Dashboard.css';

const MOODS = {
  'İyi': '😊', 'Karışık': '😐', 'Yorgun': '😔', 'Kaygılı': '😰', 'Kötü': '😞',
};

function StatCard({ label, value, sub, color }) {
  return (
    <div className={`stat-card stat-card--${color}`}>
      <p className="stat-value">{value}</p>
      <p className="stat-label">{label}</p>
      {sub && <p className="stat-sub">{sub}</p>}
    </div>
  );
}

export default function Dashboard() {
  const [entries, setEntries] = useState([]);
  const [meds, setMeds] = useState([]);
  const [loading, setLoading] = useState(true);

  const today = new Date();
  const hour = today.getHours();
  const greeting =
    hour < 12 ? 'Günaydın' : hour < 18 ? 'İyi günler' : 'İyi akşamlar';

  const days = ['Pazar','Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi'];
  const dateLabel = `${days[today.getDay()]}, ${today.toLocaleDateString('tr-TR', {
    day: 'numeric', month: 'long', year: 'numeric',
  })}`;

  useEffect(() => {
    Promise.all([getEntries(), getMeds()])
      .then(([eRes, mRes]) => {
        setEntries(eRes.data);
        setMeds(mRes.data);
      })
      .catch(() => {
        // Backend henüz bağlı değil — boş göster
      })
      .finally(() => setLoading(false));
  }, []);

  const takenCount  = meds.filter((m) => m.takenToday).length;
  const totalMeds   = meds.length;
  const analysedCount = entries.filter((e) => e.distortions?.length >= 0).length;

  return (
    <div className="dashboard fade-up">
      {/* HEADER */}
      <div className="dash-header">
        <div>
          <h1 className="dash-greeting">{greeting} 👋</h1>
          <p className="dash-date">{dateLabel}</p>
        </div>
        <Link to="/journal" className="btn btn-sage btn-sm">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Yeni Giriş
        </Link>
      </div>

      {/* STATS */}
      <div className="stats-row fade-up fade-up-1">
        <StatCard label="Günlük Girişi" value={entries.length} color="sage" />
        <StatCard
          label="İlaç Alındı"
          value={`${takenCount}/${totalMeds}`}
          sub={totalMeds === 0 ? 'İlaç yok' : takenCount === totalMeds ? '✓ Tamamlandı' : 'Devam ediyor'}
          color="sky"
        />
        <StatCard label="Analiz Yapıldı" value={analysedCount} color="purple" />
      </div>

      {/* QUICK ACTIONS */}
      <div className="quick-row fade-up fade-up-2">
        <Link to="/journal" className="quick-card">
          <div className="quick-icon quick-icon--sage">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
              <polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/>
            </svg>
          </div>
          <div>
            <p className="quick-title">Günlük Yaz</p>
            <p className="quick-sub">Bugünü kaydet, analiz et</p>
          </div>
          <svg className="quick-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </Link>

        <Link to="/meds" className="quick-card">
          <div className="quick-icon quick-icon--sky">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="18" r="4"/><path d="M15.5 18h5"/><path d="M18 15.5v5"/>
              <path d="M10.5 20H4a2 2 0 01-2-2V5c0-1.1.9-2 2-2h3.93a2 2 0 011.66.9l.82 1.2a2 2 0 001.66.9H20a2 2 0 012 2v3"/>
            </svg>
          </div>
          <div>
            <p className="quick-title">İlaç Takibi</p>
            <p className="quick-sub">
              {totalMeds === 0 ? 'İlaç ekle' : `${takenCount}/${totalMeds} alındı`}
            </p>
          </div>
          <svg className="quick-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </Link>
      </div>

      {/* RECENT ENTRIES */}
      <div className="card fade-up fade-up-3">
        <div className="card-header-row">
          <p className="section-title">Son Girişler</p>
          <Link to="/journal" className="text-link">Tümünü gör →</Link>
        </div>

        {loading ? (
          <div className="empty-state"><div className="spinner" /></div>
        ) : entries.length === 0 ? (
          <div className="empty-state">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            <p>Henüz giriş yok.<br />İlk günlüğünü yazmaya başla!</p>
          </div>
        ) : (
          <div className="entries-list">
            {entries.slice(0, 4).map((entry) => (
              <div key={entry._id} className="entry-row">
                <div className="entry-dot" />
                <div className="entry-body">
                  <div className="entry-meta">
                    <span className="entry-date">
                      {new Date(entry.createdAt).toLocaleDateString('tr-TR', {
                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                      })}
                    </span>
                    {entry.mood && (
                      <span className="entry-mood">
                        {MOODS[entry.mood]} {entry.mood}
                      </span>
                    )}
                    {entry.distortions?.length === 0 && (
                      <span className="badge badge-sage">✓ Temiz</span>
                    )}
                    {entry.distortions?.length > 0 && (
                      <span className="badge badge-purple">{entry.distortions.length} düşünce hatası</span>
                    )}
                  </div>
                  <p className="entry-preview">
                    {entry.text.length > 90 ? entry.text.slice(0, 90) + '...' : entry.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
