import { useState } from 'react';
import { Modal } from './Modal';
import './AuthModal.css';

type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (email: string, password: string) => boolean;
  onRegister: (name: string, email: string, password: string) => boolean;
  error?: string | null;
};

type AuthMode = 'login' | 'register';

export function AuthModal({ isOpen, onClose, onLogin, onRegister, error }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = () => {
    const ok = mode === 'login'
      ? onLogin(email, password)
      : onRegister(name, email, password);
    if (ok) {
      resetForm();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={mode === 'login' ? 'Log In' : 'Register'}>
      <div className="auth-modal">
        <div className="auth-toggle">
          <button
            type="button"
            className={mode === 'login' ? 'active' : ''}
            onClick={() => setMode('login')}
          >
            Log In
          </button>
          <button
            type="button"
            className={mode === 'register' ? 'active' : ''}
            onClick={() => setMode('register')}
          >
            Register
          </button>
        </div>
        {mode === 'register' && (
          <label className="auth-field">
            Name
            <input
              type="text"
              value={name}
              onChange={event => setName(event.target.value)}
              placeholder="Your name"
            />
          </label>
        )}
        <label className="auth-field">
          Email
          <input
            type="email"
            value={email}
            onChange={event => setEmail(event.target.value)}
            placeholder="you@example.com"
          />
        </label>
        <label className="auth-field">
          Password
          <input
            type="password"
            value={password}
            onChange={event => setPassword(event.target.value)}
            placeholder="At least 6 characters"
          />
        </label>
        <div className="auth-actions">
          <button type="button" className="auth-secondary" onClick={handleClose}>
            Cancel
          </button>
          <button type="button" className="auth-primary" onClick={handleSubmit}>
            {mode === 'login' ? 'Log In' : 'Create Account'}
          </button>
        </div>
        {error && <div className="auth-error">{error}</div>}
        <div className="auth-hint">
          {mode === 'login'
            ? 'New here? Register to create an account.'
            : 'Already have an account? Switch to Log In.'}
        </div>
      </div>
    </Modal>
  );
}
