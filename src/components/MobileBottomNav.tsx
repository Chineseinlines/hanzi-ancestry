import { Link, useLocation } from 'react-router-dom';
import { Home, Compass, BookOpen, Gamepad2, User } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function MobileBottomNav() {
  const location = useLocation();
  const { t } = useLanguage();

  const tabs = [
    { key: 'home', path: '/', icon: Home, labelKey: 'nav.home' },
    { key: 'explore', path: '/explore', icon: Compass, labelKey: 'nav.explore' },
    { key: 'learn', path: '/learn', icon: BookOpen, labelKey: 'nav.learn' },
    { key: 'games', path: '/games', icon: Gamepad2, labelKey: 'nav.games' },
    { key: 'profile', path: '/profile', icon: User, labelKey: 'nav.profile' },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t pb-safe md:hidden"
      style={{
        backgroundColor: 'rgba(245, 240, 232, 0.97)',
        backdropFilter: 'blur(12px)',
        borderColor: 'var(--border-light)',
      }}
      aria-label="Primary"
    >
      <div className="grid grid-cols-5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive =
            tab.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(tab.path);
          return (
            <Link
              key={tab.key}
              to={tab.path}
              className="flex flex-col items-center justify-center gap-1 py-2"
              style={{
                color: isActive ? '#C23B2A' : 'rgba(61,61,59,0.72)',
                minHeight: '56px',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              <Icon size={22} strokeWidth={isActive ? 2.4 : 1.8} />
              <span className="text-[11px] font-medium leading-none">{t(tab.labelKey)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}