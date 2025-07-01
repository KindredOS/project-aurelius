import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import styles from './Login.module.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(null);
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

  const handleGoogleSuccess = (response) => {
    console.log('Google Login Success:', response.credential);
    alert('Google Login successful!');
    localStorage.setItem('googleLoggedIn', true);
    if (role) localStorage.setItem('userRole', role);
    navigate(`/dashboard/${role}`);
  };

  const handleGoogleError = () => {
    console.error('Google Login Failed');
    alert('Google Login failed. Please try again.');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!role) {
      alert('Please select a role before logging in.');
      return;
    }

    const isGoogleLoggedIn = localStorage.getItem('googleLoggedIn');
    if (isGoogleLoggedIn) {
      alert('Login successful via Google!');
      navigate(`/dashboard/${role}`);
      return;
    }

    if (email === 'user@example.com' && password === 'password') {
      alert('Login successful!');
      localStorage.setItem('userRole', role);
      navigate(`/dashboard/${role}`);
    } else {
      alert('Invalid credentials. Please try again.');
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
                  I’m a Student
                </button>
                <button
                  type="button"
                  onClick={() => setRole('teacher')}
                  style={{ backgroundColor: role === 'teacher' ? '#ffc107' : '#007bff', color: '#000', padding: '10px', borderRadius: '5px', flex: 1 }}
                >
                  I’m a Teacher
                </button>
                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  style={{ backgroundColor: role === 'admin' ? '#6f42c1' : '#007bff', color: '#fff', padding: '10px', borderRadius: '5px', flex: 1 }}
                >
                  I’m an Admin
                </button>
              </div>
            </div>
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
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
              />
            </div>
          </div>
        </div>
        <div className={styles['login-image-area']}></div>
      </div>
    </GoogleOAuthProvider>
  );
}

export default Login;
