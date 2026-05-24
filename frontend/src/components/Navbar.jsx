import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const role = localStorage.getItem('role');
  const token = localStorage.getItem('access_token');
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
    setMobileOpen(false);
  };

  return (
    <nav style={s.nav}>
      <Link to="/" style={s.brand}>ExamPro</Link>

      {/* Desktop Links — hide on mobile */}
      {!isMobile && (
        <div style={s.links}>
          <Link to="/" style={s.link}>Home</Link>
          <Link to="/about" style={s.link}>About</Link>
          {!token && <>
            <Link to="/tutor-login" style={s.link}>Tutor Login</Link>
            <Link to="/student-login" style={s.link}>Student Login</Link>
            <Link to="/register" style={s.registerBtn}>Register</Link>
          </>}
          {token && role === 'tutor' && <>
            <Link to="/tutor-dashboard" style={s.link}>Dashboard</Link>
            <button onClick={handleLogout} style={s.logoutBtn}>Logout</button>
          </>}
          {token && role === 'student' && <>
            <Link to="/student-dashboard" style={s.link}>Dashboard</Link>
            <button onClick={handleLogout} style={s.logoutBtn}>Logout</button>
          </>}
        </div>
      )}

      {/* Mobile Hamburger — show on mobile */}
      {isMobile && (
        <button style={s.hamburger} onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? '✕' : '☰'}
        </button>
      )}

      {/* Mobile Menu */}
      {isMobile && mobileOpen && (
        <div style={s.mobileMenu}>
          <Link to="/" style={s.mobileLink} onClick={() => setMobileOpen(false)}>Home</Link>
          <Link to="/about" style={s.mobileLink} onClick={() => setMobileOpen(false)}>About</Link>
          {!token && <>
            <Link to="/tutor-login" style={s.mobileLink} onClick={() => setMobileOpen(false)}>Tutor Login</Link>
            <Link to="/student-login" style={s.mobileLink} onClick={() => setMobileOpen(false)}>Student Login</Link>
            <Link to="/register" style={s.mobileLink} onClick={() => setMobileOpen(false)}>Register</Link>
          </>}
          {token && <>
            <Link
              to={role === 'tutor' ? '/tutor-dashboard' : '/student-dashboard'}
              style={s.mobileLink}
              onClick={() => setMobileOpen(false)}>
              Dashboard
            </Link>
            <button onClick={handleLogout} style={s.mobileLogout}>Logout</button>
          </>}
        </div>
      )}
    </nav>
  );
}

const s = {
  nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 40px', height: '68px', background: '#16161d', borderBottom: '1px solid rgba(255,255,255,0.06)',  top: 0, zIndex: 100, flexWrap: 'wrap', position: 'relative' },
  brand: { fontFamily: 'Syne, sans-serif', fontSize: '22px', fontWeight: '800', color: '#7c6ff7', textDecoration: 'none', letterSpacing: '1px' },
  links: { display: 'flex', alignItems: 'center', gap: '8px' },
  link: { color: '#9090b0', textDecoration: 'none', fontSize: '14px', padding: '6px 12px', borderRadius: '8px' },
  registerBtn: { padding: '8px 18px', background: '#7c6ff7', color: 'white', borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: '600' },
  logoutBtn: { padding: '8px 18px', background: 'transparent', border: '1px solid rgba(248,113,113,0.4)', color: '#f87171', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' },
  hamburger: { background: 'transparent', border: 'none', color: '#f0eeff', fontSize: '24px', cursor: 'pointer', padding: '8px' },
  mobileMenu: { position: 'absolute', top: '68px', left: 0, right: 0, background: '#16161d', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '4px', zIndex: 99 },
  mobileLink: { color: '#9090b0', textDecoration: 'none', fontSize: '15px', padding: '12px 16px', borderRadius: '8px', display: 'block' },
  mobileLogout: { width: '100%', padding: '12px 16px', background: 'transparent', border: '1px solid rgba(248,113,113,0.4)', color: '#f87171', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', textAlign: 'left' },
};