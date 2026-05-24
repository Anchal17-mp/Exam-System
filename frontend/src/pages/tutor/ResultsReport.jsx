import { useEffect, useState } from 'react';
import TutorSidebar from '../../components/TutorSidebar';
import { getTutorResults } from '../../services/api';

export default function ResultsReport() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all, passed, failed

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

  const totalResults = results.length;
  const passed = results.filter(r => r.score / r.total >= 0.5).length;
  const failed = totalResults - passed;
  const avgScore = totalResults > 0
    ? Math.round(results.reduce((a, r) => a + (r.score / r.total) * 100, 0) / totalResults)
    : 0;

  const filteredResults = results
    .filter(r => {
      const matchSearch =
        (r.student_name || '').toLowerCase().includes(search.toLowerCase()) ||
        (r.exam_title || '').toLowerCase().includes(search.toLowerCase());
      const pct = r.score / r.total;
      const matchFilter =
        filter === 'all' ||
        (filter === 'passed' && pct >= 0.5) ||
        (filter === 'failed' && pct < 0.5);
      return matchSearch && matchFilter;
    })
    .slice()
    .reverse();

  return (
    <div style={s.page}>
      <TutorSidebar />
      <div style={s.main}>
        <h1 style={s.title}>Results Report</h1>
        <p style={s.sub}>All exam results from your students</p>

        {/* Stats */}
        <div style={s.statsRow}>
          <div style={s.statCard}>
            <span style={s.statIcon}>📊</span>
            <span style={{ ...s.statNum, color: '#7c6ff7' }}>{totalResults}</span>
            <span style={s.statLabel}>Total Results</span>
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
            <span style={s.statIcon}>🎯</span>
            <span style={{ ...s.statNum, color: '#f59e0b' }}>{avgScore}%</span>
            <span style={s.statLabel}>Avg Score</span>
          </div>
        </div>

        {/* Search and Filter */}
        <div style={s.controls}>
          <input
            style={s.search}
            type="text"
            placeholder="Search by student or exam..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div style={s.filterBtns}>
            {['all', 'passed', 'failed'].map((f) => (
              <button
                key={f}
                style={{
                  ...s.filterBtn,
                  ...(filter === f ? s.filterBtnActive : {}),
                  ...(filter === f && f === 'passed' ? { background: 'rgba(52,211,153,0.15)', color: '#34d399', border: '1px solid rgba(52,211,153,0.4)' } : {}),
                  ...(filter === f && f === 'failed' ? { background: 'rgba(248,113,113,0.15)', color: '#f87171', border: '1px solid rgba(248,113,113,0.4)' } : {}),
                }}
                onClick={() => setFilter(f)}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Results Table */}
        {loading ? (
          <div style={s.loading}>Loading results...</div>
        ) : filteredResults.length === 0 ? (
          <div style={s.empty}>
            <div style={s.emptyIcon}>📊</div>
            <h3 style={s.emptyTitle}>No results found</h3>
            <p style={s.emptyDesc}>
              {totalResults === 0
                ? 'No students have taken your exams yet.'
                : 'No results match your search or filter.'}
            </p>
          </div>
        ) : (
          <div style={s.table}>
            <div style={s.tableHeader}>
              <span>#</span>
              <span>Student</span>
              <span>Exam</span>
              <span>Score</span>
              <span>Percentage</span>
              <span>Status</span>
              <span>Date</span>
            </div>
            {filteredResults.map((r, i) => {
              const pct = Math.round((r.score / r.total) * 100);
              const isPassed = pct >= 50;
              return (
                <div key={r.id} style={s.tableRow}>
                  <div style={s.indexCell}>{i + 1}</div>
                  <div style={s.studentCell}>
                    <div style={s.avatar}>
                      {(r.student_name || 'S')[0].toUpperCase()}
                    </div>
                    <span style={s.studentName}>
                      {r.student_name || `Student #${r.student}`}
                    </span>
                  </div>
                  <div style={s.examCell}>
                    {r.exam_title || `Exam #${r.exam}`}
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
                  <div style={{
                    ...s.pctText,
                    color: isPassed ? '#34d399' : '#f87171'
                  }}>
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
  title: { fontSize: '28px', fontWeight: '700', color: '#f0eeff', marginBottom: '6px' },
  sub: { color: '#7c7a8e', fontSize: '14px', marginBottom: '28px' },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' },
  statCard: { background: '#1a1a24', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' },
  statIcon: { fontSize: '24px' },
  statNum: { fontSize: '28px', fontWeight: '700', fontFamily: 'Syne, sans-serif' },
  statLabel: { fontSize: '12px', color: '#7c7a8e', textTransform: 'uppercase', letterSpacing: '0.05em' },
  controls: { display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' },
  search: { flex: 1, minWidth: '200px', maxWidth: '360px', padding: '11px 16px', background: '#1a1a24', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: '#f0eeff', fontSize: '14px', outline: 'none', fontFamily: 'DM Sans, sans-serif' },
  filterBtns: { display: 'flex', gap: '8px' },
  filterBtn: { padding: '10px 20px', background: '#1a1a24', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: '#7c7a8e', fontSize: '13px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontWeight: '500' },
  filterBtnActive: { background: 'rgba(124,111,247,0.15)', color: '#7c6ff7', border: '1px solid rgba(124,111,247,0.4)' },
  loading: { textAlign: 'center', color: '#7c7a8e', padding: '80px' },
  empty: { textAlign: 'center', padding: '80px 20px' },
  emptyIcon: { fontSize: '48px', marginBottom: '16px' },
  emptyTitle: { fontSize: '20px', fontWeight: '600', color: '#f0eeff', marginBottom: '8px' },
  emptyDesc: { fontSize: '14px', color: '#7c7a8e' },
  table: { background: '#1a1a24', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', overflow: 'hidden' },
  tableHeader: { display: 'grid', gridTemplateColumns: '0.3fr 1.5fr 1.5fr 1.5fr 1fr 1fr 1fr', gap: '12px', padding: '14px 24px', background: '#16161d', fontSize: '11px', color: '#7c7a8e', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '500' },
  tableRow: { display: 'grid', gridTemplateColumns: '0.3fr 1.5fr 1.5fr 1.5fr 1fr 1fr 1fr', gap: '12px', padding: '14px 24px', borderTop: '1px solid rgba(255,255,255,0.05)', alignItems: 'center' },
  indexCell: { fontSize: '13px', color: '#7c7a8e' },
  studentCell: { display: 'flex', alignItems: 'center', gap: '10px' },
  avatar: { width: '32px', height: '32px', borderRadius: '50%', background: '#7c6ff7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', color: 'white', flexShrink: 0 },
  studentName: { fontSize: '13px', fontWeight: '500', color: '#f0eeff' },
  examCell: { fontSize: '13px', color: '#9090b0' },
  scoreCell: { display: 'flex', flexDirection: 'column', gap: '5px' },
  scoreText: { fontSize: '13px', color: '#f0eeff', fontWeight: '500' },
  progressBar: { height: '4px', background: '#16161d', borderRadius: '2px', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: '2px' },
  pctText: { fontSize: '14px', fontWeight: '700', fontFamily: 'Syne, sans-serif' },
  badge: { padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', whiteSpace: 'nowrap' },
  dateText: { fontSize: '12px', color: '#7c7a8e' },
};