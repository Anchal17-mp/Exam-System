import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { registerUser } from '../services/api';

export default function StudentRegister() {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    role: 'student'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await registerUser(form);
      setSuccess('Account created! Redirecting to login...');
      setTimeout(() => {
        if (form.role === 'tutor') {
          navigate('/tutor-login');
        } else {
          navigate('/student-login');
        }
      }, 1500);
    } catch (err) {
      setError('Registration failed. Username may already exist.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <Navbar />
      <div style={s.container}>
        <div style={s.card}>
          <h2 style={s.title}>Create Account</h2>
          <p style={s.hint}>Register as a tutor or student</p>

          {/* Role Selector */}
          <div style={s.roleRow}>
            <div
              style={{ ...s.roleBtn, ...(form.role === 'student' ? s.roleActiveStudent : {}) }}
              onClick={() => setForm({ ...form, role: 'student' })}>
              🎓 Student
            </div>
            <div
              style={{ ...s.roleBtn, ...(form.role === 'tutor' ? s.roleActiveTutor : {}) }}
              onClick={() => setForm({ ...form, role: 'tutor' })}>
              👨‍🏫 Tutor
            </div>
          </div>

          {error && <div style={s.error}>{error}</div>}
          {success && <div style={s.success}>{success}</div>}

          <form onSubmit={handleRegister}>
            <div style={s.field}>
              <label style={s.label}>Username</label>
              <input
                style={s.input}
                type="text"
                name="username"
                placeholder="Choose a username"
                value={form.username}
                onChange={handle}
                required
              />
            </div>
            <div style={s.field}>
              <label style={s.label}>Email</label>
              <input
                style={s.input}
                type="email"
                name="email"
                placeholder="Your email address"
                value={form.email}
                onChange={handle}
              />
            </div>
            <div style={s.field}>
              <label style={s.label}>Password</label>
              <input
                style={s.input}
                type="password"
                name="password"
                placeholder="Create a password"
                value={form.password}
                onChange={handle}
                required
              />
            </div>
            <button
              style={{
                ...s.btn,
                background: form.role === 'tutor' ? '#7c6ff7' : '#34d399',
                color: form.role === 'tutor' ? 'white' : '#0f0f13',
              }}
              type="submit"
              disabled={loading}>
              {loading ? 'Creating account...' : `Register as ${form.role === 'tutor' ? 'Tutor' : 'Student'}`}
            </button>
          </form>

          <p style={s.footer}>
            Already have an account?{' '}
            <Link to={form.role === 'tutor' ? '/tutor-login' : '/student-login'} style={s.link}>
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', background: '#0f0f13' },
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 68px)', padding: '40px' },
  card: { background: '#1a1a24', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', padding: '48px 40px', width: '100%', maxWidth: '400px', textAlign: 'center' },
  title: { fontSize: '26px', fontWeight: '700', color: '#f0eeff', marginBottom: '6px' },
  hint: { color: '#7c7a8e', fontSize: '14px', marginBottom: '24px' },
  roleRow: { display: 'flex', gap: '10px', marginBottom: '24px' },
  roleBtn: { flex: 1, padding: '12px', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', textAlign: 'center', cursor: 'pointer', fontSize: '14px', color: '#7c7a8e', background: '#16161d', transition: 'all 0.15s' },
  roleActiveStudent: { border: '1px solid #34d399', color: '#34d399', background: 'rgba(52,211,153,0.1)' },
  roleActiveTutor: { border: '1px solid #7c6ff7', color: '#7c6ff7', background: 'rgba(124,111,247,0.1)' },
  error: { background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', color: '#f87171', padding: '12px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px', textAlign: 'left' },
  success: { background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)', color: '#34d399', padding: '12px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' },
  field: { marginBottom: '16px', textAlign: 'left' },
  label: { display: 'block', fontSize: '13px', color: '#9090b0', marginBottom: '7px' },
  input: { width: '100%', padding: '12px 16px', background: '#16161d', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: '#f0eeff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' },
  btn: { width: '100%', padding: '13px', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', marginTop: '4px' },
  footer: { marginTop: '16px', fontSize: '13px', color: '#7c7a8e' },
  link: { color: '#7c6ff7', textDecoration: 'none', fontWeight: '500' },
};