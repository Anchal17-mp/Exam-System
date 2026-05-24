import { useState } from 'react';
import StudentSidebar from '../../components/StudentSidebar';
import axios from 'axios';

export default function StudentAccount() {
  const username = localStorage.getItem('username') || 'Student';
  const [activeTab, setActiveTab] = useState('profile');
  const [passwords, setPasswords] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passwords.new_password !== passwords.confirm_password) {
      setError('New passwords do not match.');
      return;
    }

    if (passwords.new_password.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      await axios.post(
        'http://127.0.0.1:8000/api/change-password/',
        {
          old_password: passwords.old_password,
          new_password: passwords.new_password,
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setSuccess('Password changed successfully!');
      setPasswords({ old_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Failed to change password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <StudentSidebar />
      <div style={s.main}>
        <h1 style={s.title}>My Account</h1>
        <p style={s.sub}>Manage your profile and security settings</p>

        {/* Tab Switcher */}
        <div style={s.tabRow}>
          <button
            style={{ ...s.tab, ...(activeTab === 'profile' ? s.tabActive : {}) }}
            onClick={() => setActiveTab('profile')}>
            👤 Profile
          </button>
          <button
            style={{ ...s.tab, ...(activeTab === 'password' ? s.tabActive : {}) }}
            onClick={() => setActiveTab('password')}>
            🔒 Change Password
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div style={s.section}>
            <div style={s.profileTop}>
              <div style={s.avatar}>
                {username[0].toUpperCase()}
              </div>
              <div>
                <h2 style={s.profileName}>{username}</h2>
                <span style={s.roleBadge}>🎓 Student</span>
              </div>
            </div>

            <div style={s.infoGrid}>
              <div style={s.infoCard}>
                <span style={s.infoLabel}>Username</span>
                <span style={s.infoValue}>{username}</span>
              </div>
              <div style={s.infoCard}>
                <span style={s.infoLabel}>Role</span>
                <span style={s.infoValue}>Student</span>
              </div>
              <div style={s.infoCard}>
                <span style={s.infoLabel}>Account Status</span>
                <span style={{ ...s.infoValue, color: '#34d399' }}>● Active</span>
              </div>
              <div style={s.infoCard}>
                <span style={s.infoLabel}>Platform</span>
                <span style={s.infoValue}>ExamPro</span>
              </div>
            </div>
          </div>
        )}

        {/* Change Password Tab */}
        {activeTab === 'password' && (
          <div style={s.section}>
            <h3 style={s.sectionTitle}>🔒 Change Password</h3>
            <p style={s.sectionDesc}>Make sure your new password is at least 6 characters long.</p>

            {error && <div style={s.error}>{error}</div>}
            {success && <div style={s.success}>{success}</div>}

            <form onSubmit={handleChangePassword} style={{ maxWidth: '400px' }}>
              <div style={s.field}>
                <label style={s.label}>Current Password</label>
                <input
                  style={s.input}
                  type="password"
                  placeholder="Enter current password"
                  value={passwords.old_password}
                  onChange={(e) => setPasswords({ ...passwords, old_password: e.target.value })}
                  required
                />
              </div>
              <div style={s.field}>
                <label style={s.label}>New Password</label>
                <input
                  style={s.input}
                  type="password"
                  placeholder="Enter new password"
                  value={passwords.new_password}
                  onChange={(e) => setPasswords({ ...passwords, new_password: e.target.value })}
                  required
                />
              </div>
              <div style={s.field}>
                <label style={s.label}>Confirm New Password</label>
                <input
                  style={s.input}
                  type="password"
                  placeholder="Confirm new password"
                  value={passwords.confirm_password}
                  onChange={(e) => setPasswords({ ...passwords, confirm_password: e.target.value })}
                  required
                />
              </div>
              <button style={s.btn} type="submit" disabled={loading}>
                {loading ? 'Changing Password...' : 'Change Password'}
              </button>
            </form>
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
  tabRow: { display: 'flex', gap: '10px', marginBottom: '24px' },
  tab: { padding: '10px 24px', background: '#1a1a24', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: '#7c7a8e', fontSize: '14px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontWeight: '500' },
  tabActive: { background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.4)', color: '#34d399' },
  section: { background: '#1a1a24', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '32px', maxWidth: '700px' },
  profileTop: { display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px', paddingBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.06)' },
  avatar: { width: '72px', height: '72px', borderRadius: '50%', background: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: '700', color: '#0f0f13', flexShrink: 0 },
  profileName: { fontSize: '22px', fontWeight: '700', color: '#f0eeff', marginBottom: '6px' },
  roleBadge: { display: 'inline-block', padding: '4px 12px', background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.3)', color: '#34d399', borderRadius: '20px', fontSize: '13px', fontWeight: '500' },
  infoGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' },
  infoCard: { background: '#16161d', borderRadius: '12px', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '6px' },
  infoLabel: { fontSize: '11px', color: '#7c7a8e', textTransform: 'uppercase', letterSpacing: '0.06em' },
  infoValue: { fontSize: '15px', color: '#f0eeff', fontWeight: '500' },
  sectionTitle: { fontSize: '16px', fontWeight: '600', color: '#f0eeff', marginBottom: '8px' },
  sectionDesc: { fontSize: '13px', color: '#7c7a8e', marginBottom: '24px' },
  error: { background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', color: '#f87171', padding: '12px 16px', borderRadius: '10px', marginBottom: '20px', fontSize: '13px' },
  success: { background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)', color: '#34d399', padding: '12px 16px', borderRadius: '10px', marginBottom: '20px', fontSize: '13px' },
  field: { marginBottom: '16px' },
  label: { display: 'block', fontSize: '13px', color: '#9090b0', marginBottom: '7px', fontWeight: '500' },
  input: { width: '100%', padding: '12px 14px', background: '#16161d', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: '#f0eeff', fontSize: '14px', outline: 'none', boxSizing: 'border-box', fontFamily: 'DM Sans, sans-serif' },
  btn: { width: '100%', padding: '13px', background: '#34d399', color: '#0f0f13', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', marginTop: '4px' },
};