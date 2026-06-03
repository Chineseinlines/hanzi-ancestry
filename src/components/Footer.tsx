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
              <span className="font-display-cn text-2xl text-rice-paper">字里行间</span>
              <span className="text-[0.625rem] font-semibold uppercase tracking-[0.15em] text-rice-paper/60">
                LINES
              </span>
            </div>
            <p className="text-sm leading-relaxed text-rice-paper/50">
              通过交互式拆解与词源探索，揭示汉字的内部架构。
            </p>
            <p className="text-xs leading-relaxed text-rice-paper/30 mt-1.5">
              Unveiling the architecture of Chinese characters through interactive
              decomposition and etymological exploration.
            </p>
          </div>

          {/* Column 2: Navigation */}
          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.1em] text-rice-paper/40">
              导航
            </h4>
            <div className="flex flex-col gap-2">
              <Link
                to="/"
                className="text-sm text-rice-paper/60 transition-colors duration-200 hover:text-rice-paper"
              >
                首页
              </Link>
              <Link
                to="/explore"
                className="text-sm text-rice-paper/60 transition-colors duration-200 hover:text-rice-paper"
              >
                探索
              </Link>
              <Link
                to="/learn"
                className="text-sm text-rice-paper/60 transition-colors duration-200 hover:text-rice-paper"
              >
                学习
              </Link>
              <Link
                to="/quiz"
                className="text-sm text-rice-paper/60 transition-colors duration-200 hover:text-rice-paper"
              >
                题库
              </Link>
              <Link
                to="/games"
                className="text-sm text-rice-paper/60 transition-colors duration-200 hover:text-rice-paper"
              >
                游戏
              </Link>
              <Link
                to="/about"
                className="text-sm text-rice-paper/60 transition-colors duration-200 hover:text-rice-paper"
              >
                关于
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
              数据来源
            </h4>
            <p className="text-sm leading-relaxed text-rice-paper/50">
              数据来自{' '}
              <a
                href="https://github.com/skishore/makemeahanzi"
                target="_blank"
                rel="noopener noreferrer"
                className="text-rice-paper/70 underline underline-offset-2 transition-colors duration-200 hover:text-rice-paper"
              >
                Make Me A Hanzi
              </a>
              {' · '}
              收录 1,111 个汉字的完整拆解数据。
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 border-t border-rice-paper/10 pt-6 text-center">
          <p className="text-xs text-rice-paper/40">
            &copy; {new Date().getFullYear()} 字里行间 LINES. 用心构建，为汉字之美。
          </p>
        </div>
      </div>
    </footer>
  );
}
