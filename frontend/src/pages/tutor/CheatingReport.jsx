import { useEffect, useState } from 'react';
import TutorSidebar from '../../components/TutorSidebar';
import { getCheatingReport } from '../../services/api';

export default function CheatingReport() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    getCheatingReport()
      .then((res) => {
        setLogs(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error:', err);
        setLoading(false);
      });
  }, []);

  const tabSwitches = logs.filter(l => l.action === 'tab_switch').length;
  const fullscreenExits = logs.filter(l => l.action === 'fullscreen_exit').length;
  const uniqueStudents = [...new Set(logs.map(l => l.student))].length;

  const filtered = logs.filter(l => {
    const matchFilter = filter === 'all' || l.action === filter;
    const matchSearch = l.student.toLowerCase().includes(search.toLowerCase()) ||
      l.exam.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div style={s.page}>
      <TutorSidebar />
      <div style={s.main}>
        <h1 style={s.title}>🚨 Cheating Report</h1>
        <p style={s.sub}>Monitor suspicious activity during your exams</p>

        {/* Stats */}
        <div style={s.statsRow}>
          <div style={s.statCard}>
            <span style={s.statIcon}>👥</span>
            <span style={{ ...s.statNum, color: '#f87171' }}>{uniqueStudents}</span>
            <span style={s.statLabel}>Students Flagged</span>
          </div>
          <div style={s.statCard}>
            <span style={s.statIcon}>🔀</span>
            <span style={{ ...s.statNum, color: '#f59e0b' }}>{tabSwitches}</span>
            <span style={s.statLabel}>Tab Switches</span>
          </div>
          <div style={s.statCard}>
            <span style={s.statIcon}>🖥️</span>
            <span style={{ ...s.statNum, color: '#a78bfa' }}>{fullscreenExits}</span>
            <span style={s.statLabel}>Fullscreen Exits</span>
          </div>
          <div style={s.statCard}>
            <span style={s.statIcon}>⚠️</span>
            <span style={{ ...s.statNum, color: '#f87171' }}>{logs.length}</span>
            <span style={s.statLabel}>Total Incidents</span>
          </div>
        </div>

        {/* Controls */}
        <div style={s.controls}>
          <input
            style={s.search}
            type="text"
            placeholder="Search by student or exam..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div style={s.filterBtns}>
            {[
              { value: 'all', label: 'All' },
              { value: 'tab_switch', label: '🔀 Tab Switch' },
              { value: 'fullscreen_exit', label: '🖥️ Fullscreen Exit' },
            ].map((f) => (
              <button
                key={f.value}
                style={{
                  ...s.filterBtn,
                  ...(filter === f.value ? s.filterBtnActive : {})
                }}
                onClick={() => setFilter(f.value)}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div style={s.loading}>Loading report...</div>
        ) : filtered.length === 0 ? (
          <div style={s.empty}>
            <div style={s.emptyIcon}>✅</div>
            <h3 style={s.emptyTitle}>
              {logs.length === 0 ? 'No incidents recorded' : 'No results found'}
            </h3>
            <p style={s.emptyDesc}>
              {logs.length === 0
                ? 'No cheating attempts have been detected in your exams.'
                : 'Try a different search or filter.'}
            </p>
          </div>
        ) : (
          <div style={s.table}>
            <div style={s.tableHeader}>
              <span>#</span>
              <span>Student</span>
              <span>Exam</span>
              <span>Incident</span>
              <span>Date & Time</span>
            </div>
            {filtered.map((log, i) => (
              <div key={log.id} style={s.tableRow}>
                <div style={s.indexCell}>{i + 1}</div>
                <div style={s.studentCell}>
                  <div style={s.avatar}>{log.student[0].toUpperCase()}</div>
                  <span style={s.studentName}>{log.student}</span>
                </div>
                <div style={s.examCell}>{log.exam}</div>
                <div>
                  <span style={{
                    ...s.actionBadge,
                    background: log.action === 'tab_switch'
                      ? 'rgba(245,158,11,0.1)'
                      : 'rgba(167,139,250,0.1)',
                    color: log.action === 'tab_switch' ? '#f59e0b' : '#a78bfa',
                    border: `1px solid ${log.action === 'tab_switch'
                      ? 'rgba(245,158,11,0.3)'
                      : 'rgba(167,139,250,0.3)'}`,
                  }}>
                    {log.action === 'tab_switch' ? '🔀 Tab Switch' : '🖥️ Fullscreen Exit'}
                  </span>
                </div>
                <div style={s.dateCell}>
                  {new Date(log.timestamp).toLocaleDateString('en-US', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                  <span style={s.timeText}>
                    {new Date(log.timestamp).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
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
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' },
  statCard: { background: '#1a1a24', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' },
  statIcon: { fontSize: '24px' },
  statNum: { fontSize: '28px', fontWeight: '700', fontFamily: 'Syne, sans-serif' },
  statLabel: { fontSize: '12px', color: '#7c7a8e', textTransform: 'uppercase', letterSpacing: '0.05em' },
  controls: { display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' },
  search: { flex: 1, minWidth: '200px', maxWidth: '360px', padding: '11px 16px', background: '#1a1a24', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: '#f0eeff', fontSize: '14px', outline: 'none', fontFamily: 'DM Sans, sans-serif' },
  filterBtns: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  filterBtn: { padding: '10px 16px', background: '#1a1a24', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: '#7c7a8e', fontSize: '13px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontWeight: '500' },
  filterBtnActive: { background: 'rgba(248,113,113,0.15)', color: '#f87171', border: '1px solid rgba(248,113,113,0.4)' },
  loading: { textAlign: 'center', color: '#7c7a8e', padding: '80px' },
  empty: { textAlign: 'center', padding: '80px 20px' },
  emptyIcon: { fontSize: '48px', marginBottom: '16px' },
  emptyTitle: { fontSize: '20px', fontWeight: '600', color: '#f0eeff', marginBottom: '8px' },
  emptyDesc: { fontSize: '14px', color: '#7c7a8e' },
  table: { background: '#1a1a24', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', overflow: 'hidden' },
  tableHeader: { display: 'grid', gridTemplateColumns: '0.3fr 1.5fr 1.5fr 1.5fr 1.5fr', gap: '12px', padding: '14px 24px', background: '#16161d', fontSize: '11px', color: '#7c7a8e', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '500' },
  tableRow: { display: 'grid', gridTemplateColumns: '0.3fr 1.5fr 1.5fr 1.5fr 1.5fr', gap: '12px', padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.05)', alignItems: 'center' },
  indexCell: { fontSize: '13px', color: '#7c7a8e' },
  studentCell: { display: 'flex', alignItems: 'center', gap: '10px' },
  avatar: { width: '32px', height: '32px', borderRadius: '50%', background: '#f87171', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', color: 'white', flexShrink: 0 },
  studentName: { fontSize: '13px', fontWeight: '500', color: '#f0eeff' },
  examCell: { fontSize: '13px', color: '#9090b0' },
  actionBadge: { padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
  dateCell: { fontSize: '12px', color: '#7c7a8e', display: 'flex', flexDirection: 'column', gap: '2px' },
  timeText: { fontSize: '11px', color: '#7c7a8e' },
};