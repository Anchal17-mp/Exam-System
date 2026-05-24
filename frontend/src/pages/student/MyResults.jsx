import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentSidebar from '../../components/StudentSidebar';
import { getResults } from '../../services/api';

export default function MyResults() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getResults()
      .then((res) => {
        setResults(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching results:', err);
        setLoading(false);
      });
  }, []);

  const totalExams = results.length;
  const passed = results.filter(r => r.score / r.total >= 0.5).length;
  const failed = totalExams - passed;
  const avgScore = totalExams > 0
    ? Math.round(results.reduce((a, r) => a + (r.score / r.total) * 100, 0) / totalExams)
    : 0;

  return (
    <div style={s.page}>
      <StudentSidebar />
      <div style={s.main}>

        {/* Header */}
        <div style={s.header}>
          <div>
            <h1 style={s.title}>My Results</h1>
            <p style={s.sub}>Track your exam performance history</p>
          </div>
          <button style={s.dashBtn} onClick={() => navigate('/student-dashboard')}>
            ← Back to Exams
          </button>
        </div>

        {/* Stats Row */}
        <div style={s.statsRow}>
          <div style={s.statCard}>
            <span style={s.statIcon}>📝</span>
            <span style={{ ...s.statNum, color: '#7c6ff7' }}>{totalExams}</span>
            <span style={s.statLabel}>Total Taken</span>
          </div>
          <div style={s.statCard}>
            <span style={s.statIcon}>✅</span>
            <span style={{ ...s.statNum, color: '#34d399' }}>{passed}</span>
            <span style={s.statLabel}>Passed</span>
          </div>
          <div style={s.statCard}>
            <span style={s.statIcon}>❌</span>
            <span style={{ ...s.statNum, color: '#f87171' }}>{failed}</span>
            <span style={s.statLabel}>Failed</span>
          </div>
          <div style={s.statCard}>
            <span style={s.statIcon}>📊</span>
            <span style={{ ...s.statNum, color: '#f59e0b' }}>{avgScore}%</span>
            <span style={s.statLabel}>Avg Score</span>
          </div>
        </div>

        {/* Results List */}
        {loading ? (
          <div style={s.loading}>Loading results...</div>
        ) : results.length === 0 ? (
          <div style={s.empty}>
            <div style={s.emptyIcon}>📋</div>
            <h3 style={s.emptyTitle}>No results yet</h3>
            <p style={s.emptyDesc}>You haven't taken any exams yet.</p>
            <button style={s.takeBtn} onClick={() => navigate('/student-dashboard')}>
              Browse Available Exams
            </button>
          </div>
        ) : (
          <div style={s.resultsList}>
            <div style={s.listHeader}>
              <span>Exam</span>
              <span>Score</span>
              <span>Percentage</span>
              <span>Status</span>
              <span>Date</span>
            </div>
            {results.slice().reverse().map((r, i) => {
              const pct = Math.round((r.score / r.total) * 100);
              const isPassed = pct >= 50;
              return (
                <div key={i} style={s.resultRow}>
                  <div style={s.examInfo}>
                    <div style={s.examName}>{r.exam_title || `Exam #${r.exam}`}</div>
                  </div>
                  <div style={s.scoreCell}>
                    <span style={s.scoreText}>{r.score}/{r.total}</span>
                    <div style={s.progressBar}>
                      <div style={{
                        ...s.progressFill,
                        width: `${pct}%`,
                        background: isPassed ? '#34d399' : '#f87171'
                      }} />
                    </div>
                  </div>
                  <div style={{ ...s.pctText, color: isPassed ? '#34d399' : '#f87171' }}>
                    {pct}%
                  </div>
                  <div>
                    <span style={{
                      ...s.badge,
                      background: isPassed ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)',
                      color: isPassed ? '#34d399' : '#f87171',
                      border: `1px solid ${isPassed ? 'rgba(52,211,153,0.3)' : 'rgba(248,113,113,0.3)'}`
                    }}>
                      {isPassed ? '✓ Passed' : '✗ Failed'}
                    </span>
                  </div>
                  <div style={s.dateText}>
                    {new Date(r.taken_at).toLocaleDateString('en-US', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
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
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' },
  title: { fontSize: '28px', fontWeight: '700', color: '#f0eeff', marginBottom: '6px' },
  sub: { color: '#7c7a8e', fontSize: '14px' },
  dashBtn: { padding: '10px 20px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#9090b0', borderRadius: '10px', fontSize: '14px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' },
  statCard: { background: '#1a1a24', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' },
  statIcon: { fontSize: '24px' },
  statNum: { fontSize: '28px', fontWeight: '700', fontFamily: 'Syne, sans-serif' },
  statLabel: { fontSize: '12px', color: '#7c7a8e', textTransform: 'uppercase', letterSpacing: '0.05em' },
  loading: { textAlign: 'center', color: '#7c7a8e', padding: '80px', fontSize: '15px' },
  empty: { textAlign: 'center', padding: '80px 20px' },
  emptyIcon: { fontSize: '48px', marginBottom: '16px' },
  emptyTitle: { fontSize: '20px', fontWeight: '600', color: '#f0eeff', marginBottom: '8px' },
  emptyDesc: { fontSize: '14px', color: '#7c7a8e', marginBottom: '24px' },
  takeBtn: { padding: '12px 28px', background: '#7c6ff7', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' },
  resultsList: { background: '#1a1a24', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', overflow: 'hidden' },
  listHeader: { display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr', gap: '16px', padding: '14px 24px', background: '#16161d', fontSize: '11px', color: '#7c7a8e', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '500' },
  resultRow: { display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr', gap: '16px', padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.05)', alignItems: 'center' },
  examInfo: { display: 'flex', flexDirection: 'column', gap: '4px' },
  examName: { fontSize: '14px', fontWeight: '500', color: '#f0eeff' },
  scoreCell: { display: 'flex', flexDirection: 'column', gap: '6px' },
  scoreText: { fontSize: '13px', color: '#f0eeff', fontWeight: '500' },
  progressBar: { height: '4px', background: '#16161d', borderRadius: '2px', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: '2px', transition: 'width 0.3s' },
  pctText: { fontSize: '15px', fontWeight: '700', fontFamily: 'Syne, sans-serif' },
  badge: { padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
  dateText: { fontSize: '12px', color: '#7c7a8e' },
};