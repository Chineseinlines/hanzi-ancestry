import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import { translate, type Locale } from '../i18n';

interface LanguageContextType {
  lang: Locale;
  setLang: (l: Locale) => void;
  toggle: () => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

const STORAGE_KEY = 'hanzi-locale';

/** 懒初始化：localStorage 优先，否则跟随浏览器语言（中文浏览器→zh，其他→en）。 */
function loadInitialLang(): Locale {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'zh' || saved === 'en') return saved;
  } catch {
    /* localStorage 不可用时忽略 */
  }
  try {
    return navigator.language?.toLowerCase().startsWith('zh') ? 'zh' : 'en';
  } catch {
    return 'zh';
  }
}

function persist(lang: Locale) {
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    /* ignore */
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Locale>(loadInitialLang);

  useEffect(() => {
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  }, [lang]);

  const setLang = useCallback((l: Locale) => {
    setLangState(l);
    persist(l);
  }, []);

  const toggle = useCallback(() => {
    setLangState((prev) => {
      const next = prev === 'zh' ? 'en' : 'zh';
      persist(next);
      return next;
    });
  }, []);

  const t = useMemo(
    () => (key: string, params?: Record<string, string | number>) => translate(lang, key, params),
    [lang],
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggle, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
