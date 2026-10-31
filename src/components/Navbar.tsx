import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Menu, X } from 'lucide-react';
import { UserMenu } from './auth/UserMenu';
import LanguageToggle from './LanguageToggle';
import { useLanguage } from '../contexts/LanguageContext';

interface NavbarProps {
  onSearchClick?: () => void;
}

export default function Navbar({ onSearchClick }: NavbarProps) {
  const location = useLocation();
  const { t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { labelKey: 'nav.home', path: '/' },
    { labelKey: 'nav.explore', path: '/explore' },
    { labelKey: 'nav.learn', path: '/learn' },
    { labelKey: 'nav.quiz', path: '/quiz' },
    { labelKey: 'nav.games', path: '/games' },
    { labelKey: 'nav.studio', path: '/studio' },
    { labelKey: 'nav.about', path: '/about' },
  ];

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 pt-safe transition-all duration-300"
      style={{
        backgroundColor: scrolled
          ? 'rgba(245, 240, 232, 0.97)'
          : 'rgba(245, 240, 232, 0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-light)',
      }}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 no-underline">
          <img
            src={`${import.meta.env.BASE_URL}lines-logo.jpg`}
            alt="字里行间 LINES"
            className="h-9 w-auto rounded-md bg-white object-contain px-1.5 py-0.5 shadow-sm"
          />
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => {
            const isActive =
              link.path === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                className="group relative text-[0.875rem] font-medium uppercase tracking-[0.08em] text-charcoal transition-colors duration-200 hover:text-cinnabar"
              >
                {t(link.labelKey)}
                <span
                  className="absolute -bottom-1 left-0 h-0.5 bg-cinnabar transition-transform duration-300"
                  style={{
                    width: '100%',
                    transform: isActive ? 'scaleX(1)' : 'scaleX(0)',
                    transformOrigin: 'left',
                  }}
                />
                <span
                  className="absolute -bottom-1 left-0 h-0.5 w-full origin-left scale-x-0 bg-cinnabar transition-transform duration-300 group-hover:scale-x-100"
                />
              </Link>
            );
          })}
        </div>

        {/* Right side: search trigger + language toggle + user menu */}
        <div className="flex items-center gap-3">
          <button
            onClick={onSearchClick}
            className="flex h-9 w-9 items-center justify-center rounded-full text-charcoal transition-colors duration-200 hover:bg-ink-wash-light hover:text-cinnabar"
            aria-label="Search"
          >
            <Search size={18} />
          </button>
          <LanguageToggle />
          <UserMenu />

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-charcoal transition-colors duration-200 hover:bg-ink-wash-light md:hidden"
            aria-label="Menu"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-border-light bg-rice-paper px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className="text-sm font-medium uppercase tracking-[0.08em] text-charcoal transition-colors duration-200 hover:text-cinnabar"
              >
                {t(link.labelKey)}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
