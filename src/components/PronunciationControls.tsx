import SpeakButton from './SpeakButton';
import { useLanguage } from '../contexts/LanguageContext';

interface PronunciationControlsProps {
  text: string;
  onDark?: boolean;
  size?: number;
  className?: string;
}

/** 汉字听辨控件：提供常速与慢速普通话播放，帮助学习者辨听声调。 */
export default function PronunciationControls({
  text,
  onDark = false,
  size = 15,
  className = '',
}: PronunciationControlsProps) {
  const { t } = useLanguage();
  const labelColor = onDark ? 'rgba(245,240,232,0.62)' : '#8B6914';

  return (
    <div className={`inline-flex items-center gap-2 rounded-full px-2 py-1 ${className}`} aria-label={t('pronunciation.controls')}>
      <span className="text-[0.6875rem] font-medium" style={{ color: labelColor, fontFamily: 'Inter, sans-serif' }}>
        {t('pronunciation.normal')}
      </span>
      <SpeakButton text={text} lang="zh-CN" rate={0.9} size={size} onDark={onDark} title={t('pronunciation.playNormal')} />
      <span className="h-4 w-px" style={{ background: onDark ? 'rgba(245,240,232,0.18)' : 'rgba(26,26,24,0.1)' }} />
      <span className="text-[0.6875rem] font-medium" style={{ color: labelColor, fontFamily: 'Inter, sans-serif' }}>
        {t('pronunciation.slow')}
      </span>
      <SpeakButton text={text} lang="zh-CN" rate={0.55} size={size} onDark={onDark} title={t('pronunciation.playSlow')} />
    </div>
  );
}
