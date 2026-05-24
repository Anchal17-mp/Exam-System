import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { loginUser } from '../services/api';

export default function StudentLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Step 1 — Get JWT token
      const res = await loginUser({ username, password });
      const accessToken = res.data.access;

      // Step 2 — Save token
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', res.data.refresh);

      // Step 3 — Get user role
      const meRes = await axios.get('http://127.0.0.1:8000/api/me/', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      console.log('User data:', meRes.data);

      // Step 4 — Check role
      if (meRes.data.role !== 'student') {
        localStorage.clear();
        setError('This account is not a student account. Please use Tutor Login.');
        return;
      }

      // Step 5 — Save and redirect
      localStorage.setItem('username', meRes.data.username);
      localStorage.setItem('role', meRes.data.role);
      navigate('/student-dashboard');

    } catch (err) {
      localStorage.clear();
      console.log('Full error:', err);
      console.log('Response data:', err.response?.data);
      console.log('Status:', err.response?.status);

      if (err.response?.status === 401) {
        setError('Invalid username or password.');
      } else if (err.response?.status === 500) {
        setError('Server error. User profile may be missing.');
      } else if (err.message === 'Network Error') {
        setError('Cannot connect to server. Make sure Django is running.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <Navbar />
      <div style={s.container}>
        <div style={s.card}>
          <div style={s.iconWrap}>🎓</div>
          <h2 style={s.title}>Student Login</h2>
          <p style={s.hint}>Sign in to access your exams</p>
          {error && <div style={s.error}>{error}</div>}
          <form onSubmit={handleLogin}>
            <div style={s.field}>
              <label style={s.label}>Username</label>
              <input
                style={s.input}
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div style={s.field}>
              <label style={s.label}>Password</label>
              <input
                style={s.input}
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button style={s.btn} type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Login as Student'}
            </button>
          </form>
          <p style={s.footer}>
            No account? <Link to="/register" style={s.link}>Register here</Link>
          </p>
          <p style={s.footer}>
            Are you a tutor? <Link to="/tutor-login" style={s.link}>Tutor Login</Link>
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
  iconWrap: { fontSize: '40px', marginBottom: '16px' },
  title: { fontSize: '26px', fontWeight: '700', color: '#f0eeff', marginBottom: '6px' },
  hint: { color: '#7c7a8e', fontSize: '14px', marginBottom: '28px' },
  error: { background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', color: '#f87171', padding: '12px', borderRadius: '8px', fontSize: '13px', marginBottom: '18px', textAlign: 'left' },
  field: { marginBottom: '16px', textAlign: 'left' },
  label: { display: 'block', fontSize: '13px', color: '#9090b0', marginBottom: '7px' },
  input: { width: '100%', padding: '12px 16px', background: '#16161d', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: '#f0eeff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' },
  btn: { width: '100%', padding: '13px', background: '#34d399', color: '#0f0f13', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', marginTop: '4px' },
  footer: { marginTop: '12px', fontSize: '13px', color: '#7c7a8e' },
  link: { color: '#7c6ff7', textDecoration: 'none', fontWeight: '500' },
};