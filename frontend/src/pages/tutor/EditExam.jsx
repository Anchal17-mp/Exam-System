import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TutorSidebar from '../../components/TutorSidebar';
import { getExamForEdit, editExam, generateQuestions } from '../../services/api';

export default function EditExam() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState({ title: '', description: '', duration_minutes: 30 });
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [aiTopic, setAiTopic] = useState('');
  const [aiCount, setAiCount] = useState(5);
  const [aiLoading, setAiLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('questions');

  useEffect(() => {
    getExamForEdit(id)
      .then((res) => {
        setExam({
          title: res.data.title,
          description: res.data.description,
          duration_minutes: res.data.duration_minutes,
        });
        setQuestions(res.data.questions.map(q => ({
          text: q.text,
          option_a: q.option_a,
          option_b: q.option_b,
          option_c: q.option_c,
          option_d: q.option_d,
          correct_option: q.correct_option ,
        })));
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load exam.');
        setLoading(false);
      });
  }, [id]);

  const generateWithAI = async () => {
    if (!aiTopic.trim()) { alert('Please enter a topic'); return; }
    setAiLoading(true);
    try {
      const res = await generateQuestions({ topic: aiTopic, count: aiCount });
      setQuestions(prev => [...prev, ...res.data.questions]);
      alert(`✅ ${res.data.questions.length} questions added!`);
    } catch (err) {
      alert(`AI generation failed: ${err.response?.data?.error || err.message}`);
    } finally {
      setAiLoading(false);
    }
  };

  const handleEditQuestion = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const handleRemoveQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleAddQuestion = () => {
    setQuestions(prev => [...prev, {
      text: '',
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
      correct_option: ''
    }]);
  };

  const handleSave = async () => {
    if (!exam.title.trim()) { setError('Exam title is required'); return; }
    if (questions.length === 0) { setError('Add at least one question'); return; }
    setSaving(true);
    setError('');
    try {
      await editExam(id, { ...exam, questions });
      alert('✅ Exam updated successfully!');
      navigate('/tutor-dashboard');
    } catch (err) {
      setError('Failed to update exam. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div style={s.page}>
      <TutorSidebar />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7c7a8e' }}>
        Loading exam...
      </div>
    </div>
  );

  return (
    <div style={s.page}>
      <TutorSidebar />
      <div style={s.main}>
        <div style={s.header}>
          <div>
            <h1 style={s.title}>Edit Exam</h1>
            <p style={s.sub}>Update exam details and questions</p>
          </div>
          <button style={s.backBtn} onClick={() => navigate('/tutor-dashboard')}>
            ← Back
          </button>
        </div>

        {error && <div style={s.error}>{error}</div>}

        {/* Exam Details */}
        <div style={s.section}>
          <h3 style={s.sectionTitle}>📋 Exam Details</h3>
          <div style={s.twoCol}>
            <div style={s.field}>
              <label style={s.label}>Exam Title</label>
              <input style={s.input} type="text" value={exam.title}
                onChange={(e) => setExam({ ...exam, title: e.target.value })} />
            </div>
            <div style={s.field}>
              <label style={s.label}>Duration (minutes)</label>
              <input style={s.input} type="number" min="5" max="180"
                value={exam.duration_minutes}
                onChange={(e) => setExam({ ...exam, duration_minutes: parseInt(e.target.value) })} />
            </div>
          </div>
          <div style={s.field}>
            <label style={s.label}>Description</label>
            <input style={s.input} type="text" value={exam.description}
              onChange={(e) => setExam({ ...exam, description: e.target.value })} />
          </div>
        </div>

        {/* Tabs */}
        <div style={s.tabRow}>
          <button style={{ ...s.tab, ...(activeTab === 'questions' ? s.tabActive : {}) }}
            onClick={() => setActiveTab('questions')}>
            ✅ Questions ({questions.length})
          </button>
          <button style={{ ...s.tab, ...(activeTab === 'ai' ? s.tabActive : {}) }}
            onClick={() => setActiveTab('ai')}>
            🤖 Add with AI
          </button>
        </div>

        {/* Questions Tab */}
        {activeTab === 'questions' && (
          <div style={s.section}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ ...s.sectionTitle, margin: 0 }}>All Questions ({questions.length})</h3>
              <button style={s.addBtn} onClick={handleAddQuestion}>➕ Add Question</button>
            </div>

            {questions.length === 0 ? (
              <p style={{ color: '#7c7a8e', textAlign: 'center', padding: '20px' }}>
                No questions yet. Add manually or use AI.
              </p>
            ) : (
              questions.map((q, i) => (
                <div key={i} style={s.qCard}>
                  <div style={s.qHeader}>
                    <div style={s.qNum}>Q{i + 1}</div>
                    <button style={s.removeBtn} onClick={() => handleRemoveQuestion(i)}>Remove</button>
                  </div>
                  <input
                    style={{ ...s.input, marginBottom: '10px', fontWeight: '500' }}
                    placeholder="Question text"
                    value={q.text}
                    onChange={(e) => handleEditQuestion(i, 'text', e.target.value)}
                  />
                  <div style={s.optionsGrid}>
                    {['a', 'b', 'c', 'd'].map((opt) => (
                      <div key={opt} style={{ position: 'relative' }}>
                        <input
                          style={{ ...s.input, borderColor: q.correct_option === opt ? 'rgba(52,211,153,0.5)' : 'rgba(255,255,255,0.06)', paddingLeft: '32px', fontSize: '13px' }}
                          placeholder={`Option ${opt.toUpperCase()}`}
                          value={q[`option_${opt}`]}
                          onChange={(e) => handleEditQuestion(i, `option_${opt}`, e.target.value)}
                        />
                        <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '11px', fontWeight: '700', color: q.correct_option === opt ? '#34d399' : '#7c7a8e' }}>
                          {opt.toUpperCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: '10px' }}>
                    <label style={{ ...s.label, marginBottom: '6px' }}>Correct Answer</label>
                    <div style={s.correctRow}>
                      {['a', 'b', 'c', 'd'].map((opt) => (
                        <div key={opt}
                          style={{ ...s.correctBtn, background: q.correct_option === opt ? '#34d399' : '#16161d', color: q.correct_option === opt ? '#0f0f13' : '#7c7a8e', border: q.correct_option === opt ? '1px solid #34d399' : '1px solid rgba(255,255,255,0.08)' }}
                          onClick={() => handleEditQuestion(i, 'correct_option', opt)}>
                          {opt.toUpperCase()}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* AI Tab */}
        {activeTab === 'ai' && (
          <div style={s.section}>
            <h3 style={s.sectionTitle}>🤖 Add Questions with AI</h3>
            <p style={s.aiDesc}>Generate more questions and add them to this exam.</p>
            <div style={s.twoCol}>
              <div style={s.field}>
                <label style={s.label}>Topic</label>
                <input style={s.input} type="text"
                  placeholder="e.g. Python basics, World War 2"
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && generateWithAI()} />
              </div>
              <div style={s.field}>
                <label style={s.label}>Number of Questions</label>
                <select style={s.input} value={aiCount}
                  onChange={(e) => setAiCount(parseInt(e.target.value))}>
                  {[3, 5, 8, 10,20,30,40,50].map(n => (
                    <option key={n} value={n}>{n} questions</option>
                  ))}
                </select>
              </div>
            </div>
            <button style={{ ...s.aiBtn, opacity: aiLoading ? 0.7 : 1 }}
              onClick={generateWithAI} disabled={aiLoading}>
              {aiLoading ? '⏳ Generating...' : '✨ Generate & Add Questions'}
            </button>
          </div>
        )}

        {/* Save Button */}
        <button
          style={{ ...s.saveBtn, opacity: saving ? 0.7 : 1 }}
          onClick={handleSave}
          disabled={saving}>
          {saving ? 'Saving...' : '💾 Save Changes'}
        </button>
      </div>
    </div>
  );
}

const s = {
  page: { display: 'flex', minHeight: '100vh', background: '#0f0f13' },
  main: { flex: 1, padding: window.innerWidth <= 768 ? '76px 16px 24px' : '40px', overflowY: 'auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' },
  title: { fontSize: '28px', fontWeight: '700', color: '#f0eeff', marginBottom: '6px' },
  sub: { color: '#7c7a8e', fontSize: '14px' },
  backBtn: { padding: '10px 20px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#9090b0', borderRadius: '10px', fontSize: '14px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' },
  error: { background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', color: '#f87171', padding: '12px 16px', borderRadius: '10px', marginBottom: '20px', fontSize: '14px' },
  section: { background: '#1a1a24', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '24px', marginBottom: '20px' },
  sectionTitle: { fontSize: '16px', fontWeight: '600', color: '#f0eeff', marginBottom: '16px' },
  twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  field: { marginBottom: '16px' },
  label: { display: 'block', fontSize: '13px', color: '#9090b0', marginBottom: '7px', fontWeight: '500' },
  input: { width: '100%', padding: '11px 14px', background: '#16161d', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: '#f0eeff', fontSize: '14px', outline: 'none', boxSizing: 'border-box', fontFamily: 'DM Sans, sans-serif' },
  tabRow: { display: 'flex', gap: '10px', marginBottom: '16px' },
  tab: { padding: '10px 24px', background: '#1a1a24', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: '#7c7a8e', fontSize: '14px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontWeight: '500' },
  tabActive: { background: 'rgba(124,111,247,0.15)', border: '1px solid #7c6ff7', color: '#f0eeff' },
  aiDesc: { fontSize: '13px', color: '#7c7a8e', marginBottom: '16px', lineHeight: 1.6 },
  aiBtn: { width: '100%', padding: '12px 28px', background: 'linear-gradient(135deg, #7c6ff7, #a78bfa)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' },
  addBtn: { padding: '8px 18px', background: '#7c6ff7', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' },
  qCard: { background: '#16161d', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '18px', marginBottom: '12px' },
  qHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
  qNum: { background: '#7c6ff7', color: 'white', padding: '4px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '700' },
  removeBtn: { padding: '5px 14px', background: 'transparent', border: '1px solid rgba(248,113,113,0.3)', color: '#f87171', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' },
  optionsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  correctRow: { display: 'flex', gap: '10px' },
  correctBtn: { width: '48px', height: '48px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: '700', cursor: 'pointer' },
  saveBtn: { width: '100%', padding: '14px', background: '#34d399', color: '#0f0f13', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', marginTop: '8px' },
};