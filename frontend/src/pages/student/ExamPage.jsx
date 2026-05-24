import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getExamDetail, submitExam, logCheating } from '../../services/api';

export default function ExamPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [current, setCurrent] = useState(0);
  const [warning, setWarning] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [examStarted, setExamStarted] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const submittedRef = useRef(false);
  const isMobile = window.innerWidth <= 768;

  useEffect(() => {
    getExamDetail(id).then((res) => {
      setExam(res.data);
      setTimeLeft(res.data.duration_minutes * 60);
    });
  }, [id]);

  const handleSubmit = useCallback(async (reason = 'manual') => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setSubmitted(true);
    try {
      const res = await submitExam({ exam_id: id, answers });
      navigate('/result', {
        state: {
          score: res.data.score,
          total: res.data.total,
          examTitle: res.data.exam_title,
          examId: id,
          submitReason: reason,
          review: res.data.review,
        }
      });
    } catch (err) {
      console.error('Submit error:', err);
      alert('Submission failed. Please try again.');
      submittedRef.current = false;
      setSubmitted(false);
    }
  }, [id, answers, exam, navigate]);

  const handleStartExam = async () => {
    try {
      await document.documentElement.requestFullscreen();
    } catch (err) {
      console.log('Fullscreen not available:', err);
    }
    setExamStarted(true);
  };

  // TAB SWITCH DETECTION
  useEffect(() => {
    if (!exam || !examStarted) return;
    let tabDetectionEnabled = false;
    const enableTimer = setTimeout(() => { tabDetectionEnabled = true; }, 2000);
    const handleVisibilityChange = async () => {
      if (document.hidden && tabDetectionEnabled && !submittedRef.current) {
        try { await logCheating({ exam_id: id, action: 'tab_switch' }); } catch (err) {}
        setWarning('tab_switch');
        setTimeout(() => { handleSubmit('tab_switch'); }, 2000);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => { clearTimeout(enableTimer); document.removeEventListener('visibilitychange', handleVisibilityChange); };
  }, [exam, examStarted, id, handleSubmit]);

  // FULLSCREEN DETECTION
  useEffect(() => {
    if (!exam || !examStarted) return;
    let fullscreenEnabled = false;
    setTimeout(() => { fullscreenEnabled = true; }, 1500);
    const handleFullscreenChange = async () => {
      if (!document.fullscreenElement && fullscreenEnabled && !submittedRef.current) {
        fullscreenEnabled = false;
        try { await logCheating({ exam_id: id, action: 'fullscreen_exit' }); } catch (err) {}
        setWarning('fullscreen_exit');
        setTimeout(() => { handleSubmit('fullscreen_exit'); }, 2000);
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      if (document.fullscreenElement) { document.exitFullscreen().catch(() => {}); }
    };
  }, [exam, examStarted, id, handleSubmit]);

  // COUNTDOWN TIMER
  useEffect(() => {
    if (!examStarted || timeLeft === null) return;
    if (timeLeft === 0) { handleSubmit('time_up'); return; }
    const t = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, handleSubmit, examStarted]);

  const fmt = (secs) => `${Math.floor(secs / 60).toString().padStart(2, '0')}:${(secs % 60).toString().padStart(2, '0')}`;
  const answered = Object.keys(answers).length;
  const total = exam?.questions.length || 0;
  const progress = total ? (answered / total) * 100 : 0;
  const urgent = timeLeft !== null && timeLeft < 60;

  if (!exam) return <div style={s.loading}>Loading exam...</div>;

  // START SCREEN
  if (!examStarted) {
    return (
      <div style={s.startPage}>
        <div style={s.startCard}>
          <div style={s.startIcon}>📝</div>
          <h1 style={s.startTitle}>{exam.title}</h1>
          <p style={s.startDesc}>{exam.description || 'Test your knowledge in this subject.'}</p>
          <div style={s.startInfo}>
            <div style={s.startInfoItem}>
              <span style={s.startInfoLabel}>Questions</span>
              <span style={s.startInfoValue}>{exam.questions.length}</span>
            </div>
            <div style={s.startInfoDivider} />
            <div style={s.startInfoItem}>
              <span style={s.startInfoLabel}>Duration</span>
              <span style={s.startInfoValue}>{exam.duration_minutes} mins</span>
            </div>
            <div style={s.startInfoDivider} />
            <div style={s.startInfoItem}>
              <span style={s.startInfoLabel}>Type</span>
              <span style={s.startInfoValue}>MCQ</span>
            </div>
          </div>
          <div style={s.startRules}>
            <h3 style={s.startRulesTitle}>📋 Rules before you start</h3>
            <div style={s.startRule}><span style={s.ruleIcon}>🔒</span>Exam will open in fullscreen mode</div>
            <div style={s.startRule}><span style={s.ruleIcon}>⚠️</span>Switching tabs will auto-submit your exam</div>
            <div style={s.startRule}><span style={s.ruleIcon}>🖥️</span>Exiting fullscreen will auto-submit your exam</div>
            <div style={s.startRule}><span style={s.ruleIcon}>⏱️</span>Timer starts as soon as you click Start</div>
          </div>
          <button style={s.startBtn} onClick={handleStartExam}>🚀 Start Exam</button>
          <button style={s.cancelBtn} onClick={() => navigate('/student-dashboard')}>Cancel</button>
        </div>
      </div>
    );
  }

  const q = exam.questions[current];

  return (
    <div style={s.page}>

      {/* Warning Overlay */}
      {warning && (
        <div style={s.warningOverlay}>
          <div style={s.warningCard}>
            <div style={s.warningIcon}>⚠️</div>
            <h2 style={s.warningTitle}>
              {warning === 'tab_switch' ? 'Tab Switch Detected!' : 'Fullscreen Exit Detected!'}
            </h2>
            <p style={s.warningText}>
              {warning === 'tab_switch'
                ? 'You switched tabs during the exam. Your exam is being auto-submitted!'
                : 'You exited fullscreen mode. Your exam is being auto-submitted!'}
            </p>
            <div style={s.warningBar}><div style={s.warningBarFill} /></div>
            <p style={s.warningSubText}>Submitting in 2 seconds...</p>
          </div>
        </div>
      )}

      {/* Mobile Question Navigator Overlay */}
      {isMobile && showSidebar && (
        <div style={s.mobileNavOverlay} onClick={() => setShowSidebar(false)}>
          <div style={s.mobileNavPanel} onClick={(e) => e.stopPropagation()}>
            <div style={s.mobileNavHeader}>
              <span style={s.mobileNavTitle}>Questions</span>
              <button style={s.mobileNavClose} onClick={() => setShowSidebar(false)}>✕</button>
            </div>
            <div style={s.mobileNavProgress}>
              <div style={s.progressBar}>
                <div style={{ ...s.progressFill, width: progress + '%' }} />
              </div>
              <span style={s.progressText}>{answered}/{total} answered</span>
            </div>
            <div style={s.qGrid}>
              {exam.questions.map((q, i) => (
                <button key={q.id}
                  style={{ ...s.qDot, background: answers[q.id] ? '#7c6ff7' : i === current ? '#1e1e28' : '#16161d', border: i === current ? '2px solid #7c6ff7' : '1px solid rgba(255,255,255,0.08)', color: answers[q.id] ? 'white' : '#7c7a8e' }}
                  onClick={() => { setCurrent(i); setShowSidebar(false); }}>
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Navbar */}
      <nav style={s.nav}>
        <div style={s.brand}>ExamPro</div>
        <div style={{ ...s.timer, color: urgent ? '#f87171' : '#7c6ff7', background: urgent ? 'rgba(248,113,113,0.1)' : 'rgba(124,111,247,0.1)', border: `1px solid ${urgent ? 'rgba(248,113,113,0.3)' : 'rgba(124,111,247,0.3)'}` }}>
          ⏱ {fmt(timeLeft)}
        </div>
        <div style={s.navRight}>
          {isMobile && (
            <button style={s.navGridBtn} onClick={() => setShowSidebar(true)}>
              ☰ {answered}/{total}
            </button>
          )}
          {!isMobile && <div style={s.securityBadge}>🔒 Monitored</div>}
          <button style={s.submitNav} onClick={() => handleSubmit('manual')} disabled={submitted}>
            {submitted ? '...' : 'Submit'}
          </button>
        </div>
      </nav>

      {/* Mobile progress bar */}
      {isMobile && (
        <div style={s.mobileProgress}>
          <div style={{ ...s.mobileProgressFill, width: progress + '%' }} />
        </div>
      )}

      <div style={isMobile ? s.containerMobile : s.container}>

        {/* Desktop Sidebar */}
        {!isMobile && (
          <div style={s.sidebar}>
            <h3 style={s.sideTitle}>{exam.title}</h3>
            <div style={s.progressWrap}>
              <div style={s.progressBar}>
                <div style={{ ...s.progressFill, width: progress + '%' }} />
              </div>
              <span style={s.progressText}>{answered}/{total} answered</span>
            </div>
            <div style={s.qGrid}>
              {exam.questions.map((q, i) => (
                <button key={q.id}
                  style={{ ...s.qDot, background: answers[q.id] ? '#7c6ff7' : i === current ? '#1e1e28' : '#16161d', border: i === current ? '2px solid #7c6ff7' : '1px solid rgba(255,255,255,0.08)', color: answers[q.id] ? 'white' : '#7c7a8e' }}
                  onClick={() => setCurrent(i)}>
                  {i + 1}
                </button>
              ))}
            </div>
            <div style={s.securityNotice}>
              <p style={s.securityTitle}>🔒 Exam Security</p>
              <p style={s.securityText}>• Do not switch tabs</p>
              <p style={s.securityText}>• Stay in fullscreen</p>
              <p style={s.securityText}>• Tab switch = auto submit</p>
            </div>
          </div>
        )}

        {/* Main Question Area */}
        <div style={s.main}>
          <div style={s.qHeader}>
            <span style={s.qNum}>Question {current + 1} of {total}</span>
          </div>
          <div style={s.qCard}>
            <p style={s.qText}>{q.text}</p>
            <div style={s.options}>
              {['a', 'b', 'c', 'd'].map((opt) => {
                const selected = answers[q.id] === opt;
                return (
                  <div key={opt}
                    style={{ ...s.option, background: selected ? 'rgba(124,111,247,0.15)' : '#16161d', border: selected ? '1px solid #7c6ff7' : '1px solid rgba(255,255,255,0.07)', color: selected ? '#f0eeff' : '#9090b0' }}
                    onClick={() => setAnswers({ ...answers, [q.id]: opt })}>
                    <span style={{ ...s.optLabel, background: selected ? '#7c6ff7' : '#1e1e28', color: selected ? 'white' : '#7c7a8e' }}>
                      {opt.toUpperCase()}
                    </span>
                    {q[`option_${opt}`]}
                  </div>
                );
              })}
            </div>
          </div>

          <div style={s.navBtns}>
            <button style={s.navBtn} onClick={() => setCurrent(Math.max(0, current - 1))} disabled={current === 0}>
              ← Previous
            </button>
            {current < total - 1
              ? <button style={{ ...s.navBtn, background: '#7c6ff7', color: 'white', border: 'none' }} onClick={() => setCurrent(current + 1)}>
                Next →
              </button>
              : <button style={{ ...s.navBtn, background: '#34d399', color: '#0f0f13', border: 'none', fontWeight: '700' }} onClick={() => handleSubmit('manual')} disabled={submitted}>
                {submitted ? 'Submitting...' : 'Submit ✓'}
              </button>
            }
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  // Start screen
  startPage: { minHeight: '100vh', background: '#0f0f13', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' },
  startCard: { background: '#1a1a24', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', padding: '32px 24px', maxWidth: '480px', width: '100%', textAlign: 'center' },
  startIcon: { fontSize: '40px', marginBottom: '12px' },
  startTitle: { fontSize: '22px', fontWeight: '700', color: '#f0eeff', marginBottom: '8px', fontFamily: 'Syne, sans-serif' },
  startDesc: { fontSize: '13px', color: '#7c7a8e', marginBottom: '20px', lineHeight: 1.6 },
  startInfo: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginBottom: '20px', padding: '14px', background: '#16161d', borderRadius: '12px' },
  startInfoItem: { display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' },
  startInfoLabel: { fontSize: '10px', color: '#7c7a8e', textTransform: 'uppercase', letterSpacing: '0.05em' },
  startInfoValue: { fontSize: '16px', fontWeight: '700', color: '#f0eeff', fontFamily: 'Syne, sans-serif' },
  startInfoDivider: { width: '1px', height: '28px', background: 'rgba(255,255,255,0.1)' },
  startRules: { background: 'rgba(248,113,113,0.05)', border: '1px solid rgba(248,113,113,0.15)', borderRadius: '12px', padding: '16px', marginBottom: '20px', textAlign: 'left' },
  startRulesTitle: { fontSize: '13px', fontWeight: '600', color: '#f0eeff', marginBottom: '12px' },
  startRule: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#9090b0', marginBottom: '8px', lineHeight: 1.5 },
  ruleIcon: { fontSize: '14px', flexShrink: 0 },
  startBtn: { width: '100%', padding: '13px', background: '#7c6ff7', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', marginBottom: '10px' },
  cancelBtn: { width: '100%', padding: '11px', background: 'transparent', color: '#7c7a8e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', fontSize: '14px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' },

  // Exam page
  page: { minHeight: '100vh', background: '#0f0f13', position: 'relative' },
  loading: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#7c7a8e', fontSize: '16px' },

  // Warning
  warningOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' },
  warningCard: { background: '#1a1a24', border: '2px solid #f87171', borderRadius: '20px', padding: '32px 24px', textAlign: 'center', maxWidth: '400px', width: '100%' },
  warningIcon: { fontSize: '48px', marginBottom: '12px' },
  warningTitle: { fontSize: '20px', fontWeight: '700', color: '#f87171', marginBottom: '10px', fontFamily: 'Syne, sans-serif' },
  warningText: { fontSize: '14px', color: '#9090b0', lineHeight: 1.7, marginBottom: '20px' },
  warningBar: { height: '6px', background: '#16161d', borderRadius: '3px', overflow: 'hidden', marginBottom: '8px' },
  warningBarFill: { height: '100%', background: '#f87171', borderRadius: '3px', animation: 'fillBar 2s linear forwards' },
  warningSubText: { fontSize: '12px', color: '#7c7a8e' },

  // Mobile nav overlay
  mobileNavOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 500 },
  mobileNavPanel: { position: 'absolute', bottom: 0, left: 0, right: 0, background: '#1a1a24', borderRadius: '20px 20px 0 0', padding: '20px', maxHeight: '80vh', overflowY: 'auto' },
  mobileNavHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  mobileNavTitle: { fontSize: '16px', fontWeight: '600', color: '#f0eeff' },
  mobileNavClose: { background: 'transparent', border: 'none', color: '#7c7a8e', fontSize: '18px', cursor: 'pointer', padding: '4px 8px' },
  mobileNavProgress: { marginBottom: '16px' },

  // Navbar
  nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 16px', height: '56px', background: '#16161d', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'sticky', top: 0, zIndex: 100 },
  brand: { fontFamily: 'Syne, sans-serif', fontSize: '18px', fontWeight: '800', color: '#7c6ff7' },
  timer: { padding: '6px 14px', borderRadius: '20px', fontWeight: '700', fontSize: '14px', fontFamily: 'Syne, sans-serif' },
  navRight: { display: 'flex', alignItems: 'center', gap: '8px' },
  navGridBtn: { padding: '6px 12px', background: 'rgba(124,111,247,0.15)', border: '1px solid rgba(124,111,247,0.3)', color: '#a78bfa', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' },
  securityBadge: { padding: '6px 12px', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)', color: '#34d399', borderRadius: '20px', fontSize: '12px', fontWeight: '500' },
  submitNav: { padding: '7px 16px', background: '#34d399', color: '#0f0f13', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '13px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' },

  // Mobile progress bar
  mobileProgress: { height: '3px', background: '#1e1e28' },
  mobileProgressFill: { height: '100%', background: '#7c6ff7', transition: 'width 0.3s' },

  // Layout
  container: { display: 'flex', gap: '24px', maxWidth: '1100px', margin: '0 auto', padding: '24px' },
  containerMobile: { display: 'flex', flexDirection: 'column', padding: '16px' },

  // Desktop Sidebar
  sidebar: { width: '240px', flexShrink: 0 },
  sideTitle: { fontSize: '14px', fontWeight: '600', color: '#f0eeff', marginBottom: '14px', lineHeight: 1.4 },
  progressWrap: { marginBottom: '16px' },
  progressBar: { height: '5px', background: '#1e1e28', borderRadius: '3px', overflow: 'hidden', marginBottom: '5px' },
  progressFill: { height: '100%', background: '#7c6ff7', borderRadius: '3px', transition: 'width 0.3s' },
  progressText: { fontSize: '11px', color: '#7c7a8e' },
  qGrid: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px', marginBottom: '20px' },
  qDot: { width: '100%', aspectRatio: '1', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: '600', fontFamily: 'DM Sans, sans-serif' },
  securityNotice: { background: 'rgba(248,113,113,0.05)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: '10px', padding: '12px' },
  securityTitle: { fontSize: '11px', fontWeight: '600', color: '#f87171', marginBottom: '6px' },
  securityText: { fontSize: '10px', color: '#7c7a8e', marginBottom: '3px' },

  // Question area
  main: { flex: 1, minWidth: 0 },
  qHeader: { marginBottom: '12px' },
  qNum: { fontSize: '12px', color: '#7c7a8e', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' },
  qCard: { background: '#1a1a24', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '20px', marginBottom: '16px' },
  qText: { fontSize: '16px', fontWeight: '500', color: '#f0eeff', lineHeight: 1.6, marginBottom: '20px' },
  options: { display: 'flex', flexDirection: 'column', gap: '8px' },
  option: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', transition: 'all 0.15s' },
  optLabel: { width: '26px', height: '26px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '11px', flexShrink: 0 },
  navBtns: { display: 'flex', justifyContent: 'space-between', gap: '10px' },
  navBtn: { flex: 1, padding: '12px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#9090b0', borderRadius: '10px', fontSize: '14px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontWeight: '500' },
};