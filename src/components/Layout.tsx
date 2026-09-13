import { useEffect, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { useLanguage } from '../contexts/LanguageContext';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const { t, lang } = useLanguage();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // 按路由 + 语言更新 document.title（缺失键回退 index.html 静态标题）
  useEffect(() => {
    const key = `titles.${location.pathname}`;
    const title = t(key);
    if (title !== key) document.title = title;
  }, [location.pathname, t, lang]);

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
