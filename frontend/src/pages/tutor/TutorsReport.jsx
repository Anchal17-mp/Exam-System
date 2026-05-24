import { useEffect, useState } from 'react';
import TutorSidebar from '../../components/TutorSidebar';
import axios from 'axios';

export default function TutorsReport() {
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    axios.get('http://127.0.0.1:8000/api/tutors-report/', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => {
        setTutors(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error:', err);
        setLoading(false);
      });
  }, []);

  const filtered = tutors.filter(t =>
    t.username.toLowerCase().includes(search.toLowerCase())
  );

  const totalExams = tutors.reduce((a, t) => a + t.exam_count, 0);
  const totalQuestions = tutors.reduce((a, t) => a + t.question_count, 0);

  return (
    <div style={s.page}>
      <TutorSidebar />
      <div style={s.main}>
        <h1 style={s.title}>Tutors Report</h1>
        <p style={s.sub}>All tutors registered on the platform</p>

        {/* Stats */}
        <div style={s.statsRow}>
          <div style={s.statCard}>
            <span style={s.statIcon}>👨‍🏫</span>
            <span style={{ ...s.statNum, color: '#7c6ff7' }}>{tutors.length}</span>
            <span style={s.statLabel}>Total Tutors</span>
          </div>
          <div style={s.statCard}>
            <span style={s.statIcon}>📋</span>
            <span style={{ ...s.statNum, color: '#34d399' }}>{totalExams}</span>
            <span style={s.statLabel}>Total Exams</span>
          </div>
          <div style={s.statCard}>
            <span style={s.statIcon}>❓</span>
            <span style={{ ...s.statNum, color: '#f59e0b' }}>{totalQuestions}</span>
            <span style={s.statLabel}>Total Questions</span>
          </div>
        </div>

        {/* Search */}
        <div style={s.searchWrap}>
          <input
            style={s.search}
            type="text"
            placeholder="Search tutors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Table */}
        {loading ? (
          <div style={s.loading}>Loading tutors...</div>
        ) : filtered.length === 0 ? (
          <div style={s.empty}>
            <div style={s.emptyIcon}>👨‍🏫</div>
            <h3 style={s.emptyTitle}>No tutors found</h3>
            <p style={s.emptyDesc}>No tutors are registered on the platform yet.</p>
          </div>
        ) : (
          <div style={s.table}>
            <div style={s.tableHeader}>
              <span>#</span>
              <span>Tutor</span>
              <span>Exams Created</span>
              <span>Total Questions</span>
              <span>Avg Questions/Exam</span>
              <span>Status</span>
            </div>
            {filtered.map((tutor, i) => (
              <div key={tutor.id} style={s.tableRow}>
                <div style={s.indexCell}>{i + 1}</div>
                <div style={s.tutorCell}>
                  <div style={s.avatar}>
                    {tutor.username[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={s.tutorName}>{tutor.username}</div>
                    <div style={s.tutorEmail}>{tutor.email || 'No email'}</div>
                  </div>
                </div>
                <div style={s.cell}>
                  <span style={s.examBadge}>{tutor.exam_count} exams</span>
                </div>
                <div style={s.cell}>{tutor.question_count}</div>
                <div style={s.cell}>
                  {tutor.exam_count > 0
                    ? Math.round(tutor.question_count / tutor.exam_count)
                    : 0} Q/exam
                </div>
                <div>
                  <span style={s.activeBadge}>● Active</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  page: { display: 'flex', minHeight: '100vh', background: '#0f0f13' },
  main: { flex: 1, padding: window.innerWidth <= 768 ? '76px 16px 24px' : '40px', overflowY: 'auto' },
  title: { fontSize: '28px', fontWeight: '700', color: '#f0eeff', marginBottom: '6px' },
  sub: { color: '#7c7a8e', fontSize: '14px', marginBottom: '28px' },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' },
  statCard: { background: '#1a1a24', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' },
  statIcon: { fontSize: '24px' },
  statNum: { fontSize: '28px', fontWeight: '700', fontFamily: 'Syne, sans-serif' },
  statLabel: { fontSize: '12px', color: '#7c7a8e', textTransform: 'uppercase', letterSpacing: '0.05em' },
  searchWrap: { marginBottom: '20px' },
  search: { width: '100%', maxWidth: '360px', padding: '11px 16px', background: '#1a1a24', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: '#f0eeff', fontSize: '14px', outline: 'none', fontFamily: 'DM Sans, sans-serif' },
  loading: { textAlign: 'center', color: '#7c7a8e', padding: '80px' },
  empty: { textAlign: 'center', padding: '80px 20px' },
  emptyIcon: { fontSize: '48px', marginBottom: '16px' },
  emptyTitle: { fontSize: '20px', fontWeight: '600', color: '#f0eeff', marginBottom: '8px' },
  emptyDesc: { fontSize: '14px', color: '#7c7a8e' },
  table: { background: '#1a1a24', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', overflow: 'hidden' },
  tableHeader: { display: 'grid', gridTemplateColumns: '0.3fr 2fr 1fr 1fr 1fr 1fr', gap: '12px', padding: '14px 24px', background: '#16161d', fontSize: '11px', color: '#7c7a8e', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '500' },
  tableRow: { display: 'grid', gridTemplateColumns: '0.3fr 2fr 1fr 1fr 1fr 1fr', gap: '12px', padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.05)', alignItems: 'center' },
  indexCell: { fontSize: '13px', color: '#7c7a8e' },
  tutorCell: { display: 'flex', alignItems: 'center', gap: '12px' },
  avatar: { width: '38px', height: '38px', borderRadius: '50%', background: '#7c6ff7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: '700', color: 'white', flexShrink: 0 },
  tutorName: { fontSize: '14px', fontWeight: '500', color: '#f0eeff' },
  tutorEmail: { fontSize: '12px', color: '#7c7a8e', marginTop: '2px' },
  cell: { fontSize: '13px', color: '#9090b0' },
  examBadge: { background: 'rgba(124,111,247,0.12)', color: '#a78bfa', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '500' },
  activeBadge: { color: '#34d399', fontSize: '13px', fontWeight: '500' },
};