import { useEffect, useRef } from 'react';
import { DEMO_USERS, type DemoUser } from '../../../types';
import './UserProfile.css';

interface UserProfileProps {
  open: boolean;
  onClose: () => void;
  user: DemoUser;
  onUserChange: (key: string) => void;
}

export default function UserProfile({ open, onClose, user, onUserChange }: UserProfileProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleSelectUser = (key: string) => {
    localStorage.setItem('demoUser', key);
    onUserChange(key);
    onClose();
    window.location.reload();
  };

  return (
    <>
      <div className="user-profile-overlay" onClick={handleOverlayClick} />
      <div ref={panelRef} className="user-profile-panel">
        <div className="user-profile-header">
          <button type="button" onClick={onClose} className="user-profile-close" aria-label="Cerrar">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="user-profile-avatar">{user.avatar}</div>
          <p className="user-profile-name">{user.name}</p>
          <p className="user-profile-email">{user.email}</p>
          <span className="user-profile-role-badge">{user.role}</span>
        </div>

        <div className="user-profile-body bfunds-scroll">
          <div className="user-profile-section">
            <p className="user-profile-section-title">Mi información</p>
            <div className="user-profile-info-row">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>País: {user.country}</span>
            </div>
            <div className="user-profile-info-row">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span>Área: {user.area}</span>
            </div>
            <div className="user-profile-info-row">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Rol: {user.role}</span>
            </div>
          </div>

          <div className="user-profile-section">
            <p className="user-profile-section-title">Sesión demo</p>
            <div className="user-profile-demo-box">
              <div className="flex items-start gap-3 mb-3">
                <svg width="20" height="20" viewBox="0 0 23 23" fill="none" className="shrink-0 mt-0.5">
                  <rect width="10" height="10" fill="#f25022" />
                  <rect x="12" width="10" height="10" fill="#7fba00" />
                  <rect y="12" width="10" height="10" fill="#00a4ef" />
                  <rect x="12" y="12" width="10" height="10" fill="#ffb900" />
                </svg>
                <p className="user-profile-demo-text">
                  Estás usando el modo demo. En producción B-Funds usa SSO con Microsoft Azure AD / Entra ID.
                </p>
              </div>
              <p className="user-profile-demo-note">
                Tu identidad corporativa se vincularía automáticamente con tu cuenta {user.email}
              </p>
            </div>
          </div>

          <div className="user-profile-section">
            <p className="user-profile-section-title">Cambiar usuario demo</p>
            {DEMO_USERS.map(u => (
              <button
                key={u.key}
                type="button"
                onClick={() => handleSelectUser(u.key)}
                className={`user-profile-user-btn ${u.key === user.key ? 'user-profile-user-btn--active' : ''}`}
              >
                <span className="font-medium">{u.name}</span>
                <span className="text-xs text-[#6b7280] block mt-0.5">{u.role} · {u.country}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="user-profile-footer">
          <p className="font-medium text-[#7c3aed]">B-Funds v1.0 · 2026</p>
          <p className="mt-1">Finance Platform Services · Belcorp</p>
        </div>
      </div>
    </>
  );
}
