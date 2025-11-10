// Path: src/pages/Login/Login.jsx
// Function: Handles Login logic
// Verison Update: Audit, clean up, and role augmentation.

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { handleGoogleSuccess, handleGoogleError } from './googleLoginHelper';

import { preparePasswordForLogin, pbkdf2ClientHash } from '../../utils/encryptionLoginHelper';

import UpdatePasswordModal from '../../components/UpdatePasswordModal';

import { getApiUrl } from '../../api/ApiMaster';
import styles from './Login.module.css';

// 🔒 Feature flag: Set to true to enable Google Login
const GOOGLE_ENABLED = false;
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(null);
  const [inviteCode, setInviteCode] = useState('');
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [upgradeToken, setUpgradeToken] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add('login-page');
    const isGoogleLoggedIn = localStorage.getItem('googleLoggedIn');
    const storedRole = localStorage.getItem('userRole');

    if (isGoogleLoggedIn && storedRole) {
      alert('Welcome back!');
      navigate(`/dashboard/${storedRole}`);
    }
    return () => {
      document.body.classList.remove('login-page');
    };
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!role) {
      alert('Please select a role before logging in.');
      return;
    }

    const loginUrl = `${getApiUrl()}/edu/login`;

    const attemptLogin = async (pwToSend) => {
      return fetch(loginUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password: pwToSend,
          role,
          accessRole: role,         //Enables Dynamic Role Select. 
          inviteCode: role === 'student' ? inviteCode : undefined,
        }),
      });
    };

    try {
      const { passwordToSend } = await preparePasswordForLogin({ email, password });
      let res = await attemptLogin(passwordToSend);

      if (res.status === 401) {
        const fallback = await attemptLogin(password);
        if (fallback.ok) {
          const data = await fallback.json();
          localStorage.setItem('userRole', data.role);
          localStorage.setItem('userEmail', data.email);
          localStorage.setItem('accessRole', data.accessRole || data.role);
          setUpgradeToken(data.upgradeToken || null);
          setUpgradeOpen(true);
          return;
        } else {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.detail || 'Invalid credentials');
        }
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || `Login failed (${res.status})`);
      }

      const data = await res.json();
      localStorage.setItem('userRole', data.role);
      localStorage.setItem('userEmail', data.email);
      localStorage.setItem('accessRole', data.accessRole || data.role);

      if (data.needsPasswordUpgrade) {
        setUpgradeToken(data.upgradeToken || null);
        setUpgradeOpen(true);
        return;
      }

      const dashboardRole = data.accessRole || data.role;
      navigate(`/dashboard/${dashboardRole}`);
    } catch (error) {
      console.error('Login error:', error);
      alert(error.message || 'Login failed.');
    }
  };

  const handleNewUserClick = () => navigate('/onboarding');

  const handleSubmitUpgrade = async (newPassword) => {
    try {
      const passwordToSend = await pbkdf2ClientHash(email, newPassword);
      const res = await fetch(`${getApiUrl()}/edu/upgrade-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          newPassword: passwordToSend,
          token: upgradeToken || undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Password upgrade failed');
      }
      setUpgradeOpen(false);
      const dashboardRole = localStorage.getItem('accessRole') || localStorage.getItem('userRole');
      navigate(`/dashboard/${dashboardRole}`);
    } catch (e) {
      alert(e.message || 'Password upgrade failed.');
    }
  };

  const handleSubmitReset = async (emailForReset) => {
    try {
      const res = await fetch(`${getApiUrl()}/edu/request-password-reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailForReset }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Unable to send reset email');
      }
      setResetOpen(false);
      alert('If an account exists for that email, a reset link has been sent.');
    } catch (e) {
      alert(e.message || 'Unable to send reset email.');
    }
  };

  const renderLoginPage = () => (
    <div className={styles['login-wrapper']}>
      <div className={styles['login-form-area']}>
        <div className={styles['login-container']}>
          <h1>Login</h1>

          <div style={{ fontSize: '10px', color: '#666', marginBottom: '10px', padding: '5px', backgroundColor: '#f0f0f0' }}>
            Debug: API URL = {getApiUrl()}, Mode = {import.meta.env.VITE_MODE || 'EDGE'}
          </div>

          <div style={{ marginBottom: '20px', textAlign: 'center' }}>
            <button
              onClick={handleNewUserClick}
              style={{
                backgroundColor: '#17a2b8',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '16px',
                padding: '12px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                border: 'none',
                width: '100%',
              }}
            >
              New User? Start Onboarding Here
            </button>
          </div>

          <div className={styles['form-group']}>
            <label>Select Role:</label>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setRole('student')}
                style={{ backgroundColor: role === 'student' ? '#28a745' : '#007bff', color: '#fff', padding: '10px', borderRadius: '5px', flex: 1 }}
              >
                I'm a Student
              </button>
              <button
                type="button"
                onClick={() => setRole('teacher')}
                style={{ backgroundColor: role === 'teacher' ? '#ffc107' : '#007bff', color: '#000', padding: '10px', borderRadius: '5px', flex: 1 }}
              >
                I'm a Teacher
              </button>
              <button
                type="button"
                onClick={() => setRole('admin')}
                style={{ backgroundColor: role === 'admin' ? '#6f42c1' : '#007bff', color: '#fff', padding: '10px', borderRadius: '5px', flex: 1 }}
              >
                I'm an Admin
              </button>
            </div>
          </div>

          {role === 'student' && (
            <div className={styles['form-group']}>
              <label htmlFor="invite">Invite Code (Optional):</label>
              <input
                type="text"
                id="invite"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="Enter invite code to connect with teacher/parent (optional)"
              />
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className={styles['form-group']}>
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className={styles['form-group']}>
              <label htmlFor="password">Password:</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit">Login</button>
          </form>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
            <button
              type="button"
              onClick={() => setResetOpen(true)}
              style={{ background: 'transparent', border: 'none', color: '#007bff', cursor: 'pointer', padding: 0 }}
            >
              Forgot password?
            </button>
          </div>

          {/* Google Login Block */}
          {GOOGLE_ENABLED && GOOGLE_CLIENT_ID && role && (
            <div style={{ marginTop: '20px' }}>
              <p style={{ fontSize: '14px', marginBottom: '10px', color: '#666' }}>
                Sign in with Google as {role}
              </p>
              <GoogleLogin
                onSuccess={(response) =>
                  handleGoogleSuccess({
                    response,
                    role,
                    inviteCode,
                    setUpgradeToken,
                    setUpgradeOpen,
                    navigate,
                  })
                }
                onError={handleGoogleError}
              />
            </div>
          )}
        </div>
      </div>
      <div className={styles['login-image-area']}></div>

      <UpdatePasswordModal
        open={upgradeOpen}
        mode="upgrade"
        onCancel={() => setUpgradeOpen(false)}
        onSubmit={handleSubmitUpgrade}
      />
      <UpdatePasswordModal
        open={resetOpen}
        mode="reset"
        emailPrefill={email}
        onCancel={() => setResetOpen(false)}
        onSubmit={handleSubmitReset}
      />
    </div>
  );

  return GOOGLE_ENABLED ? (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID_HERE'}>
      {renderLoginPage()}
    </GoogleOAuthProvider>
  ) : (
    renderLoginPage()
  );
}

export default Login;
