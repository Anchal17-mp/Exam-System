import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TutorSidebar from '../../components/TutorSidebar';
import { getMyExams, deleteExam } from '../../services/api';

export default function TutorDashboard() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const username = localStorage.getItem('username') || 'Tutor';

  const fetchExams = () => {
    getMyExams()
      .then((res) => {
        setExams(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleDelete = async (examId, examTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${examTitle}"? This cannot be undone.`)) return;

    try {
      await deleteExam(examId);
      setExams(exams.filter(e => e.id !== examId));
      alert('Exam deleted successfully!');
    } catch (err) {
      alert('Failed to delete exam. Please try again.');
    }
  };

  const totalQuestions = exams.reduce((a, e) => a + e.questions.length, 0);

  return (
    <div style={s.page}>
      <TutorSidebar />
      <div style={s.main}>
        <div style={s.header}>
          <div>
            <h1 style={s.title}>Welcome , {username}! 👋</h1>
            <p style={s.sub}>Manage your exams and track student performance</p>
          </div>
          <button style={s.createBtn} onClick={() => navigate('/create-exam')}>
            ＋ Create New Exam
          </button>
        </div>

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
            <span style={s.statLabel}>Avg Questions</span>
          </div>
        </div>

        {/* Exams List */}
        <div style={s.sectionHeader}>
          <h2 style={s.sectionTitle}>Your Exams</h2>
        </div>

        {loading ? (
          <div style={s.loading}>Loading exams...</div>
        ) : exams.length === 0 ? (
          <div style={s.empty}>
            <div style={s.emptyIcon}>📝</div>
            <h3 style={s.emptyTitle}>No exams yet</h3>
            <p style={s.emptyDesc}>Create your first exam to get started!</p>
            <button style={s.createBtn} onClick={() => navigate('/create-exam')}>
              ＋ Create Exam
            </button>
          </div>
        ) : (
          <div style={s.examsList}>
            {exams.map((exam, i) => {
              const colors = ['#7c6ff7', '#34d399', '#f59e0b', '#f87171', '#60a5fa'];
              const color = colors[i % colors.length];
              return (
                <div key={exam.id} style={s.examCard}>
                  <div style={{ ...s.examAccent, background: color }} />
                  <div style={s.examBody}>
                    <div style={s.examTop}>
                      <div>
                        <h3 style={s.examTitle}>{exam.title}</h3>
                        <p style={s.examDesc}>{exam.description || 'No description'}</p>
                      </div>
                      <div style={s.examActions}>
                        <button
                          style={s.editBtn}
                          onClick={() => navigate(`/edit-exam/${exam.id}`)}>
                          ✏️ Edit
                        </button>
                        <button
                          style={s.deleteBtn}
                          onClick={() => handleDelete(exam.id, exam.title)}>
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                    <div style={s.examMeta}>
                      <span style={s.metaTag}>{exam.questions.length} Questions</span>
                      <span style={s.metaTag}>{exam.duration_minutes} mins</span>
                      <span style={s.metaTag}>
                        Created {new Date(exam.created_at).toLocaleDateString()}
                      </span>
                    </div>
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
  createBtn: { padding: '11px 24px', background: '#7c6ff7', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' },
  statCard: { background: '#1a1a24', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' },
  statIcon: { fontSize: '24px' },
  statNum: { fontSize: '28px', fontWeight: '700', fontFamily: 'Syne, sans-serif' },
  statLabel: { fontSize: '12px', color: '#7c7a8e', textTransform: 'uppercase', letterSpacing: '0.05em' },
  sectionHeader: { marginBottom: '16px' },
  sectionTitle: { fontSize: '18px', fontWeight: '600', color: '#f0eeff' },
  loading: { textAlign: 'center', color: '#7c7a8e', padding: '80px' },
  empty: { textAlign: 'center', padding: '80px 20px' },
  emptyIcon: { fontSize: '48px', marginBottom: '16px' },
  emptyTitle: { fontSize: '20px', fontWeight: '600', color: '#f0eeff', marginBottom: '8px' },
  emptyDesc: { fontSize: '14px', color: '#7c7a8e', marginBottom: '24px' },
  examsList: { display: 'flex', flexDirection: 'column', gap: '14px' },
  examCard: { background: '#1a1a24', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', overflow: 'hidden', display: 'flex' },
  examAccent: { width: '4px', flexShrink: 0 },
  examBody: { flex: 1, padding: '20px 24px' },
  examTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', gap: '16px' },
  examTitle: { fontSize: '16px', fontWeight: '600', color: '#f0eeff', marginBottom: '4px' },
  examDesc: { fontSize: '13px', color: '#7c7a8e' },
  examActions: { display: 'flex', gap: '8px', flexShrink: 0 },
  editBtn: { padding: '7px 16px', background: 'rgba(124,111,247,0.15)', border: '1px solid rgba(124,111,247,0.3)', color: '#a78bfa', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' },
  deleteBtn: { padding: '7px 16px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', color: '#f87171', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' },
  examMeta: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  metaTag: { background: 'rgba(124,111,247,0.1)', color: '#a78bfa', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '500' },
};