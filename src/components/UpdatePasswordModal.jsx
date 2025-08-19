import React, { useEffect, useState } from 'react';

/**
 * UpdatePasswordModal
 * 
 * Modes:
 * - "upgrade": Force user to set a new password (min 8 chars, confirm)
 * - "reset": Collect email to send a password reset link
 *
 * Props:
 * - open: boolean
 * - mode: "upgrade" | "reset"
 * - emailPrefill?: string (for reset mode convenience)
 * - onCancel: () => void
 * - onSubmit: (payload) => void
 *    - upgrade mode: onSubmit(newPassword: string)
 *    - reset mode: onSubmit(email: string)
 */
export default function UpdatePasswordModal({
  open,
  mode = 'upgrade',
  emailPrefill = '',
  onCancel,
  onSubmit,
}) {
  const [email, setEmail] = useState(emailPrefill || '');
  const [pw1, setPw1] = useState('');
  const [pw2, setPw2] = useState('');

  useEffect(() => {
    setEmail(emailPrefill || '');
  }, [emailPrefill]);

  if (!open) return null;

  const isReset = mode === 'reset';
  const hasValidEmail = /\S+@\S+\.\S+/.test(email);
  const pwValid = pw1.length >= 8 && pw1 === pw2;

  const canSubmit = isReset ? hasValidEmail : pwValid;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    if (isReset) {
      onSubmit(email.trim());
    } else {
      onSubmit(pw1);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
    }}>
      <form onSubmit={handleSubmit} style={{
        background: '#fff', borderRadius: 12, padding: 20, width: 380,
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
      }}>
        <h3 style={{ marginTop: 0 }}>
          {isReset ? 'Forgot Password' : 'Update Your Password'}
        </h3>

        {isReset ? (
          <>
            <p style={{ marginTop: 0 }}>
              Enter your account email and we’ll send a password reset link.
            </p>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 14, marginBottom: 6 }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{ width: '100%' }}
                required
              />
            </div>
          </>
        ) : (
          <>
            <p style={{ marginTop: 0 }}>
              For security, please set a new password (minimum 8 characters).
            </p>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 14, marginBottom: 6 }}>New password</label>
              <input
                type="password"
                value={pw1}
                onChange={e => setPw1(e.target.value)}
                style={{ width: '100%' }}
                required
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 14, marginBottom: 6 }}>Confirm password</label>
              <input
                type="password"
                value={pw2}
                onChange={e => setPw2(e.target.value)}
                style={{ width: '100%' }}
                required
              />
            </div>
          </>
        )}

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button type="button" onClick={onCancel}>Cancel</button>
          <button type="submit" disabled={!canSubmit}>
            {isReset ? 'Send Link' : 'Update'}
          </button>
        </div>
      </form>
    </div>
  );
}
