import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const menuItems = [
  { label: 'Available Exams', path: '/student-dashboard', icon: '📝' },
  { label: 'My Results', path: '/my-results', icon: '📊' },
  { label: 'My Account', path: '/student-account', icon: '👤' },
];

export default function StudentSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const username = localStorage.getItem('username') || 'Student';
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) setMobileOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <>
      {/* Mobile Top Bar */}
      {isMobile && (
        <div style={s.mobileBar}>
          <div style={s.mobileBrand}>ExamPro</div>
          <span style={s.mobileUser}>{username}</span>
          <button style={s.hamburger} onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? '✕' : '☰'}
          </button>
        </div>
      )}

      {/* Overlay */}
      {isMobile && mobileOpen && (
        <div style={s.overlay} onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      {(!isMobile || mobileOpen) && (
        <div style={isMobile ? s.mobileSidebar : s.sidebar}>
          {!isMobile && (
            <>
              <div style={s.brand}>ExamPro</div>
              <div style={s.role}>Student Portal</div>
              <div style={s.avatar}>{username[0].toUpperCase()}</div>
              <div style={s.username}>{username}</div>
            </>
          )}
          {isMobile && (
            <div style={s.mobileHeader}>
              <div style={s.avatar}>{username[0].toUpperCase()}</div>
              <div>
                <div style={s.username}>{username}</div>
                <div style={s.role}>Student Portal</div>
              </div>
            </div>
          )}
          <div style={s.menu}>
            {menuItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  style={{ ...s.menuItem, ...(active ? s.menuActive : {}) }}
                  onClick={() => setMobileOpen(false)}>
                  <span style={s.icon}>{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </div>
          <button style={s.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
      )}
    </>
  );
}

const s = {
  mobileBar: { position: 'fixed', top: 0, left: 0, right: 0, height: '50px', background: '#16161d', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', zIndex: 200 },
  mobileBrand: { fontFamily: 'Syne, sans-serif', fontSize: '18px', fontWeight: '800', color: '#7c6ff7' },
  mobileUser: { fontSize: '13px', color: '#7c7a8e' },
  hamburger: { background: 'transparent', border: 'none', color: '#f0eeff', fontSize: '22px', cursor: 'pointer', padding: '8px' },
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 298 },
  sidebar: { width: '240px', minHeight: '100vh', background: '#16161d', borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', padding: '30px 16px', flexShrink: 0 },
  mobileSidebar: { position: 'fixed', top: 0, left: 0, width: '280px', height: '100vh', background: '#16161d', borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', padding: '24px 16px', zIndex: 299, overflowY: 'auto' },
  mobileHeader: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', paddingTop: '8px' },
  brand: { fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: '800', color: '#7c6ff7', marginBottom: '4px', letterSpacing: '1px' },
  role: { fontSize: '11px', color: '#7c7a8e', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' },
  avatar: { width: '48px', height: '48px', borderRadius: '50%', background: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '18px', color: '#0f0f13', flexShrink: 0, marginBottom: '8px' },
  username: { fontSize: '14px', fontWeight: '500', color: '#f0eeff', marginBottom: '4px' },
  menu: { display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 },
  menuItem: { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', color: '#9090b0', textDecoration: 'none', fontSize: '14px', transition: 'all 0.15s' },
  menuActive: { background: 'rgba(52,211,153,0.12)', color: '#f0eeff', borderLeft: '3px solid #34d399', paddingLeft: '9px' },
  icon: { fontSize: '16px', width: '20px', textAlign: 'center' },
  logoutBtn: { padding: '10px', background: 'transparent', border: '1px solid rgba(248,113,113,0.3)', color: '#f87171', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontFamily: 'DM Sans, sans-serif', marginTop: '16px' },
};