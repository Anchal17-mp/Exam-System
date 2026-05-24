import { useEffect, useState } from 'react';
import TutorSidebar from '../../components/TutorSidebar';
import { getTutorResults } from '../../services/api';

export default function StudentsReport() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getTutorResults()
      .then((res) => {
        setResults(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error:', err);
        setLoading(false);
      });
  }, []);

  // Group results by student
  const studentMap = {};
  results.forEach((r) => {
    const key = r.student_name || `Student #${r.student}`;
    if (!studentMap[key]) {
      studentMap[key] = {
        name: key,
        exams: [],
        totalScore: 0,
        totalPossible: 0,
      };
    }
    studentMap[key].exams.push(r);
    studentMap[key].totalScore += r.score;
    studentMap[key].totalPossible += r.total;
  });

  const students = Object.values(studentMap).filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalStudents = students.length;
  const totalExamsTaken = results.length;
  const avgScore = results.length > 0
    ? Math.round(results.reduce((a, r) => a + (r.score / r.total) * 100, 0) / results.length)
    : 0;

  return (
    <div style={s.page}>
      <TutorSidebar />
      <div style={s.main}>
        <h1 style={s.title}>Students Report</h1>
        <p style={s.sub}>Students who have taken your exams</p>

        {/* Stats */}
        <div style={s.statsRow}>
          <div style={s.statCard}>
            <span style={s.statIcon}>🎓</span>
            <span style={{ ...s.statNum, color: '#7c6ff7' }}>{totalStudents}</span>
            <span style={s.statLabel}>Total Students</span>
          </div>
          <div style={s.statCard}>
            <span style={s.statIcon}>📝</span>
            <span style={{ ...s.statNum, color: '#34d399' }}>{totalExamsTaken}</span>
            <span style={s.statLabel}>Exams Taken</span>
          </div>
          <div style={s.statCard}>
            <span style={s.statIcon}>📊</span>
            <span style={{ ...s.statNum, color: '#f59e0b' }}>{avgScore}%</span>
            <span style={s.statLabel}>Avg Score</span>
          </div>
        </div>

        {/* Search */}
        <div style={s.searchWrap}>
          <input
            style={s.search}
            type="text"
            placeholder="Search students..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Table */}
        {loading ? (
          <div style={s.loading}>Loading students...</div>
        ) : students.length === 0 ? (
          <div style={s.empty}>
            <div style={s.emptyIcon}>🎓</div>
            <h3 style={s.emptyTitle}>No students yet</h3>
            <p style={s.emptyDesc}>No students have taken your exams yet.</p>
          </div>
        ) : (
          <div style={s.table}>
            <div style={s.tableHeader}>
              <span>Student</span>
              <span>Exams Taken</span>
              <span>Total Score</span>
              <span>Avg Score</span>
              <span>Status</span>
            </div>
            {students.map((student, i) => {
              const avg = Math.round((student.totalScore / student.totalPossible) * 100);
              const passed = student.exams.filter(e => e.score / e.total >= 0.5).length;
              return (
                <div key={i} style={s.tableRow}>
                  <div style={s.studentCell}>
                    <div style={s.studentAvatar}>
                      {student.name[0].toUpperCase()}
                    </div>
                    <span style={s.studentName}>{student.name}</span>
                  </div>
                  <div style={s.cell}>{student.exams.length}</div>
                  <div style={s.cell}>
                    {student.totalScore}/{student.totalPossible}
                  </div>
                  <div style={{ ...s.cell, color: avg >= 50 ? '#34d399' : '#f87171', fontWeight: '600' }}>
                    {avg}%
                  </div>
                  <div style={s.cell}>
                    <span style={s.passCount}>✓ {passed} passed</span>
                    <span style={s.failCount}>✗ {student.exams.length - passed} failed</span>
                  </div>
                </div>
              );
            })}
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
  tableHeader: { display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1.5fr', gap: '16px', padding: '14px 24px', background: '#16161d', fontSize: '11px', color: '#7c7a8e', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '500' },
  tableRow: { display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1.5fr', gap: '16px', padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.05)', alignItems: 'center' },
  studentCell: { display: 'flex', alignItems: 'center', gap: '12px' },
  studentAvatar: { width: '36px', height: '36px', borderRadius: '50%', background: '#7c6ff7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700', color: 'white', flexShrink: 0 },
  studentName: { fontSize: '14px', fontWeight: '500', color: '#f0eeff' },
  cell: { fontSize: '14px', color: '#9090b0' },
  passCount: { display: 'block', fontSize: '12px', color: '#34d399' },
  failCount: { display: 'block', fontSize: '12px', color: '#f87171' },
};