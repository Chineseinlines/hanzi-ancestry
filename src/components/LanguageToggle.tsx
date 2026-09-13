import { useLanguage } from '../contexts/LanguageContext';

/** 全局中/EN 语言切换分段控件（样式与简/繁拆法切换一致）。 */
export default function LanguageToggle() {
  const { lang, setLang, t } = useLanguage();

  return (
    <div
      className="flex items-center gap-1 rounded-lg p-0.5"
      style={{ background: 'rgba(245,240,232,0.8)', border: '1px solid rgba(26,26,24,0.08)' }}
      title={t('nav.language')}
    >
      <button
        onClick={() => setLang('zh')}
        aria-pressed={lang === 'zh'}
        aria-label="中文"
        className="rounded-md px-2.5 py-1 text-xs font-semibold transition-all"
        style={
          lang === 'zh'
            ? { background: '#1A1A18', color: '#F5F0E8' }
            : { background: 'transparent', color: '#8B6914' }
        }
      >
        中
      </button>
      <button
        onClick={() => setLang('en')}
        aria-pressed={lang === 'en'}
        aria-label="English"
        className="rounded-md px-2.5 py-1 text-xs font-semibold transition-all"
        style={
          lang === 'en'
            ? { background: '#1A1A18', color: '#F5F0E8' }
            : { background: 'transparent', color: '#8B6914' }
        }
      >
        EN
      </button>
    </div>
  );
}
