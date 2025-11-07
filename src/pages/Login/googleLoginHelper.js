// Path: src/pages/Login/googleLoginHelper.js
// Function: Works as a util file to support google login logic
// Version Update: First scaffold from refactored login 

import { getApiUrl } from '../../api/ApiMaster';

export const handleGoogleSuccess = async ({
  response,
  role,
  inviteCode,
  setUpgradeToken,
  setUpgradeOpen,
  navigate,
}) => {
  if (!role) {
    alert('Please select your role before signing in with Google.');
    return;
  }

  try {
    const base64Url = response.credential.split('.')[1];
    const decodedPayload = JSON.parse(atob(base64Url));
    const userEmail = decodedPayload.email;
    const userName = decodedPayload.name;

    const loginUrl = `${getApiUrl()}/edu/login`;
    console.log('Google login URL:', loginUrl);

    const res = await fetch(loginUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: userEmail,
        password: 'google_oauth',
        role,
        inviteCode: (role === 'student' && inviteCode) ? inviteCode : undefined,
      }),
    });

    console.log('Google login response status:', res.status);

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error('Google login error:', errorData);
      throw new Error(errorData.detail || `Google login failed (${res.status})`);
    }

    const data = await res.json();

    alert('Google Login successful!');
    localStorage.setItem('googleLoggedIn', true);
    localStorage.setItem('userName', userName);
    localStorage.setItem('userEmail', data.email);
    localStorage.setItem('userRole', data.role);
    localStorage.setItem('accessRole', data.accessRole || data.role);

    if (data.needsPasswordUpgrade) {
      setUpgradeToken(data.upgradeToken || null);
      setUpgradeOpen(true);
      return;
    }

    const dashboardRole = data.accessRole || data.role;
    navigate(`/dashboard/${dashboardRole}`);
  } catch (err) {
    console.error('Google Login Failed', err);
    alert(err.message || 'Google login failed.');
  }
};

export const handleGoogleError = () => {
  console.error('Google Login Failed');
  alert('Google Login failed. Please try again.');
};
