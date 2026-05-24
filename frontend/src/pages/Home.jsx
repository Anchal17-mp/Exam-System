import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div style={s.page}>
      <Navbar />

      {/* Hero */}
      <div style={s.hero}>
        <div style={s.heroContent}>
          <div style={s.heroBadge}>Online Examination System</div>
          <h1 style={s.heroTitle}>The smarter way<br />to test &amp; learn</h1>
          <p style={s.heroSub}>A modern platform for tutors to create exams and for students to take them — with instant results, timers, and detailed reports.</p>
          <div style={s.heroBtns}>
            <button style={s.primaryBtn} onClick={() => navigate('/student-login')}>Start as Student</button>
            <button style={s.primaryBtn} onClick={() => navigate('/tutor-login')}>Start as Tutor</button>
          </div>
        </div>

        {/* Feature Cards */}
        <div style={s.heroVisual}>
          <div style={s.card1}>
            <div style={s.cardIcon}>📝</div>
            <div style={s.cardLabel}>MCQ Based</div>
            <div style={s.cardDesc}>Multiple choice questions with instant auto-grading</div>
          </div>
          <div style={s.card2}>
            <div style={s.cardIcon}>⏱</div>
            <div style={s.cardLabel}>Timed Exams</div>
            <div style={s.cardDesc}>Countdown timer with auto-submit when time runs out</div>
          </div>
          <div style={s.card3}>
            <div style={s.cardIcon}>🤖</div>
            <div style={s.cardLabel}>AI Powered</div>
            <div style={s.cardDesc}>Generate exam questions automatically using AI</div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div style={s.features}>
        <h2 style={s.featTitle}>Everything you need</h2>
        <div style={s.featGrid}>
          {[
            { icon: '⏱', title: 'Timed Exams', desc: 'Auto-submit when time runs out. Students stay focused.' },
            { icon: '📊', title: 'Instant Results', desc: 'Score calculated immediately after submission.' },
            { icon: '👨‍🏫', title: 'Tutor Dashboard', desc: 'Create exams, manage questions and view all reports.' },
            { icon: '🎓', title: 'Student Portal', desc: 'Clean interface to take exams and track progress.' },
            { icon: '🔒', title: 'Secure Login', desc: 'Separate logins for tutors and students with JWT auth.' },
            { icon: '📋', title: 'Detailed Reports', desc: 'Track student performance, results and question stats.' },
          ].map((f) => (
            <div key={f.title} style={s.featCard}>
              <div style={s.featIcon}>{f.icon}</div>
              <h3 style={s.featCardTitle}>{f.title}</h3>
              <p style={s.featCardDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={s.footer}>
        <div style={s.footerBrand}>ExamPro</div>
        <div style={s.footerText}>Online Examination System — Built with Django & React</div>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', background: '#0f0f13' },
  hero: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '1100px', margin: '0 auto', padding: '80px 40px', gap: '60px', flexWrap: 'wrap' },
  heroContent: { flex: 1, minWidth: '300px' },
  heroBadge: { display: 'inline-block', padding: '6px 16px', background: 'rgba(124,111,247,0.15)', border: '1px solid rgba(124,111,247,0.3)', borderRadius: '20px', color: '#a78bfa', fontSize: '13px', fontWeight: '500', marginBottom: '24px' },
  heroTitle: { fontSize: '52px', fontWeight: '800', lineHeight: 1.1, color: '#f0eeff', marginBottom: '20px', fontFamily: 'Syne, sans-serif' },
  heroSub: { fontSize: '16px', color: '#7c7a8e', lineHeight: 1.8, marginBottom: '36px', maxWidth: '460px' },
  heroBtns: { display: 'flex', gap: '12px', flexWrap: 'wrap' },
  primaryBtn: { padding: '13px 28px', background: '#7c6ff7', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' },
  secondaryBtn: { padding: '13px 28px', background: 'transparent', color: '#f0eeff', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', fontSize: '15px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' },
  heroVisual: { display: 'flex', flexDirection: 'column', gap: '12px' },
  card1: { background: '#1a1a24', border: '1px solid rgba(124,111,247,0.3)', borderRadius: '14px', padding: '20px 28px', textAlign: 'left', width: '240px' },
  card2: { background: '#1a1a24', border: '1px solid rgba(52,211,153,0.3)', borderRadius: '14px', padding: '20px 28px', textAlign: 'left', width: '240px' },
  card3: { background: '#1a1a24', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '14px', padding: '20px 28px', textAlign: 'left', width: '240px' },
  cardIcon: { fontSize: '28px', marginBottom: '10px' },
  cardLabel: { fontSize: '15px', fontWeight: '700', color: '#f0eeff', marginBottom: '6px', fontFamily: 'Syne, sans-serif' },
  cardDesc: { fontSize: '12px', color: '#7c7a8e', lineHeight: 1.6 },
  features: { maxWidth: '1100px', margin: '0 auto', padding: '60px 40px' },
  featTitle: { fontSize: '32px', fontWeight: '700', color: '#f0eeff', marginBottom: '32px', textAlign: 'center', fontFamily: 'Syne, sans-serif' },
  featGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' },
  featCard: { background: '#1a1a24', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '24px' },
  featIcon: { fontSize: '28px', marginBottom: '12px' },
  featCardTitle: { fontSize: '16px', fontWeight: '600', color: '#f0eeff', marginBottom: '8px' },
  featCardDesc: { fontSize: '13px', color: '#7c7a8e', lineHeight: 1.7 },
  footer: { borderTop: '1px solid rgba(255,255,255,0.06)', padding: '30px 60px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' },
  footerBrand: { fontFamily: 'Syne, sans-serif', fontSize: '18px', fontWeight: '800', color: '#7c6ff7' },
  footerText: { fontSize: '13px', color: '#7c7a8e' },
};