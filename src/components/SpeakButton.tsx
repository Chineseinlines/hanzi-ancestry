import { useCallback, useEffect, useRef, useState } from 'react';
import { Volume2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface SpeakButtonProps {
  text: string;
  lang?: 'zh-CN' | 'en-US';
  size?: number;
  className?: string;
  /** 深色背景下使用浅色描边 */
  onDark?: boolean;
  title?: string;
}

/** Web Speech API 朗读按钮：浏览器内建 TTS，零网络依赖。 */
export default function SpeakButton({ text, lang, size = 14, className = '', onDark = false, title }: SpeakButtonProps) {
  const { lang: uiLang } = useLanguage();
  const [supported, setSupported] = useState(true);
  const [speaking, setSpeaking] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    setSupported(typeof window !== 'undefined' && 'speechSynthesis' in window);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  const speak = useCallback(() => {
    if (!('speechSynthesis' in window) || !text) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = lang ?? (uiLang === 'en' ? 'en-US' : 'zh-CN');
    utter.rate = 0.9;
    const voices = window.speechSynthesis.getVoices();
    const match = voices.find((v) => v.lang.replace('_', '-').toLowerCase().startsWith(utter.lang.slice(0, 2).toLowerCase()));
    if (match) utter.voice = match;
    setSpeaking(true);
    utter.onend = () => setSpeaking(false);
    utter.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utter);
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setSpeaking(false), 4000);
  }, [text, lang, uiLang]);

  if (!supported) return null;

  return (
    <button
      type="button"
      onClick={speak}
      aria-label={title ?? text}
      title={title ?? text}
      className={`inline-flex items-center justify-center rounded-full transition-all hover:scale-110 ${speaking ? 'animate-pulse' : ''} ${className}`}
      style={{
        width: size + 12,
        height: size + 12,
        background: onDark ? 'rgba(245,240,232,0.12)' : 'rgba(194,59,42,0.1)',
        color: onDark ? '#F5F0E8' : '#C23B2A',
        border: `1px solid ${onDark ? 'rgba(245,240,232,0.2)' : 'rgba(194,59,42,0.25)'}`,
      }}
    >
      <Volume2 size={size} />
    </button>
  );
}
