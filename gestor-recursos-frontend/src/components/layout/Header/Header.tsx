import { useState } from 'react';
import { DEMO_USERS } from '../../../types';
import UserProfile from '../UserProfile/UserProfile';
import './Header.css';

export default function Header() {
  const [currentUserKey, setCurrentUserKey] = useState(
    localStorage.getItem('demoUser') || 'manager-peru'
  );
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showAvatarTooltip, setShowAvatarTooltip] = useState(false);

  const user = DEMO_USERS.find(u => u.key === currentUserKey) ?? DEMO_USERS[0];

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    localStorage.setItem('demoUser', e.target.value);
    setCurrentUserKey(e.target.value);
    window.location.reload();
  };

  return (
    <>
      <header className="header">
        <div className="header-actions">
          <div className="header-user-select">
            <span className="header-user-select__label">Usuario demo:</span>
            <select value={currentUserKey} onChange={handleChange} className="header-select">
              {DEMO_USERS.map(u => (
                <option key={u.key} value={u.key}>{u.name}</option>
              ))}
            </select>
          </div>

          <div
            className="header-avatar-wrapper"
            onMouseEnter={() => setShowAvatarTooltip(true)}
            onMouseLeave={() => setShowAvatarTooltip(false)}
          >
            <button
              type="button"
              onClick={() => setIsProfileOpen(true)}
              className="header-avatar"
              aria-label="Abrir perfil de usuario"
            >
              {user.avatar}
            </button>
            {showAvatarTooltip && (
              <div className="header-avatar-tooltip">
                <p className="font-semibold text-[#1f2937]">{user.name}</p>
                <p className="text-xs text-[#6b7280]">{user.email}</p>
              </div>
            )}
          </div>
        </div>
      </header>

      <UserProfile
        open={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={user}
        onUserChange={setCurrentUserKey}
      />
    </>
  );
}
