import { motion } from 'framer-motion';
import { ExternalLink, ShieldCheck, BookOpen, Database, Image as ImageIcon, Type, BarChart3 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { setPageMeta } from '../lib/seo';
import { useEffect } from 'react';

interface SourceEntry {
  icon: 'data' | 'dict' | 'glyph' | 'font' | 'stats' | 'book';
  name: string;
  nameEn: string;
  usage: string;
  usageEn: string;
  license: string;
  licenseEn: string;
  url: string;
}

const SOURCES: SourceEntry[] = [
  {
    icon: 'data',
    name: 'Make Me A Hanzi',
    nameEn: 'Make Me A Hanzi',
    usage: '汉字拆解树与构件序列（4,597 字全量 IDS）',
    usageEn: 'Decomposition trees & IDS sequences (4,597 chars)',
    license: 'LGPL-3.0（数据）/ Arphic Public License（字形）',
    licenseEn: 'LGPL-3.0 (data) / Arphic Public License (glyphs)',
    url: 'https://github.com/skishore/makemeahanzi',
  },
  {
    icon: 'data',
    name: 'CHISE IDS Find',
    nameEn: 'CHISE IDS Find',
    usage: '扩展构件序列（CJK 统一表意文字 IDS 数据）',
    usageEn: 'Extended IDS data for CJK Unified Ideographs',
    license: '开放数据（CHISE 项目发布）',
    licenseEn: 'Open data (published by the CHISE project)',
    url: 'https://www.chise.org/',
  },
  {
    icon: 'dict',
    name: 'CC-CEDICT',
    nameEn: 'CC-CEDICT',
    usage: '英文释义、拼音与词条检索',
    usageEn: 'English definitions, pinyin & word search',
    license: 'CC BY-SA 4.0',
    licenseEn: 'CC BY-SA 4.0',
    url: 'https://www.mdbg.net/chinese/dictionary?page=cc-cedict',
  },
  {
    icon: 'dict',
    name: '汉典（字形图片）',
    nameEn: 'Zdic.net (glyph images)',
    usage: '甲骨文、金文、大篆、小篆历史字形 SVG',
    usageEn: 'Oracle bone / bronze / large seal / seal glyph SVGs',
    license: '仅供学习参考，权利归汉典及原权利人',
    licenseEn: 'Educational reference only; rights reserved by Zdic and original holders',
    url: 'https://www.zdic.net/',
  },
  {
    icon: 'font',
    name: '王汉宗隶书体',
    nameEn: 'HanWang LiSu Medium',
    usage: '隶书阶段字形（本站离线渲染为 SVG）',
    usageEn: 'Clerical-stage glyphs (rendered to SVG offline by this site)',
    license: 'GNU GPL v2（王汉宗自由字型，王漢宗教授捐贈）',
    licenseEn: 'GNU GPL v2 (H.T. Wang Free Fonts, donated by Prof. Hann-Tzong Wang)',
    url: 'https://github.com/dictcp-snapshot/wangfonts',
  },
  {
    icon: 'dict',
    name: '《说文解字》',
    nameEn: 'Shuowen Jiezi',
    usage: '许慎原文、六书归类、结构描述（公有领域古籍文本）',
    usageEn: 'Original text, Six Scripts classification & structure notes (public domain)',
    license: '古籍原文属公有领域；白话摘要为本站编写',
    licenseEn: 'Original text in public domain; vernacular summaries by this site',
    url: 'https://ctext.org/shuowen-jiezi',
  },
  {
    icon: 'font',
    name: 'hanzi-writer-data',
    nameEn: 'hanzi-writer-data',
    usage: '楷书笔顺动画与笔画中线数据',
    usageEn: 'Stroke order animation & median data',
    license: 'Arphic Public License（衍生自 Make Me A Hanzi）',
    licenseEn: 'Arphic Public License (derived from Make Me A Hanzi)',
    url: 'https://github.com/chanind/hanzi-writer-data',
  },
  {
    icon: 'stats',
    name: 'HSK 分级字表（HSK 3.0 / HSK 2.0）',
    nameEn: 'HSK graded char lists (HSK 3.0 / 2.0)',
    usage: '《国际中文教育中文水平等级标准》(GF0025-2021) 三等九级与旧版 HSK 1-6 分级标记',
    usageEn: 'GF0025-2021 nine-level & legacy HSK 1-6 level badges',
    license: '依据官方标准整理的开放数据集（@leonsilicon）',
    licenseEn: 'Open dataset compiled from the official standard (@leonsilicon)',
    url: 'https://github.com/leonsilicon/hsk3.0',
  },
  {
    icon: 'stats',
    name: 'Jun Da 现代汉字字频表',
    nameEn: 'Jun Da Modern Chinese Character Frequency List',
    usage: '现代语料频序徽标（9,933 字排名）',
    usageEn: 'Modern corpus frequency badges (9,933-char ranking)',
    license: '学术公开数据（Middle Tennessee State University）',
    licenseEn: 'Academic open data (Middle Tennessee State University)',
    url: 'https://lingua.mtsu.edu/chinese-computing/statistics/',
  },
  {
    icon: 'book',
    name: '本站原创内容',
    nameEn: 'Original content by this site',
    usage: '中文释义、文化典故、简繁溯源解说、部件注解、形声层级与语义层级评级',
    usageEn: 'Chinese definitions, cultural notes, simp/trad origins, component annotations, phono-semantic level ratings',
    license: '本站创作，如引用请注明出处',
    licenseEn: 'Created by this site; please attribute when citing',
    url: '',
  },
];

const ICONS = {
  data: Database,
  dict: BookOpen,
  glyph: ImageIcon,
  font: Type,
  stats: BarChart3,
} as const;

const BAND_COLORS: Record<string, string> = {
  zh: '#8B6914',
  en: '#8B6914',
};

export default function Sources() {
  const { lang, t } = useLanguage();

  useEffect(() => {
    setPageMeta({
      title: `${t('sources.title')} · ${lang === 'zh' ? '字里行间' : 'LINES'}`,
      description: t('sources.intro'),
    });
  }, [lang, t]);

  return (
    <div className="min-h-screen pb-20" style={{ background: '#F5F0E8' }}>
      <section className="px-4 pt-16 pb-10" style={{ background: 'linear-gradient(180deg, #1A1A18 0%, #2D2D2B 100%)' }}>
        <div className="max-w-4xl mx-auto text-center">
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-5 text-xs font-semibold uppercase tracking-wider"
            style={{ background: 'rgba(196,162,101,0.15)', color: '#C4A265', fontFamily: 'Inter' }}
          >
            <ShieldCheck size={14} />
            {t('sources.badge')}
          </div>
          <h1
            className="text-3xl sm:text-4xl font-bold mb-4"
            style={{ color: '#F5F0E8', fontFamily: lang === 'zh' ? '"Ma Shan Zheng", cursive' : '"Playfair Display", serif' }}
          >
            {t('sources.title')}
          </h1>
          <p className="max-w-2xl mx-auto text-sm leading-relaxed" style={{ color: 'rgba(245,240,232,0.7)', fontFamily: 'Inter' }}>
            {t('sources.intro')}
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 -mt-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl overflow-hidden"
          style={{ background: '#FDFBF6', boxShadow: '0 4px 24px rgba(26,26,24,0.08)' }}
        >
          {/* Desktop table header */}
          <div className="hidden md:grid grid-cols-[1.2fr_2fr_1.4fr] gap-4 px-6 py-3.5" style={{ background: '#1A1A18' }}>
            {['sources.colSource', 'sources.colUsage', 'sources.colLicense'].map((k) => (
              <span key={k} className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#C4A265', fontFamily: 'Inter' }}>
                {t(k)}
              </span>
            ))}
          </div>

          {SOURCES.map((s, i) => {
            const Icon = ICONS[s.icon as keyof typeof ICONS] ?? BookOpen;
            const name = lang === 'zh' ? s.name : s.nameEn;
            const usage = lang === 'zh' ? s.usage : s.usageEn;
            const license = lang === 'zh' ? s.license : s.licenseEn;
            return (
              <div
                key={s.name}
                className="md:grid md:grid-cols-[1.2fr_2fr_1.4fr] md:gap-4 px-6 py-4 flex flex-col gap-2"
                style={{ borderTop: i === 0 ? 'none' : '1px solid rgba(26,26,24,0.08)' }}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="flex items-center justify-center rounded-lg w-8 h-8 flex-shrink-0"
                    style={{ background: 'rgba(194,59,42,0.08)' }}
                  >
                    <Icon size={16} style={{ color: '#C23B2A' }} />
                  </div>
                  {s.url ? (
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold hover:underline inline-flex items-center gap-1"
                      style={{ color: '#1A1A18', fontFamily: 'Inter' }}
                    >
                      {name}
                      <ExternalLink size={11} style={{ color: BAND_COLORS[lang] }} />
                    </a>
                  ) : (
                    <span className="text-sm font-semibold" style={{ color: '#1A1A18', fontFamily: 'Inter' }}>
                      {name}
                    </span>
                  )}
                </div>
                <p className="text-[0.8125rem] leading-relaxed" style={{ color: '#3D3D3B', fontFamily: 'Inter' }}>
                  {usage}
                </p>
                <p className="text-xs leading-relaxed" style={{ color: '#8B6914', fontFamily: 'Inter' }}>
                  {license}
                </p>
              </div>
            );
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mt-5 rounded-2xl px-6 py-5"
          style={{ background: 'rgba(107,127,94,0.08)', border: '1px solid rgba(107,127,94,0.2)' }}
        >
          <p className="text-[0.8125rem] leading-relaxed" style={{ color: '#3D3D3B', fontFamily: 'Inter' }}>
            {t('sources.disclaimer')}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
