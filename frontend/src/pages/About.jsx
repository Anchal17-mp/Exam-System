import Navbar from '../components/Navbar';

export default function About() {
  return (
    <div style={s.page}>
      <Navbar />
      <div style={s.container}>
        <div style={s.badge}>About</div>
        <h1 style={s.title}>Online Examination System</h1>
        <p style={s.desc}>A full-stack web application built with Django and React that allows tutors to create and manage exams, and students to take them with real-time timers and instant results.</p>
        <div style={s.grid}>
          {[
            { title: 'For Tutors', desc: 'Create exams, add questions, set correct answers, view student performance reports and manage the entire examination process from one dashboard.' },
            { title: 'For Students', desc: 'Browse available exams, take timed tests, view instant results and track your performance history — all from a clean, easy-to-use interface.' },
            { title: 'Tech Stack', desc: 'Built with Django REST Framework for the backend API, React.js for the frontend, JWT for authentication and MySQL for the database.' },
          ].map((item) => (
            <div key={item.title} style={s.card}>
              <h3 style={s.cardTitle}>{item.title}</h3>
              <p style={s.cardDesc}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', background: '#0f0f13' },
  container: { maxWidth: '800px', margin: '0 auto', padding: '80px 40px', textAlign: 'center' },
  badge: { display: 'inline-block', padding: '6px 16px', background: 'rgba(124,111,247,0.15)', border: '1px solid rgba(124,111,247,0.3)', borderRadius: '20px', color: '#a78bfa', fontSize: '13px', marginBottom: '20px' },
  title: { fontSize: '40px', fontWeight: '800', color: '#f0eeff', marginBottom: '20px', fontFamily: 'Syne, sans-serif' },
  desc: { fontSize: '16px', color: '#7c7a8e', lineHeight: 1.8, marginBottom: '48px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px', textAlign: 'left' },
  card: { background: '#1a1a24', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '24px' },
  cardTitle: { fontSize: '16px', fontWeight: '600', color: '#f0eeff', marginBottom: '10px' },
  cardDesc: { fontSize: '13px', color: '#7c7a8e', lineHeight: 1.7 },
};