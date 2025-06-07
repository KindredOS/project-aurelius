import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Add the login-page class to the body when the component mounts
    document.body.classList.add('login-page');

    // Check for Google login state
    const isGoogleLoggedIn = localStorage.getItem('googleLoggedIn');
    if (isGoogleLoggedIn) {
      alert('Welcome back!');
      navigate('/dashboard');
    }

    return () => {
      // Remove the login-page class when the component unmounts
      document.body.classList.remove('login-page');
    };
  }, [navigate]);

  const handleGoogleSuccess = (response) => {
    console.log('Google Login Success:', response.credential);
    alert('Google Login successful!');

    // Save login state to localStorage
    localStorage.setItem('googleLoggedIn', true);
    navigate('/dashboard');
  };

  const handleGoogleError = () => {
    console.error('Google Login Failed');
    alert('Google Login failed. Please try again.');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Check for Google login token
    const isGoogleLoggedIn = localStorage.getItem('googleLoggedIn');
    if (isGoogleLoggedIn) {
      alert('Login successful via Google!');
      navigate('/dashboard');
      return;
    }

    // Default login credentials
    if (email === 'user@example.com' && password === 'password') {
      alert('Login successful!');
      navigate('/dashboard');
    } else {
      alert('Invalid credentials. Please try again.');
    }
  };

  return (
    <GoogleOAuthProvider clientId="767450657361-c1arvbqpisqt92qpcf4596gkc6rsqbij.apps.googleusercontent.com">
      <div className="login-container">
        <h1>Login</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
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
    </GoogleOAuthProvider>
  );
}

export default Login;
