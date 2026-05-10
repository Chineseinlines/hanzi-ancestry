import { Link } from 'react-router-dom';
import { Github } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-ink-black text-rice-paper/70">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          {/* Column 1: Logo + tagline */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <span className="font-display-cn text-2xl text-rice-paper">字源</span>
              <span className="text-[0.625rem] font-semibold uppercase tracking-[0.15em] text-rice-paper/60">
                Hanzi Ancestry
              </span>
            </div>
            <p className="text-sm leading-relaxed text-rice-paper/50">
              Unveiling the architecture of Chinese characters through interactive
              decomposition and etymological exploration.
            </p>
          </div>

          {/* Column 2: Navigation */}
          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.1em] text-rice-paper/40">
              Navigation
            </h4>
            <div className="flex flex-col gap-2">
              <Link
                to="/"
                className="text-sm text-rice-paper/60 transition-colors duration-200 hover:text-rice-paper"
              >
                Home
              </Link>
              <Link
                to="/explore"
                className="text-sm text-rice-paper/60 transition-colors duration-200 hover:text-rice-paper"
              >
                Explore
              </Link>
              <Link
                to="/about"
                className="text-sm text-rice-paper/60 transition-colors duration-200 hover:text-rice-paper"
              >
                About
              </Link>
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
              Data
            </h4>
            <p className="text-sm leading-relaxed text-rice-paper/50">
              Data from{' '}
              <a
                href="https://github.com/skishore/makemeahanzi"
                target="_blank"
                rel="noopener noreferrer"
                className="text-rice-paper/70 underline underline-offset-2 transition-colors duration-200 hover:text-rice-paper"
              >
                Make Me A Hanzi
              </a>
              {' · '}
              1,111 characters with full decomposition data.
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 border-t border-rice-paper/10 pt-6 text-center">
          <p className="text-xs text-rice-paper/40">
            &copy; {new Date().getFullYear()} Hanzi Ancestry. Built with care for the love of characters.
          </p>
        </div>
      </div>
    </footer>
  );
}
