import { useEffect, useState } from 'react';
import type { AuthUser } from '../../engine/authStore';
import { Modal } from './Modal';
import './AccountModal.css';

type AccountModalProps = {
  isOpen: boolean;
  user: AuthUser;
  onClose: () => void;
  onUpdateName: (name: string) => void;
  onChangePassword: (currentPassword: string, nextPassword: string) => void;
  onDeleteAccount: (currentPassword: string) => void;
  error?: string | null;
  message?: string | null;
};

export function AccountModal({
  isOpen,
  user,
  onClose,
  onUpdateName,
  onChangePassword,
  onDeleteAccount,
  error,
  message,
}: AccountModalProps) {
  const [name, setName] = useState(user.name);
  const [currentPassword, setCurrentPassword] = useState('');
  const [nextPassword, setNextPassword] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [confirmDelete, setConfirmDelete] = useState('');

  useEffect(() => {
    if (isOpen) {
      setName(user.name);
    }
  }, [isOpen, user.name]);

  const handleClose = () => {
    setName(user.name);
    setCurrentPassword('');
    setNextPassword('');
    setDeletePassword('');
    setConfirmDelete('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Account">
      <div className="account-modal">
        <section className="account-section">
          <div className="account-section-title">Profile</div>
          <label className="account-field">
            Display name
            <input
              type="text"
              value={name}
              onChange={event => setName(event.target.value)}
            />
          </label>
          <label className="account-field">
            Email (read-only)
            <input type="email" value={user.email} disabled />
          </label>
          <button
            type="button"
            className="account-primary"
            onClick={() => onUpdateName(name)}
          >
            Save Profile
          </button>
        </section>

        <section className="account-section">
          <div className="account-section-title">Change Password</div>
          <label className="account-field">
            Current password
            <input
              type="password"
              value={currentPassword}
              onChange={event => setCurrentPassword(event.target.value)}
            />
          </label>
          <label className="account-field">
            New password
            <input
              type="password"
              value={nextPassword}
              onChange={event => setNextPassword(event.target.value)}
            />
          </label>
          <button
            type="button"
            className="account-secondary"
            onClick={() => {
              onChangePassword(currentPassword, nextPassword);
              setCurrentPassword('');
              setNextPassword('');
            }}
          >
            Update Password
          </button>
        </section>

        <section className="account-section account-danger">
          <div className="account-section-title">Delete Account</div>
          <label className="account-field">
            Current password
            <input
              type="password"
              value={deletePassword}
              onChange={event => setDeletePassword(event.target.value)}
            />
          </label>
          <label className="account-field">
            Type DELETE to confirm
            <input
              type="text"
              value={confirmDelete}
              onChange={event => setConfirmDelete(event.target.value)}
            />
          </label>
          <button
            type="button"
            className="account-danger-button"
            disabled={confirmDelete.trim().toUpperCase() !== 'DELETE'}
            onClick={() => {
              onDeleteAccount(deletePassword);
              setDeletePassword('');
              setConfirmDelete('');
            }}
          >
            Delete Account
          </button>
        </section>

        {message && <div className="account-message">{message}</div>}
        {error && <div className="account-error">{error}</div>}
      </div>
    </Modal>
  );
}
