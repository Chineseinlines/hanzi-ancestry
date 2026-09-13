import { Link } from 'react-router-dom';
import { Github } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();
  const navLinks = [
    { labelKey: 'nav.home', path: '/' },
    { labelKey: 'nav.explore', path: '/explore' },
    { labelKey: 'nav.learn', path: '/learn' },
    { labelKey: 'nav.quiz', path: '/quiz' },
    { labelKey: 'nav.games', path: '/games' },
    { labelKey: 'nav.about', path: '/about' },
  ];

  return (
    <footer className="bg-ink-black text-rice-paper/70">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          {/* Column 1: Logo + tagline */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <span className="font-display-cn text-2xl text-rice-paper">字里行间</span>
              <span className="text-[0.625rem] font-semibold uppercase tracking-[0.15em] text-rice-paper/60">
                LINES
              </span>
            </div>
            <p className="text-sm leading-relaxed text-rice-paper/50">
              {t('footer.tagline')}
            </p>
          </div>

          {/* Column 2: Navigation */}
          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.1em] text-rice-paper/40">
              {t('footer.navHeading')}
            </h4>
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="text-sm text-rice-paper/60 transition-colors duration-200 hover:text-rice-paper"
                >
                  {t(link.labelKey)}
                </Link>
              ))}
              <a
                href="https://github.com/skishore/makemeahanzi"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-rice-paper/60 transition-colors duration-200 hover:text-rice-paper"
              >
                <Github size={14} />
                GitHub
              </a>
            </div>
          </div>

          {/* Column 3: Data attribution */}
          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.1em] text-rice-paper/40">
              {t('footer.dataHeading')}
            </h4>
            <p className="text-sm leading-relaxed text-rice-paper/50">
              {t('footer.dataFrom')}{' '}
              <a
                href="https://github.com/skishore/makemeahanzi"
                target="_blank"
                rel="noopener noreferrer"
                className="text-rice-paper/70 underline underline-offset-2 transition-colors duration-200 hover:text-rice-paper"
              >
                Make Me A Hanzi
              </a>
              {' · '}
              {t('footer.dataDesc')}
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 border-t border-rice-paper/10 pt-6 text-center">
          <p className="text-xs text-rice-paper/40">
            {t('footer.copyright', { year: new Date().getFullYear() })}
          </p>
        </div>
      </div>
    </footer>
  );
}
