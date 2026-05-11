import { useState, useEffect } from 'react';
import { getEntries } from '../services/api';
import './Analysis.css';

const DISTORTION_COLORS = {
  'Felaketleştirme':     'rose',
  'Aşırı genelleme':     'purple',
  'Siyah-beyaz düşünme': 'sky',
  'Zihin okuma':         'orange',
  'Duygusal çıkarım':    'amber',
  'Etiketleme':          'rose',
  'Kişiselleştirme':     'purple',
};

function colorFor(name) {
  for (const [k, v] of Object.entries(DISTORTION_COLORS)) {
    if (name?.toLowerCase().includes(k.toLowerCase().slice(0, 6))) return v;
  }
  return 'purple';
}

function DistortionCard({ d, index }) {
  const color = colorFor(d.distortion);
  return (
    <div className={`distortion-card distortion-card--${color} fade-up`} style={{ animationDelay: `${index * 0.07}s` }}>
      <div className="dc-header">
        <span className={`badge badge-${color === 'rose' ? 'rose' : color === 'sky' ? 'sky' : 'purple'}`}>
          🧠 Düşünce Hatası
        </span>
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
    </div>
  );
}

export default function Analysis() {
  const [entries, setEntries] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEntries()
      .then((res) => {
        const analyzed = res.data.filter((e) => e.distortions != null);
        setEntries(analyzed);
        if (analyzed.length > 0) setSelected(analyzed[0]);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalDistortions = entries.reduce(
    (acc, e) => acc + (e.distortions?.length || 0), 0
  );
  const cleanEntries = entries.filter((e) => e.distortions?.length === 0).length;

  if (loading) {
    return (
      <div className="empty-state" style={{ paddingTop: '4rem' }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="analysis-page fade-up">
      <div className="page-header">
        <h1>Analiz</h1>
        <p className="page-sub">Düşünce kalıplarını fark et, zihnini tanı.</p>
      </div>

      {/* SUMMARY STATS */}
      {entries.length > 0 && (
        <div className="analysis-stats fade-up fade-up-1">
          <div className="astat">
            <p className="astat-value">{entries.length}</p>
            <p className="astat-label">Analiz edilen giriş</p>
          </div>
          <div className="astat-divider" />
          <div className="astat">
            <p className="astat-value">{totalDistortions}</p>
            <p className="astat-label">Tespit edilen hata</p>
          </div>
          <div className="astat-divider" />
          <div className="astat">
            <p className="astat-value">{cleanEntries}</p>
            <p className="astat-label">Temiz giriş</p>
          </div>
        </div>
      )}

      {entries.length === 0 ? (
        <div className="empty-state fade-up fade-up-2">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9.5 2A2.5 2.5 0 0112 4.5v15a2.5 2.5 0 01-4.96-.44l-1.04-7A2.5 2.5 0 018.5 9H9.5"/>
            <path d="M14.5 2A2.5 2.5 0 0112 4.5v15a2.5 2.5 0 004.96-.44l1.04-7A2.5 2.5 0 0115.5 9H14.5"/>
          </svg>
          <p>Henüz analiz yok.<br />Günlük ekranından bir şeyler yaz ve analiz et.</p>
        </div>
      ) : (
        <div className="analysis-layout fade-up fade-up-2">
          {/* ENTRY LIST */}
          <aside className="entry-sidebar">
            <p className="section-title">Girişler</p>
            <div className="entry-sidebar-list">
              {entries.map((entry) => (
                <button
                  key={entry._id}
                  className={`entry-sidebar-item ${selected?._id === entry._id ? 'entry-sidebar-item--active' : ''}`}
                  onClick={() => setSelected(entry)}
                  type="button"
                >
                  <div className="esi-top">
                    <span className="esi-date">
                      {new Date(entry.createdAt).toLocaleDateString('tr-TR', {
                        day: 'numeric', month: 'short',
                      })}
                    </span>
                    {entry.distortions?.length === 0 ? (
                      <span className="badge badge-sage" style={{ fontSize: '10px', padding: '2px 7px' }}>✓ Temiz</span>
                    ) : (
                      <span className="badge badge-purple" style={{ fontSize: '10px', padding: '2px 7px' }}>
                        {entry.distortions.length} hata
                      </span>
                    )}
                  </div>
                  <p className="esi-preview">
                    {entry.text.length > 60 ? entry.text.slice(0, 60) + '…' : entry.text}
                  </p>
                </button>
              ))}
            </div>
          </aside>

          {/* DETAIL */}
          <div className="analysis-detail">
            {selected && (
              <>
                <div className="detail-source">
                  <p className="section-title">Giriş</p>
                  <p className="detail-source-text">
                    "{selected.text.length > 200 ? selected.text.slice(0, 200) + '…' : selected.text}"
                  </p>
                  <p className="detail-source-date">
                    {new Date(selected.createdAt).toLocaleDateString('tr-TR', {
                      day: 'numeric', month: 'long', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                </div>

                {selected.distortions?.length === 0 ? (
                  <div className="no-distortion fade-up">
                    <div className="no-distortion-icon">✅</div>
                    <div>
                      <p className="no-distortion-title">Düşünce hatası tespit edilmedi</p>
                      <p className="no-distortion-sub">
                        Bu yazıda belirgin bir düşünce hatası gözlemlenmedi. Bu an için zihnin dengeli görünüyor.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="distortions-list">
                    {selected.distortions.map((d, i) => (
                      <DistortionCard key={i} d={d} index={i} />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
