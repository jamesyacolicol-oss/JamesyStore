import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './login.css';

export default function Login() {
  const [credentials, setCredentials] = useState({ phone: '', password: '' });
  const [modal, setModal] = useState({ show: false, message: '', type: '' });

  // Password change states
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [loginResponse, setLoginResponse] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('/api/login', {
        phone: credentials.phone.trim(),
        password: credentials.password,
      });

      const data = response.data;
      localStorage.setItem('token', data.token);

      // Check if password change is required
      if (data.must_change_password) {
        setLoginResponse(data);
        setMustChangePassword(true);
        return;
      }

      setModal({ show: true, message: 'Login successful!', type: 'success' });

      setTimeout(() => {
        if (data.role === 'staff') {
          navigate('/staff/dashboard');
        } else {
          navigate('/admin/dashboard');
        }
      }, 1000);
    } catch (error) {
      console.error('Login Error:', error.response?.data || error.message);
      setModal({ show: true, message: 'Invalid phone number or password.', type: 'failed' });
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError('');

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    setChangingPassword(true);

    try {
      const token = localStorage.getItem('token');
      await axios.put('/api/change-password', {
        new_password: newPassword,
        new_password_confirmation: confirmPassword,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMustChangePassword(false);
      setModal({ show: true, message: 'Password changed successfully!', type: 'success' });

      setTimeout(() => {
        if (loginResponse?.role === 'staff') {
          navigate('/staff/dashboard');
        } else {
          navigate('/admin/dashboard');
        }
      }, 1000);
    } catch (error) {
      setPasswordError(error.response?.data?.message || 'Failed to change password.');
    } finally {
      setChangingPassword(false);
    }
  };

  if (mustChangePassword) {
    return (
      <div className="login-page-wrapper">
        <form className="login-form" onSubmit={handlePasswordChange}>
          <h2 className="login-title">Set Permanent Password</h2>
          <p style={{ fontSize: '14px', color: '#6b7280', textAlign: 'center', marginBottom: '16px' }}>
            You are logging in for the first time. Please set a new password.
          </p>

          {passwordError && (
            <div style={{ padding: '8px 12px', background: '#fef2f2', color: '#b91c1c', borderRadius: '6px', fontSize: '13px', marginBottom: '12px', textAlign: 'center' }}>
              {passwordError}
            </div>
          )}

          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={6}
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
          />
          <button type="submit" disabled={changingPassword}>
            {changingPassword ? 'Saving...' : 'Set Password'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="login-page-wrapper">
      <form className="login-form" onSubmit={handleLogin}>
        <h2 className="login-title">Jamesy Store</h2>
        <input
          type="text"
          placeholder="Phone Number"
          value={credentials.phone}
          onChange={(e) => setCredentials({ ...credentials, phone: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={credentials.password}
          onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
          required
        />
        <button type="submit">Login</button>
      </form>

      {modal.show && (
        <div className="modal-overlay">
          <div className={`modal-box ${modal.type}`}>
            <p>{modal.message}</p>
            {modal.type === 'failed' && (
              <button onClick={() => setModal({ ...modal, show: false })}>Close</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

