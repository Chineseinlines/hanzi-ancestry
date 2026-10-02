/**
 * GF 0025—2021《国际中文教育中文水平等级标准》达标图谱。
 * 将练习成绩估算映射到"三等九级"（初等一—三级 / 中等四—六级 / 高等七—九级）。
 * 高等语言量化指标不再按级细分，故七—九级合并为一个节点。
 */

import type { UserStats } from './database';

export type Band = 'elementary' | 'intermediate' | 'advanced';

export interface GfNode {
  /** 1—6 为具体级别；7 代表高等七—九级 */
  level: number;
  /** 该级累计汉字量化指标 */
  target: number;
  band: Band;
}

export interface ProficiencyDimension {
  key: 'accuracy' | 'volume' | 'breadth';
  value: number;
}

export interface ProficiencyResult {
  /** 达标指数 0—100 */
  score: number;
  /** 当前等级 1—7 */
  level: number;
  band: Band;
  hasData: boolean;
  nodes: Array<GfNode & { achieved: boolean }>;
  dimensions: ProficiencyDimension[];
  next: { level: number; remaining: number } | null;
}

/** GF 0025—2021 语言量化指标（汉字累计数）。 */
export const GF_NODES: GfNode[] = [
  { level: 1, target: 300, band: 'elementary' },
  { level: 2, target: 600, band: 'elementary' },
  { level: 3, target: 900, band: 'elementary' },
  { level: 4, target: 1200, band: 'intermediate' },
  { level: 5, target: 1500, band: 'intermediate' },
  { level: 6, target: 1800, band: 'intermediate' },
  { level: 7, target: 3000, band: 'advanced' },
];

/** 各级达标指数下限，索引 0—6 对应 level 1—7。 */
const LEVEL_MIN_SCORE = [0, 25, 38, 50, 62, 74, 87];
/** 练习量与学习广度视为满分的参考值。 */
const FULL_ATTEMPTS = 40;
const FULL_BREADTH = 300;
/** 达到该练习次数后，正确率才被完全采信。 */
const CONFIDENCE_ATTEMPTS = 5;

export function bandForLevel(level: number): Band {
  if (level >= 7) return 'advanced';
  if (level >= 4) return 'intermediate';
  return 'elementary';
}

export function levelForScore(score: number): number {
  let level = 1;
  for (let i = 0; i < LEVEL_MIN_SCORE.length; i++) {
    if (score >= LEVEL_MIN_SCORE[i]) level = i + 1;
  }
  return level;
}

export function computeProficiency(stats: UserStats): ProficiencyResult {
  const active = Object.values(stats.byType).filter((x) => x.attempts > 0);
  const totalWeight = active.reduce((s, x) => s + x.attempts, 0);
  const accuracy =
    totalWeight > 0
      ? active.reduce((s, x) => s + x.averageScore * x.attempts, 0) / totalWeight
      : 0;

  // 练习次数过少时降低正确率的权重，避免"一次满分即高等级"。
  const confidence = Math.min(1, stats.totalAttempts / CONFIDENCE_ATTEMPTS);
  const accuracyEff = accuracy * confidence;
  const volume = Math.min(100, (stats.totalAttempts / FULL_ATTEMPTS) * 100);
  const breadth = Math.min(100, (stats.uniqueCharsViewed / FULL_BREADTH) * 100);

  const score = Math.round(accuracyEff * 0.6 + volume * 0.25 + breadth * 0.15);
  const level = levelForScore(score);
  const next =
    level < GF_NODES.length
      ? { level: GF_NODES[level].level, remaining: Math.max(0, LEVEL_MIN_SCORE[level] - score) }
      : null;

  return {
    score,
    level,
    band: bandForLevel(level),
    hasData: stats.totalAttempts > 0,
    nodes: GF_NODES.map((n) => ({ ...n, achieved: n.level <= level })),
    dimensions: [
      { key: 'accuracy', value: Math.round(accuracy) },
      { key: 'volume', value: Math.round(volume) },
      { key: 'breadth', value: Math.round(breadth) },
    ],
    next,
  };
}