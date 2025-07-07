import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import styles from './Login.module.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(null);
  const [inviteCode, setInviteCode] = useState('');
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

  const handleGoogleSuccess = async (response) => {
    if (!role) {
      alert('Please select your role before signing in with Google.');
      return;
    }

    try {
      const base64Url = response.credential.split('.')[1];
      const decodedPayload = JSON.parse(atob(base64Url));
      const userEmail = decodedPayload.email;
      const userName = decodedPayload.name;

      const res = await fetch('http://localhost:8000/api/edu/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail,
          password: 'google_oauth',
          role: role,
          inviteCode: role === 'student' ? inviteCode : undefined,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'Google login failed');
      }

      const data = await res.json();

      alert('Google Login successful!');
      localStorage.setItem('googleLoggedIn', true);
      localStorage.setItem('userName', userName);
      localStorage.setItem('userEmail', data.email);
      localStorage.setItem('userRole', data.role);

      navigate(`/dashboard/${data.role}`);
    } catch (err) {
      console.error('Google Login Failed', err);
      alert(err.message || 'Google login failed.');
    }
  };

  const handleGoogleError = () => {
    console.error('Google Login Failed');
    alert('Google Login failed. Please try again.');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!role) {
      alert('Please select a role before logging in.');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/edu/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          role,
          inviteCode: role === 'student' ? inviteCode : undefined
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login failed');
      }

      const data = await response.json();

      localStorage.setItem('userRole', data.role);
      localStorage.setItem('userEmail', data.email);
      navigate(`/dashboard/${data.role}`);
    } catch (error) {
      alert(error.message || 'Login failed.');
    }
  };

  return (
    <GoogleOAuthProvider clientId="767450657361-c1arvbqpisqt92qpcf4596gkc6rsqbij.apps.googleusercontent.com">
      <div className={styles['login-wrapper']}>
        <div className={styles['login-form-area']}>
          <div className={styles['login-container']}>
            <h1>Login</h1>
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
                <label htmlFor="invite">Invite Code:</label>
                <input
                  type="text"
                  id="invite"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  required
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

            <div style={{ marginTop: '20px' }}>
              <p style={{ fontSize: '14px', marginBottom: '10px', color: '#666' }}>
                {role ? `Sign in with Google as ${role}` : 'Select a role first to use Google Sign-In'}
              </p>
              {role && (
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                />
              )}
            </div>
          </div>
        </div>
        <div className={styles['login-image-area']}></div>
      </div>
    </GoogleOAuthProvider>
  );
}

export default Login;
