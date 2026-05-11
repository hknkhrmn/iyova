import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEntries, createEntry, deleteEntry } from '../services/api';
import './Journal.css';

const MOODS = [
  { key: 'İyi',    emoji: '😊' },
  { key: 'Karışık', emoji: '😐' },
  { key: 'Yorgun', emoji: '😔' },
  { key: 'Kaygılı', emoji: '😰' },
  { key: 'Kötü',   emoji: '😞' },
];

export default function Journal() {
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const [mood, setMood] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEntries();
  }, []);

  async function fetchEntries() {
    try {
      const res = await getEntries();
      setEntries(res.data);
    } catch {
      // backend henüz bağlı değil
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    if (text.trim().length < 20) {
      setError('Lütfen en az 20 karakter yaz.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await createEntry({ text: text.trim(), mood });
      setText('');
      setMood(null);
      await fetchEntries();
      navigate('/analysis');
    } catch {
      setError('Giriş kaydedilemedi. Backend bağlantısı kontrol edilsin.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Bu girişi silmek istiyor musun?')) return;
    try {
      await deleteEntry(id);
      setEntries((prev) => prev.filter((e) => e._id !== id));
    } catch {
      alert('Silme işlemi başarısız.');
    }
  }

  return (
    <div className="journal-page fade-up">
      <div className="page-header">
        <h1>Günlük</h1>
        <p className="page-sub">Bugünü yaz, zihnini analiz et.</p>
      </div>

      {/* WRITE CARD */}
      <div className="card write-card fade-up fade-up-1">
        {/* MOOD */}
        <div className="mood-section">
          <label className="field-label">Nasıl hissediyorsun?</label>
          <div className="mood-row">
            {MOODS.map((m) => (
              <button
                key={m.key}
                className={`mood-btn ${mood === m.key ? 'mood-btn--active' : ''}`}
                onClick={() => setMood(mood === m.key ? null : m.key)}
                type="button"
              >
                <span className="mood-emoji">{m.emoji}</span>
                <span className="mood-label">{m.key}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="divider" />

        {/* TEXT */}
        <div>
          <label className="field-label" htmlFor="journal-text">Bugünü anlat</label>
          <textarea
            id="journal-text"
            className="journal-textarea"
            placeholder="Bugün neler hissettin? Ne yaşadın? Zihninde ne dolaşıyor…"
            value={text}
            onChange={(e) => { setText(e.target.value); setError(''); }}
            rows={7}
          />
          <div className="textarea-footer">
            {error && <p className="error-msg">{error}</p>}
            <span className={`char-count ${text.length < 20 ? 'char-count--warn' : ''}`}>
              {text.length} karakter
            </span>
          </div>
        </div>

        <button
          className="btn btn-sage btn-full submit-btn"
          onClick={handleSubmit}
          disabled={submitting}
          type="button"
        >
          {submitting ? (
            <><div className="spinner" /> Analiz ediliyor…</>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9.5 2A2.5 2.5 0 0112 4.5v15a2.5 2.5 0 01-4.96-.44l-1.04-7A2.5 2.5 0 018.5 9H9.5"/>
                <path d="M14.5 2A2.5 2.5 0 0112 4.5v15a2.5 2.5 0 004.96-.44l1.04-7A2.5 2.5 0 0115.5 9H14.5"/>
              </svg>
              Analiz Et
            </>
          )}
        </button>
      </div>

      {/* HISTORY */}
      <div className="fade-up fade-up-2">
        <p className="section-title">Geçmiş Girişler</p>
        {loading ? (
          <div className="empty-state"><div className="spinner" /></div>
        ) : entries.length === 0 ? (
          <div className="empty-state">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            <p>Henüz hiç giriş yok.<br />Yukarıdan ilk girişini yapabilirsin.</p>
          </div>
        ) : (
          <div className="history-list">
            {entries.map((entry) => (
              <div key={entry._id} className="history-card card">
                <div className="history-top">
                  <div className="history-meta">
                    <span className="history-date">
                      {new Date(entry.createdAt).toLocaleDateString('tr-TR', {
                        day: 'numeric', month: 'long', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </span>
                    {entry.mood && (
                      <span className="badge badge-sage">
                        {MOODS.find((m) => m.key === entry.mood)?.emoji} {entry.mood}
                      </span>
                    )}
                    {entry.distortions?.length > 0 && (
                      <span className="badge badge-purple">{entry.distortions.length} hata</span>
                    )}
                  </div>
                  <button
                    className="btn btn-danger-ghost btn-sm"
                    onClick={() => handleDelete(entry._id)}
                    type="button"
                    title="Sil"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                      <path d="M10 11v6"/><path d="M14 11v6"/>
                    </svg>
                  </button>
                </div>
                <p className="history-text">{entry.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
