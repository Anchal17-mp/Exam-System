import { useEffect, useState } from 'react';
import TutorSidebar from '../../components/TutorSidebar';
import { getMyExams } from '../../services/api';

export default function QuestionsReport() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExam, setSelectedExam] = useState('all');

  useEffect(() => {
    getMyExams()
      .then((res) => {
        setExams(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error:', err);
        setLoading(false);
      });
  }, []);

  const totalQuestions = exams.reduce((a, e) => a + e.questions.length, 0);

  const filteredExams = selectedExam === 'all'
    ? exams
    : exams.filter(e => e.id === parseInt(selectedExam));

  return (
    <div style={s.page}>
      <TutorSidebar />
      <div style={s.main}>
        <h1 style={s.title}>Questions Report</h1>
        <p style={s.sub}>All questions across your exams</p>

        {/* Stats */}
        <div style={s.statsRow}>
          <div style={s.statCard}>
            <span style={s.statIcon}>📋</span>
            <span style={{ ...s.statNum, color: '#7c6ff7' }}>{exams.length}</span>
            <span style={s.statLabel}>Total Exams</span>
          </div>
          <div style={s.statCard}>
            <span style={s.statIcon}>❓</span>
            <span style={{ ...s.statNum, color: '#34d399' }}>{totalQuestions}</span>
            <span style={s.statLabel}>Total Questions</span>
          </div>
          <div style={s.statCard}>
            <span style={s.statIcon}>📊</span>
            <span style={{ ...s.statNum, color: '#f59e0b' }}>
              {exams.length > 0 ? Math.round(totalQuestions / exams.length) : 0}
            </span>
            <span style={s.statLabel}>Avg Per Exam</span>
          </div>
        </div>

        {/* Filter */}
        <div style={s.filterWrap}>
          <select
            style={s.select}
            value={selectedExam}
            onChange={(e) => setSelectedExam(e.target.value)}>
            <option value="all">All Exams</option>
            {exams.map(e => (
              <option key={e.id} value={e.id}>{e.title}</option>
            ))}
          </select>
        </div>

        {/* Questions List */}
        {loading ? (
          <div style={s.loading}>Loading questions...</div>
        ) : filteredExams.length === 0 ? (
          <div style={s.empty}>
            <div style={s.emptyIcon}>❓</div>
            <h3 style={s.emptyTitle}>No questions yet</h3>
            <p style={s.emptyDesc}>Create an exam with questions first.</p>
          </div>
        ) : (
          filteredExams.map((exam) => (
            <div key={exam.id} style={s.examBlock}>
              <div style={s.examHeader}>
                <div>
                  <h3 style={s.examTitle}>{exam.title}</h3>
                  <span style={s.examMeta}>
                    {exam.questions.length} questions • {exam.duration_minutes} mins
                  </span>
                </div>
                <span style={s.qCountBadge}>{exam.questions.length} Q</span>
              </div>

              {exam.questions.length === 0 ? (
                <p style={s.noQ}>No questions in this exam.</p>
              ) : (
                exam.questions.map((q, i) => (
                  <div key={q.id} style={s.qCard}>
                    <div style={s.qTop}>
                      <span style={s.qNum}>Q{i + 1}</span>
                      <p style={s.qText}>{q.text}</p>
                    </div>
                    <div style={s.optionsGrid}>
                      {['a', 'b', 'c', 'd'].map((opt) => (
                        <div
                          key={opt}
                          style={{
                            ...s.option,
                            background: q.correct_option === opt
                              ? 'rgba(52,211,153,0.08)'
                              : '#0f0f13',
                            border: q.correct_option === opt
                              ? '1px solid rgba(52,211,153,0.4)'
                              : '1px solid rgba(255,255,255,0.05)',
                            color: q.correct_option === opt ? '#34d399' : '#9090b0',
                          }}>
                          <span style={{
                            ...s.optLabel,
                            background: q.correct_option === opt ? '#34d399' : '#1a1a24',
                            color: q.correct_option === opt ? '#0f0f13' : '#7c7a8e',
                          }}>
                            {opt.toUpperCase()}
                          </span>
                          {q[`option_${opt}`]}
                          {q.correct_option === opt && (
                            <span style={s.correctMark}>✓ Correct</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          ))
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
  filterWrap: { marginBottom: '24px' },
  select: { padding: '11px 16px', background: '#1a1a24', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: '#f0eeff', fontSize: '14px', outline: 'none', fontFamily: 'DM Sans, sans-serif', minWidth: '220px' },
  loading: { textAlign: 'center', color: '#7c7a8e', padding: '80px' },
  empty: { textAlign: 'center', padding: '80px 20px' },
  emptyIcon: { fontSize: '48px', marginBottom: '16px' },
  emptyTitle: { fontSize: '20px', fontWeight: '600', color: '#f0eeff', marginBottom: '8px' },
  emptyDesc: { fontSize: '14px', color: '#7c7a8e' },
  examBlock: { background: '#1a1a24', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '24px', marginBottom: '20px' },
  examHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)' },
  examTitle: { fontSize: '17px', fontWeight: '600', color: '#f0eeff', marginBottom: '4px' },
  examMeta: { fontSize: '13px', color: '#7c7a8e' },
  qCountBadge: { background: 'rgba(124,111,247,0.15)', color: '#a78bfa', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '600' },
  noQ: { fontSize: '14px', color: '#7c7a8e', textAlign: 'center', padding: '20px' },
  qCard: { background: '#16161d', borderRadius: '12px', padding: '16px', marginBottom: '12px' },
  qTop: { display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '14px' },
  qNum: { background: '#7c6ff7', color: 'white', padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', flexShrink: 0, marginTop: '2px' },
  qText: { fontSize: '14px', color: '#f0eeff', fontWeight: '500', lineHeight: 1.5, margin: 0 },
  optionsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' },
  option: { display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: '8px', fontSize: '13px' },
  optLabel: { width: '22px', height: '22px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '700', flexShrink: 0 },
  correctMark: { marginLeft: 'auto', fontSize: '11px', fontWeight: '600' },
};