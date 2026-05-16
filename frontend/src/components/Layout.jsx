import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import './Layout.css';

const navItems = [
  { to: '/', label: 'Özet', emoji: '✦' },
  { to: '/journal', label: 'Günlük', emoji: '✿' },
  { to: '/analysis', label: 'Analiz', emoji: '◎' },
  { to: '/meds', label: 'İlaçlar', emoji: '❋' },
];

function OrganicBlobs() {
  return (
    <div className="blobs-container" aria-hidden="true">
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />
    </div>
  );
}

export default function Layout() {
  const location = useLocation();

  return (
    <div className="layout">
      <OrganicBlobs />

      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-mark-wrap">
            <span className="brand-mark-letter">İ</span>
            <div className="brand-mark-glow" />
          </div>
          <span className="brand-name">İyova</span>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'nav-item--active' : ''}`
              }
            >
              <span className="nav-emoji">{item.emoji}</span>
              <span className="nav-label">{item.label}</span>
              <div className="nav-glow" />
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-quote">
            <div className="quote-mark">"</div>
            <p>İyileşmek bir yolculuktur, varış noktası değil.</p>
          </div>
        </div>
      </aside>

      {/* BOTTOM NAV (mobile) */}
      <nav className="bottom-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `bottom-nav-item ${isActive ? 'bottom-nav-item--active' : ''}`
            }
          >
            <span className="bottom-nav-emoji">{item.emoji}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* MAIN */}
      <main className="main-content">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          style={{ height: '100%' }}
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
}
