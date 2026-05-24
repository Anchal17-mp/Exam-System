import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import StudentSidebar from '../../components/StudentSidebar';
import { explainQuestion } from '../../services/api';

export default function ResultPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('result');
  const [explanations, setExplanations] = useState({});
  const [loadingExplanation, setLoadingExplanation] = useState({});

  if (!state) {
    navigate('/student-dashboard');
    return null;
  }

  const { score, total, examTitle, examId, submitReason, review } = state;
  const pct = Math.round((score / total) * 100);
  const passed = pct >= 50;
  const circumference = 2 * Math.PI * 54;
  const strokeDash = (pct / 100) * circumference;

  const getExplanation = async (question, index) => {
    if (explanations[index]) return;
    setLoadingExplanation(prev => ({ ...prev, [index]: true }));
    try {
      const correctText = question[`option_${question.correct_option}`];
      const res = await explainQuestion({
        question: question.text,
        correct_option: question.correct_option,
        correct_text: correctText,
      });
      setExplanations(prev => ({ ...prev, [index]: res.data.explanation }));
    } catch (err) {
      setExplanations(prev => ({ ...prev, [index]: 'Explanation not available.' }));
    } finally {
      setLoadingExplanation(prev => ({ ...prev, [index]: false }));
    }
  };

  const optionColors = (q, opt) => {
    const isCorrect = q.correct_option === opt;
    const isSelected = q.selected_option === opt;

    if (isCorrect) return {
      background: 'rgba(52,211,153,0.12)',
      border: '1px solid rgba(52,211,153,0.5)',
      color: '#34d399',
    };
    if (isSelected && !isCorrect) return {
      background: 'rgba(248,113,113,0.12)',
      border: '1px solid rgba(248,113,113,0.5)',
      color: '#f87171',
    };
    return {
      background: '#16161d',
      border: '1px solid rgba(255,255,255,0.06)',
      color: '#7c7a8e',
    };
  };

  const optionLabelColors = (q, opt) => {
    const isCorrect = q.correct_option === opt;
    const isSelected = q.selected_option === opt;
    if (isCorrect) return { background: '#34d399', color: '#0f0f13' };
    if (isSelected && !isCorrect) return { background: '#f87171', color: 'white' };
    return { background: '#1e1e28', color: '#7c7a8e' };
  };

  return (
    <div style={s.page}>
      <StudentSidebar />
      <div style={s.main}>
        <div style={s.header}>
          <h1 style={s.title}>{examTitle}</h1>
          {submitReason && submitReason !== 'manual' && (
            <div style={s.submitReason}>
              {submitReason === 'tab_switch' && '⚠️ Auto-submitted — Tab switch detected'}
              {submitReason === 'fullscreen_exit' && '⚠️ Auto-submitted — Fullscreen exit detected'}
              {submitReason === 'time_up' && '⏱ Auto-submitted — Time ran out'}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div style={s.tabRow}>
          <button
            style={{ ...s.tab, ...(activeTab === 'result' ? s.tabActive : {}) }}
            onClick={() => setActiveTab('result')}>
            📊 Your Result
          </button>
          <button
            style={{ ...s.tab, ...(activeTab === 'review' ? s.tabActive : {}) }}
            onClick={() => setActiveTab('review')}>
            📋 Review Answers ({review?.length || 0} Questions)
          </button>
        </div>

        {/* Result Tab */}
        {activeTab === 'result' && (
          <div style={s.resultCard}>
            <div style={{
              ...s.statusBadge,
              background: passed ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)',
              color: passed ? '#34d399' : '#f87171',
              border: `1px solid ${passed ? 'rgba(52,211,153,0.3)' : 'rgba(248,113,113,0.3)'}`
            }}>
              {passed ? '✓ Passed' : '✗ Failed'}
            </div>

            <div style={s.circleWrap}>
              <svg width="140" height="140" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="54" fill="none" stroke="#1e1e28" strokeWidth="8" />
                <circle cx="60" cy="60" r="54" fill="none"
                  stroke={passed ? '#34d399' : '#f87171'} strokeWidth="8"
                  strokeDasharray={`${strokeDash} ${circumference}`}
                  strokeLinecap="round"
                  transform="rotate(-90 60 60)"
                  style={{ transition: 'stroke-dasharray 1s ease' }}
                />
              </svg>
              <div style={s.circleInner}>
                <span style={{ ...s.pct, color: passed ? '#34d399' : '#f87171' }}>{pct}%</span>
                <span style={s.scoreFrac}>{score}/{total}</span>
              </div>
            </div>

            <div style={s.statsRow}>
              <div style={s.statBox}>
                <span style={{ ...s.statNum, color: '#34d399' }}>{score}</span>
                <span style={s.statLabel}>Correct</span>
              </div>
              <div style={s.statBox}>
                <span style={{ ...s.statNum, color: '#f87171' }}>{total - score}</span>
                <span style={s.statLabel}>Wrong</span>
              </div>
              <div style={s.statBox}>
                <span style={{ ...s.statNum, color: '#7c6ff7' }}>{total}</span>
                <span style={s.statLabel}>Total</span>
              </div>
            </div>

            <p style={s.message}>
              {passed
                ? 'Great job! You demonstrated solid understanding of the subject.'
                : 'Keep practicing! Review your answers below to understand the mistakes.'}
            </p>

            <div style={s.btnRow}>
              <button style={s.reviewBtn} onClick={() => setActiveTab('review')}>
                📋 Review Answers
              </button>
              <button style={s.dashBtn} onClick={() => navigate('/student-dashboard')}>
                Back to Dashboard
              </button>
            </div>
          </div>
        )}

        {/* Review Tab */}
        {activeTab === 'review' && (
          <div style={s.reviewSection}>
            {/* Summary bar */}
            <div style={s.summaryBar}>
              <div style={s.summaryItem}>
                <span style={{ color: '#34d399', fontWeight: '700' }}>{score} ✓ Correct</span>
              </div>
              <div style={s.summaryItem}>
                <span style={{ color: '#f87171', fontWeight: '700' }}>{total - score} ✗ Wrong</span>
              </div>
              <div style={s.summaryItem}>
                <span style={{ color: '#7c6ff7', fontWeight: '700' }}>{pct}% Score</span>
              </div>
              <button style={s.backBtn} onClick={() => setActiveTab('result')}>
                ← Back to Result
              </button>
            </div>

            {review && review.map((q, i) => (
              <div key={q.id} style={{
                ...s.qCard,
                borderColor: q.is_correct
                  ? 'rgba(52,211,153,0.25)'
                  : 'rgba(248,113,113,0.25)'
              }}>
                {/* Question header */}
                <div style={s.qTop}>
                  <div style={s.qNum}>Q{i + 1}</div>
                  <div style={{
                    ...s.qStatus,
                    background: q.is_correct ? 'rgba(52,211,153,0.12)' : 'rgba(248,113,113,0.12)',
                    color: q.is_correct ? '#34d399' : '#f87171',
                    border: `1px solid ${q.is_correct ? 'rgba(52,211,153,0.3)' : 'rgba(248,113,113,0.3)'}`
                  }}>
                    {q.is_correct ? '✓ Correct' : '✗ Incorrect'}
                  </div>
                </div>

                <p style={s.qText}>{q.text}</p>

                {/* Options */}
                <div style={s.optionsList}>
                  {['a', 'b', 'c', 'd'].map((opt) => {
                    const colors = optionColors(q, opt);
                    const labelColors = optionLabelColors(q, opt);
                    const isCorrect = q.correct_option === opt;
                    const isSelected = q.selected_option === opt;

                    return (
                      <div key={opt} style={{ ...s.option, ...colors }}>
                        <span style={{ ...s.optLabel, ...labelColors }}>
                          {opt.toUpperCase()}
                        </span>
                        <span style={s.optText}>{q[`option_${opt}`]}</span>
                        <div style={s.optTags}>
                          {isCorrect && (
                            <span style={s.correctTag}>✓ Correct Answer</span>
                          )}
                          {isSelected && !isCorrect && (
                            <span style={s.wrongTag}>✗ Your Answer</span>
                          )}
                          {isSelected && isCorrect && (
                            <span style={s.yourCorrectTag}>✓ Your Answer</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Explanation */}
                <div style={s.explanationSection}>
                  {!explanations[i] && !loadingExplanation[i] && (
                    <button
                      style={s.explainBtn}
                      onClick={() => getExplanation(q, i)}>
                      🤖 Get AI Explanation
                    </button>
                  )}
                  {loadingExplanation[i] && (
                    <div style={s.explainLoading}>
                      🤖 Generating explanation...
                    </div>
                  )}
                  {explanations[i] && (
                    <div style={s.explanation}>
                      <div style={s.explanationTitle}>🤖 AI Explanation</div>
                      <p style={s.explanationText}>{explanations[i]}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}

            <button style={s.dashBtn} onClick={() => navigate('/student-dashboard')}>
              ← Back to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  page: { display: 'flex', minHeight: '100vh', background: '#0f0f13' ,flexDirection: window.innerWidth <= 768 ? 'column' : 'row',
},
  main: { flex: 1, padding: window.innerWidth <= 768 ? '76px 16px 24px' : '40px', overflowY: 'auto' },
  header: { marginBottom: '24px' },
  title: { fontSize: '26px', fontWeight: '700', color: '#f0eeff', marginBottom: '8px' },
  submitReason: { fontSize: '13px', color: '#f87171', padding: '8px 14px', background: 'rgba(248,113,113,0.1)', borderRadius: '8px', display: 'inline-block' },
  tabRow: { display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' },
  tab: { padding: '10px 24px', background: '#1a1a24', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: '#7c7a8e', fontSize: '14px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontWeight: '500' },
  tabActive: { background: 'rgba(124,111,247,0.15)', border: '1px solid #7c6ff7', color: '#f0eeff' },

  // Result card
  resultCard: { background: '#1a1a24', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', padding: '40px', maxWidth: '480px', textAlign: 'center' },
  statusBadge: { display: 'inline-block', padding: '6px 20px', borderRadius: '20px', fontSize: '13px', fontWeight: '700', marginBottom: '24px' },
  circleWrap: { position: 'relative', width: '140px', height: '140px', margin: '0 auto 28px' },
  circleInner: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  pct: { fontSize: '28px', fontWeight: '800', fontFamily: 'Syne, sans-serif' },
  scoreFrac: { fontSize: '13px', color: '#7c7a8e' },
  statsRow: { display: 'flex', gap: '12px', marginBottom: '24px' },
  statBox: { flex: 1, background: '#16161d', borderRadius: '12px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '4px' },
  statNum: { fontSize: '22px', fontWeight: '700', fontFamily: 'Syne, sans-serif' },
  statLabel: { fontSize: '11px', color: '#7c7a8e', textTransform: 'uppercase', letterSpacing: '0.05em' },
  message: { color: '#7c7a8e', fontSize: '14px', lineHeight: 1.7, marginBottom: '24px' },
  btnRow: { display: 'flex', gap: '10px' },
  reviewBtn: { flex: 1, padding: '12px', background: '#7c6ff7', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' },
  dashBtn: { flex: 1, padding: '12px', background: 'transparent', color: '#9090b0', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', fontSize: '14px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' },

  // Review section
  reviewSection: { maxWidth: '800px' },
  summaryBar: { display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap', padding: '16px 20px', background: '#1a1a24', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', marginBottom: '20px' },
  summaryItem: { fontSize: '14px' },
  backBtn: { marginLeft: 'auto', padding: '8px 16px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#9090b0', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' },
  qCard: { background: '#1a1a24', border: '1px solid', borderRadius: '14px', padding: '22px', marginBottom: '16px' },
  qTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' },
  qNum: { background: '#7c6ff7', color: 'white', padding: '4px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '700' },
  qStatus: { padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
  qText: { fontSize: '15px', fontWeight: '500', color: '#f0eeff', marginBottom: '16px', lineHeight: 1.6 },
  optionsList: { display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' },
  option: { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '10px', flexWrap: 'wrap' },
  optLabel: { width: '26px', height: '26px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '11px', flexShrink: 0 },
  optText: { fontSize: '14px', flex: 1 },
  optTags: { display: 'flex', gap: '6px', flexWrap: 'wrap' },
  correctTag: { fontSize: '11px', padding: '2px 8px', background: 'rgba(52,211,153,0.15)', color: '#34d399', borderRadius: '10px', fontWeight: '600' },
  wrongTag: { fontSize: '11px', padding: '2px 8px', background: 'rgba(248,113,113,0.15)', color: '#f87171', borderRadius: '10px', fontWeight: '600' },
  yourCorrectTag: { fontSize: '11px', padding: '2px 8px', background: 'rgba(52,211,153,0.15)', color: '#34d399', borderRadius: '10px', fontWeight: '600' },
  explanationSection: { borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '14px' },
  explainBtn: { padding: '8px 18px', background: 'rgba(124,111,247,0.12)', border: '1px solid rgba(124,111,247,0.3)', color: '#a78bfa', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontWeight: '500' },
  explainLoading: { fontSize: '13px', color: '#7c7a8e', padding: '8px 0' },
  explanation: { background: 'rgba(124,111,247,0.06)', border: '1px solid rgba(124,111,247,0.15)', borderRadius: '10px', padding: '14px 16px' },
  explanationTitle: { fontSize: '12px', fontWeight: '600', color: '#a78bfa', marginBottom: '8px' },
  explanationText: { fontSize: '13px', color: '#9090b0', lineHeight: 1.7 },
};