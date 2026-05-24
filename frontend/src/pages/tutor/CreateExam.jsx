import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TutorSidebar from '../../components/TutorSidebar';
import { generateQuestions } from '../../services/api';

export default function CreateExam() {
  const navigate = useNavigate();
  const [exam, setExam] = useState({ title: '', description: '', duration_minutes: 30 });
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState({ text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_option: 'a' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [aiCount, setAiCount] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [importText, setImportText] = useState('');
  const [importing, setImporting] = useState(false);
  const [activeTab, setActiveTab] = useState('ai');

  // =====================
  // AI GENERATE
  // =====================
  const generateWithAI = async () => {
    if (!aiTopic.trim()) { alert('Please enter a topic'); return; }
    setAiLoading(true);
    try {
      const res = await generateQuestions({ topic: aiTopic, count: aiCount });
      const parsed = res.data.questions;

      setQuestions(prev => [...prev, ...parsed]);

      if (!exam.title) {
        setExam(prev => ({ ...prev, title: `${aiTopic} Quiz` }));
      }

      alert(`✅ ${parsed.length} questions generated successfully!`);

    } catch (err) {
      console.error('AI error:', err);
      alert(`AI generation failed: ${err.response?.data?.error || err.message}`);
    } finally {
      setAiLoading(false);
    }
  };

  // =====================
  // IMPORT FROM TEXT
  // =====================
  const importFromText = () => {
    if (!importText.trim()) { alert('Please paste your questions first'); return; }
    setImporting(true);

    try {
      const blocks = importText.trim().split(/\n\s*\n/);
      const parsed = [];

      for (const block of blocks) {
        const lines = block.trim().split('\n').map(l => l.trim()).filter(Boolean);
        if (lines.length < 6) continue;

        const questionLine = lines.find(l => l.startsWith('Q:'));
        const optionA = lines.find(l => l.startsWith('A:'));
        const optionB = lines.find(l => l.startsWith('B:'));
        const optionC = lines.find(l => l.startsWith('C:'));
        const optionD = lines.find(l => l.startsWith('D:'));
        const answerLine = lines.find(l => l.startsWith('Answer:'));

        if (!questionLine || !optionA || !optionB || !optionC || !optionD || !answerLine) continue;

        const answerLetter = answerLine.replace('Answer:', '').trim().toLowerCase();
        const correctOption = ['a', 'b', 'c', 'd'].includes(answerLetter) ? answerLetter : 'a';

        parsed.push({
          text: questionLine.replace('Q:', '').trim(),
          option_a: optionA.replace('A:', '').trim(),
          option_b: optionB.replace('B:', '').trim(),
          option_c: optionC.replace('C:', '').trim(),
          option_d: optionD.replace('D:', '').trim(),
          correct_option: correctOption,
        });
      }

      if (parsed.length === 0) {
        alert('No valid questions found. Please check the format.');
        setImporting(false);
        return;
      }

      setQuestions(prev => [...prev, ...parsed]);
      if (!exam.title) setExam(prev => ({ ...prev, title: 'Imported Quiz' }));
      setImportText('');
      alert(`✅ ${parsed.length} questions imported!`);

    } catch (err) {
      alert(`Import failed: ${err.message}`);
    } finally {
      setImporting(false);
    }
  };

  // =====================
  // MANUAL ADD
  // =====================
  const handleAddQuestion = () => {
    if (!currentQ.text.trim()) { alert('Please enter the question text'); return; }
    if (!currentQ.option_a.trim() || !currentQ.option_b.trim() ||
      !currentQ.option_c.trim() || !currentQ.option_d.trim()) {
      alert('Please fill in all 4 options'); return;
    }
    setQuestions(prev => [...prev, { ...currentQ }]);
    setCurrentQ({ text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_option: 'a' });
  };

  const handleRemoveQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleEditQuestion = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  // =====================
  // SUBMIT EXAM
  // =====================
  const handleSubmit = async () => {
    if (!exam.title.trim()) { setError('Exam title is required'); return; }
    if (questions.length === 0) { setError('Add at least one question'); return; }
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('access_token');
      if (!token) { setError('Not logged in.'); navigate('/tutor-login'); return; }

      const response = await fetch('http://127.0.0.1:8000/api/create-exam/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ ...exam, questions }),
      });

      if (response.status === 401) {
        localStorage.clear();
        navigate('/tutor-login');
        return;
      }

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(JSON.stringify(errData));
      }

      alert(`✅ Exam "${exam.title}" created with ${questions.length} questions!`);
      navigate('/tutor-dashboard');

    } catch (err) {
      setError(`Failed to create exam: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <TutorSidebar />
      <div style={s.main}>
        <h1 style={s.title}>Create New Exam</h1>
        <p style={s.subtitle}>Use AI to generate questions, import from text, or add manually</p>

        {error && <div style={s.error}>{error}</div>}

        {/* Exam Details */}
        <div style={s.section}>
          <h3 style={s.sectionTitle}>📋 Exam Details</h3>
          <div style={s.twoCol}>
            <div style={s.field}>
              <label style={s.label}>Exam Title</label>
              <input style={s.input} type="text" placeholder="e.g. Python Basics Quiz"
                value={exam.title} onChange={(e) => setExam({ ...exam, title: e.target.value })} />
            </div>
            <div style={s.field}>
              <label style={s.label}>Duration (minutes)</label>
              <input style={s.input} type="number" min="5" max="180"
                value={exam.duration_minutes}
                onChange={(e) => setExam({ ...exam, duration_minutes: parseInt(e.target.value) })} />
            </div>
          </div>
          <div style={s.field}>
            <label style={s.label}>Description (optional)</label>
            <input style={s.input} type="text" placeholder="Brief description"
              value={exam.description} onChange={(e) => setExam({ ...exam, description: e.target.value })} />
          </div>
        </div>

        {/* Tab Switcher */}
        <div style={s.tabRow}>
          <button style={{ ...s.tab, ...(activeTab === 'ai' ? s.tabActive : {}) }}
            onClick={() => setActiveTab('ai')}>🤖 AI Generate</button>
          <button style={{ ...s.tab, ...(activeTab === 'import' ? s.tabActive : {}) }}
            onClick={() => setActiveTab('import')}>📝 Import Text</button>
          <button style={{ ...s.tab, ...(activeTab === 'manual' ? s.tabActive : {}) }}
            onClick={() => setActiveTab('manual')}>✏️ Add Manually</button>
        </div>

        {/* AI Tab */}
        {activeTab === 'ai' && (
          <div style={s.section}>
            <h3 style={s.sectionTitle}>🤖 AI Question Generator</h3>
            <p style={s.aiDesc}>Type a topic and AI will generate MCQ questions automatically!</p>
            <div style={s.twoCol}>
              <div style={s.field}>
                <label style={s.label}>Topic</label>
                <input style={s.input} type="text"
                  placeholder="Type your Topic"
                  value={aiTopic} onChange={(e) => setAiTopic(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && generateWithAI()} />
              </div>
              <div style={s.field}>
                <label style={s.label}>Number of Questions</label>
                <select style={s.input} value={aiCount}
                  onChange={(e) => setAiCount(parseInt(e.target.value))}>
                  {[3, 5, 8, 10, 15, 20,30,40,50].map(n => (
                    <option key={n} value={n}>{n} questions</option>
                  ))}
                </select>
              </div>
            </div>
            <button style={{ ...s.aiBtn, opacity: aiLoading ? 0.7 : 1 }}
              onClick={generateWithAI} disabled={aiLoading}>
              {aiLoading ? '⏳ Generating...' : '✨ Generate Questions with AI'}
            </button>
            {aiLoading && (
              <div style={s.aiStatus}>
                🤖 AI is creating {aiCount} questions about "{aiTopic}"...
              </div>
            )}
          </div>
        )}

        {/* Import Tab */}
        {activeTab === 'import' && (
          <div style={s.section}>
            <h3 style={s.sectionTitle}>📝 Import from Text</h3>
            <p style={s.aiDesc}>Paste questions in the format below — converted instantly!</p>
            <div style={s.formatGuide}>
              <p style={s.formatTitle}>📌 Format — separate each question with empty line:</p>
              <pre style={s.formatCode}>{`Q: What is Python?
A: A programming language
B: A snake
C: A database
D: A framework
Answer: A`}</pre>
            </div>
            <div style={s.field}>
              <label style={s.label}>Paste questions here</label>
              <textarea
                style={{ ...s.input, minHeight: '250px', resize: 'vertical', fontFamily: 'monospace', fontSize: '13px', lineHeight: '1.7' }}
                placeholder="Q: Your question here?&#10;A: Option A&#10;B: Option B&#10;C: Option C&#10;D: Option D&#10;Answer: A"
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button style={{ ...s.aiBtn, opacity: importing ? 0.7 : 1 }}
                onClick={importFromText} disabled={importing}>
                {importing ? '⏳ Converting...' : '✨ Convert to Questions'}
              </button>
              {importText && (
                <button style={s.clearBtn} onClick={() => setImportText('')}>Clear</button>
              )}
            </div>
          </div>
        )}

        {/* Manual Tab */}
        {activeTab === 'manual' && (
          <div style={s.section}>
            <h3 style={s.sectionTitle}>
              ✏️ Add Question Manually
              {questions.length > 0 && <span style={s.qCount}>{questions.length} added</span>}
            </h3>
            <div style={s.field}>
              <label style={s.label}>Question Text</label>
              <input style={s.input} type="text" placeholder="Enter your question here"
                value={currentQ.text}
                onChange={(e) => setCurrentQ({ ...currentQ, text: e.target.value })} />
            </div>
            <div style={s.optionsGrid}>
              {['a', 'b', 'c', 'd'].map((opt) => (
                <div key={opt} style={s.field}>
                  <label style={s.label}>
                    Option {opt.toUpperCase()}
                    {currentQ.correct_option === opt && <span style={s.correctTag}>✓ Correct</span>}
                  </label>
                  <input
                    style={{ ...s.input, borderColor: currentQ.correct_option === opt ? 'rgba(52,211,153,0.5)' : 'rgba(255,255,255,0.08)' }}
                    type="text" placeholder={`Option ${opt.toUpperCase()}`}
                    value={currentQ[`option_${opt}`]}
                    onChange={(e) => setCurrentQ({ ...currentQ, [`option_${opt}`]: e.target.value })} />
                </div>
              ))}
            </div>
            <div style={s.field}>
              <label style={s.label}>Correct Answer</label>
              <div style={s.correctRow}>
                {['a', 'b', 'c', 'd'].map((opt) => (
                  <div key={opt}
                    style={{ ...s.correctBtn, background: currentQ.correct_option === opt ? '#34d399' : '#16161d', color: currentQ.correct_option === opt ? '#0f0f13' : '#7c7a8e', border: currentQ.correct_option === opt ? '1px solid #34d399' : '1px solid rgba(255,255,255,0.08)' }}
                    onClick={() => setCurrentQ({ ...currentQ, correct_option: opt })}>
                    {opt.toUpperCase()}
                  </div>
                ))}
              </div>
            </div>
            <button style={s.addBtn} onClick={handleAddQuestion}>➕ Add Question</button>
          </div>
        )}

        {/* Questions List */}
        {questions.length > 0 && (
          <div style={s.section}>
            <h3 style={s.sectionTitle}>✅ All Questions ({questions.length})</h3>
            {questions.map((q, i) => (
              <div key={i} style={s.qCard}>
                <div style={s.qHeader}>
                  <div style={s.qNum}>Q{i + 1}</div>
                  <button style={s.removeBtn} onClick={() => handleRemoveQuestion(i)}>Remove</button>
                </div>
                <input
                  style={{ ...s.input, marginBottom: '10px', fontSize: '14px', fontWeight: '500' }}
                  value={q.text}
                  onChange={(e) => handleEditQuestion(i, 'text', e.target.value)} />
                <div style={s.optionsGrid}>
                  {['a', 'b', 'c', 'd'].map((opt) => (
                    <div key={opt} style={{ position: 'relative' }}>
                      <input
                        style={{ ...s.input, borderColor: q.correct_option === opt ? 'rgba(52,211,153,0.5)' : 'rgba(255,255,255,0.06)', paddingLeft: '32px', fontSize: '13px' }}
                        value={q[`option_${opt}`]}
                        onChange={(e) => handleEditQuestion(i, `option_${opt}`, e.target.value)} />
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
            ))}
          </div>
        )}

        {/* Submit */}
        <button
          style={{ ...s.submitBtn, opacity: loading || questions.length === 0 ? 0.6 : 1 }}
          onClick={handleSubmit} disabled={loading || questions.length === 0}>
          {loading ? 'Creating Exam...' : `🚀 Create Exam with ${questions.length} Question${questions.length !== 1 ? 's' : ''}`}
        </button>
      </div>
    </div>
  );
}

const s = {
  page: { display: 'flex', minHeight: '100vh', background: '#0f0f13' },
  main: { flex: 1, padding: window.innerWidth <= 768 ? '76px 16px 24px' : '40px', overflowY: 'auto' },
  title: { fontSize: '28px', fontWeight: '700', color: '#f0eeff', marginBottom: '6px' },
  subtitle: { color: '#7c7a8e', fontSize: '14px', marginBottom: '28px' },
  error: { background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', color: '#f87171', padding: '12px 16px', borderRadius: '10px', marginBottom: '20px', fontSize: '14px' },
  section: { background: '#1a1a24', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '24px', marginBottom: '20px' },
  sectionTitle: { fontSize: '16px', fontWeight: '600', color: '#f0eeff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' },
  twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  field: { marginBottom: '16px' },
  label: { display: 'block', fontSize: '13px', color: '#9090b0', marginBottom: '7px', fontWeight: '500' },
  input: { width: '100%', padding: '11px 14px', background: '#16161d', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: '#f0eeff', fontSize: '14px', outline: 'none', boxSizing: 'border-box', fontFamily: 'DM Sans, sans-serif' },
  tabRow: { display: 'flex', gap: '10px', marginBottom: '16px' },
  tab: { padding: '10px 24px', background: '#1a1a24', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: '#7c7a8e', fontSize: '14px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontWeight: '500' },
  tabActive: { background: 'rgba(124,111,247,0.15)', border: '1px solid #7c6ff7', color: '#f0eeff' },
  aiDesc: { fontSize: '13px', color: '#7c7a8e', marginBottom: '16px', lineHeight: 1.6 },
  aiBtn: { flex: 1, padding: '12px 28px', background: 'linear-gradient(135deg, #7c6ff7, #a78bfa)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', width: '100%' },
  aiStatus: { marginTop: '12px', padding: '12px 16px', background: 'rgba(124,111,247,0.1)', border: '1px solid rgba(124,111,247,0.2)', borderRadius: '10px', fontSize: '13px', color: '#a78bfa', textAlign: 'center' },
  formatGuide: { background: '#0f0f13', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '16px', marginBottom: '16px' },
  formatTitle: { fontSize: '12px', color: '#a78bfa', fontWeight: '600', marginBottom: '8px' },
  formatCode: { fontSize: '12px', color: '#7c7a8e', lineHeight: 1.8, margin: 0, fontFamily: 'monospace', whiteSpace: 'pre-wrap' },
  clearBtn: { padding: '12px 20px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#7c7a8e', borderRadius: '10px', fontSize: '14px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' },
  qCount: { fontSize: '12px', background: 'rgba(52,211,153,0.15)', color: '#34d399', padding: '3px 10px', borderRadius: '20px', fontWeight: '500' },
  optionsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  correctTag: { marginLeft: '8px', fontSize: '11px', color: '#34d399', fontWeight: '600' },
  correctRow: { display: 'flex', gap: '10px' },
  correctBtn: { width: '48px', height: '48px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: '700', cursor: 'pointer' },
  addBtn: { padding: '11px 24px', background: '#7c6ff7', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' },
  qCard: { background: '#16161d', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '18px', marginBottom: '12px' },
  qHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
  qNum: { background: '#7c6ff7', color: 'white', padding: '4px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '700' },
  removeBtn: { padding: '5px 14px', background: 'transparent', border: '1px solid rgba(248,113,113,0.3)', color: '#f87171', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' },
  submitBtn: { width: '100%', padding: '14px', background: '#34d399', color: '#0f0f13', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', marginTop: '8px' },
};