import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentSidebar from '../../components/StudentSidebar';
import { getExams, getResults } from '../../services/api';

export default function StudentDashboard() {
  const [exams, setExams] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const username = localStorage.getItem('username') || 'Student';

  const fetchData = () => {
    setLoading(true);
    Promise.all([getExams(), getResults()])
      .then(([examRes, resultRes]) => {
        setExams(examRes.data);
        setResults(resultRes.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching data:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getResultForExam = (examId) =>
    results.find((r) => r.exam === examId);

  const colors = ['#7c6ff7', '#34d399', '#f59e0b', '#f87171', '#60a5fa'];

  return (
    <div style={s.page}>
      <StudentSidebar />
      <div style={s.main}>
        <div style={s.header}>
          <div>
            <h1 style={s.title}>Available Exams</h1>
            <p style={s.sub}>Hello {username}! Pick an exam to get started.</p>
          </div>
          <div style={s.statsRow}>
            <div style={s.stat}>
              <span style={s.statNum}>{exams.length}</span>
              <span style={s.statLabel}>Total Exams</span>
            </div>
            <div style={s.stat}>
              <span style={s.statNum}>{results.length}</span>
              <span style={s.statLabel}>Completed</span>
            </div>
            <div style={s.stat}>
              <span style={{ ...s.statNum, color: '#34d399' }}>
                {results.length > 0
                  ? Math.round(results.reduce((a, r) => a + (r.score / r.total) * 100, 0) / results.length) + '%'
                  : 'N/A'}
              </span>
              <span style={s.statLabel}>Avg Score</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div style={s.loading}>Loading exams...</div>
        ) : exams.length === 0 ? (
          <div style={s.empty}>
            <div style={s.emptyIcon}>📝</div>
            <h3 style={s.emptyTitle}>No exams available yet</h3>
            <p style={s.emptyDesc}>Check back later — your tutors will add exams soon.</p>
          </div>
        ) : (
          <div style={s.grid}>
            {exams.map((exam, i) => {
              const result = getResultForExam(exam.id);
              const color = colors[i % colors.length];
              return (
                <div key={exam.id} style={s.card}>
                  <div style={{ ...s.cardTop, background: color }} />
                  <div style={s.cardBody}>
                    <div style={s.cardMeta}>
                      <span style={s.tutorTag}>
                        👨‍🏫 {exam.created_by || 'Tutor'}
                      </span>
                    </div>
                    <h3 style={s.examTitle}>{exam.title}</h3>
                    <p style={s.examDesc}>
                      {exam.description || 'Test your knowledge in this subject.'}
                    </p>
                    <div style={s.tags}>
                      <span style={s.tag}>{exam.questions.length} Questions</span>
                      <span style={s.tag}>{exam.duration_minutes} mins</span>
                    </div>
                    {result ? (
                      <div style={s.resultBox}>
                        <div style={s.resultInfo}>
                          <span style={{
                            color: result.score / result.total >= 0.5 ? '#34d399' : '#f87171',
                            fontWeight: '700', fontSize: '14px'
                          }}>
                            {result.score}/{result.total} — {Math.round((result.score / result.total) * 100)}%
                          </span>
                          <span style={{
                            ...s.passBadge,
                            background: result.score / result.total >= 0.5 ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)',
                            color: result.score / result.total >= 0.5 ? '#34d399' : '#f87171'
                          }}>
                            {result.score / result.total >= 0.5 ? 'Passed' : 'Failed'}
                          </span>
                        </div>
                        <button
                          style={{ ...s.btn, background: color }}
                          onClick={() => navigate(`/exam/${exam.id}`)}>
                          Retake
                        </button>
                      </div>
                    ) : (
                      <button
                        style={{ ...s.btn, background: color }}
                        onClick={() => navigate(`/exam/${exam.id}`)}>
                        Start Exam →
                      </button>
                    )}
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
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '20px' },
  title: { fontSize: '28px', fontWeight: '700', color: '#f0eeff', marginBottom: '6px' },
  sub: { color: '#7c7a8e', fontSize: '14px' },
  statsRow: { display: 'flex', gap: '12px' },
  stat: { background: '#1a1a24', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '14px 20px', textAlign: 'center', minWidth: '80px' },
  statNum: { display: 'block', fontSize: '22px', fontWeight: '700', color: '#7c6ff7', fontFamily: 'Syne, sans-serif' },
  statLabel: { fontSize: '11px', color: '#7c7a8e', textTransform: 'uppercase', letterSpacing: '0.05em' },
  loading: { textAlign: 'center', color: '#7c7a8e', padding: '80px', fontSize: '15px' },
  empty: { textAlign: 'center', padding: '80px 20px' },
  emptyIcon: { fontSize: '48px', marginBottom: '16px' },
  emptyTitle: { fontSize: '20px', fontWeight: '600', color: '#f0eeff', marginBottom: '8px' },
  emptyDesc: { fontSize: '14px', color: '#7c7a8e' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' },
  card: { background: '#1a1a24', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.07)', overflow: 'hidden' },
  cardTop: { height: '4px' },
  cardBody: { padding: '22px' },
  cardMeta: { marginBottom: '10px' },
  tutorTag: { fontSize: '12px', color: '#7c7a8e', background: '#16161d', padding: '4px 10px', borderRadius: '20px' },
  examTitle: { fontSize: '17px', fontWeight: '700', color: '#f0eeff', marginBottom: '8px' },
  examDesc: { fontSize: '13px', color: '#7c7a8e', marginBottom: '14px', lineHeight: 1.6 },
  tags: { display: 'flex', gap: '8px', marginBottom: '18px' },
  tag: { background: 'rgba(124,111,247,0.12)', color: '#a78bfa', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '500' },
  btn: { width: '100%', padding: '11px', border: 'none', borderRadius: '10px', color: 'white', fontWeight: '600', fontSize: '14px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' },
  resultBox: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' },
  resultInfo: { display: 'flex', alignItems: 'center', gap: '8px' },
  passBadge: { padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
};