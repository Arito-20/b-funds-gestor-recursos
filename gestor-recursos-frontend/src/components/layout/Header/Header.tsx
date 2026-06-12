import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { DEMO_USERS } from '../../../types';
import UserProfile from '../UserProfile/UserProfile';
import './Header.css';

const PAGE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/resources': 'Recursos',
  '/purchase-orders': 'Órdenes de Compra',
};

export default function Header() {
  const location = useLocation();
  const [currentUserKey, setCurrentUserKey] = useState(
    localStorage.getItem('demoUser') || 'manager-peru'
  );
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showAvatarTooltip, setShowAvatarTooltip] = useState(false);
  const [showDemoTooltip, setShowDemoTooltip] = useState(false);

  const user = DEMO_USERS.find(u => u.key === currentUserKey) ?? DEMO_USERS[0];
  const pageTitle = PAGE_TITLES[location.pathname] ?? 'B-Funds';

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    localStorage.setItem('demoUser', e.target.value);
    setCurrentUserKey(e.target.value);
    window.location.reload();
  };

  return (
    <>
      <header className="header">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-[#6b7280]">B-Funds</span>
          <span className="text-[#d8b4fe]">/</span>
          <span className="font-semibold text-[#1f2937]">{pageTitle}</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="header-status-dot" />
            <span className="text-xs text-[#6b7280] hidden sm:inline">Sistema operativo</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#6b7280] hidden md:inline">Usuario demo:</span>
            <select value={currentUserKey} onChange={handleChange} className="header-select">
              {DEMO_USERS.map(u => (
                <option key={u.key} value={u.key}>{u.name}</option>
              ))}
            </select>
            <div
              className="header-demo-info"
              onMouseEnter={() => setShowDemoTooltip(true)}
              onMouseLeave={() => setShowDemoTooltip(false)}
            >
              <span className="header-demo-info-icon" aria-label="Información sobre modo demo">ⓘ</span>
              {showDemoTooltip && (
                <div className="header-demo-info-tooltip">
                  Modo demo: cambia el usuario para simular diferentes roles.
                  En producción se usa SSO con Microsoft Azure AD.
                </div>
              )}
            </div>
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
