import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  cardState,
  loadStore,
  newCard,
  saveStore,
  schedule,
  type Grade,
  type SrsStore,
} from '../lib/srs';

export interface SrsStats {
  total: number;
  /** 已到期、需立即复习 */
  due: number;
  /** 已排程、尚未到期 */
  learning: number;
  /** 间隔 ≥21 天 */
  mastered: number;
  /** 从未复习 */
  fresh: number;
}

/** 单轮最多引入的新字数量，避免一次性涌入。 */
const NEW_PER_SESSION = 10;

/**
 * 生字本复习队列：以 localStorage 中的 SM-2 卡片状态为准，
 * 到期卡片优先，其次补充少量新字。
 */
export function useSrs(chars: string[]) {
  const [store, setStore] = useState<SrsStore>(loadStore);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    saveStore(store);
  }, [store]);

  const refresh = useCallback(() => setNow(Date.now()), []);

  const buildQueue = useCallback(
    (limitNew = NEW_PER_SESSION): string[] => {
      const t = Date.now();
      const due: string[] = [];
      const fresh: string[] = [];
      for (const c of chars) {
        const card = store[c];
        if (!card || card.last === 0) {
          fresh.push(c);
        } else if (card.due <= t) {
          due.push(c);
        }
      }
      due.sort((a, b) => (store[a]?.due ?? 0) - (store[b]?.due ?? 0));
      return [...due, ...fresh.slice(0, limitNew)];
    },
    [chars, store],
  );

  const grade = useCallback((char: string, g: Grade) => {
    setStore((prev) => {
      const card = prev[char] ?? newCard(char);
      return { ...prev, [char]: schedule(card, g) };
    });
  }, []);

  const reset = useCallback((char: string) => {
    setStore((prev) => {
      if (!(char in prev)) return prev;
      const next = { ...prev };
      delete next[char];
      return next;
    });
  }, []);

  const stats: SrsStats = useMemo(() => {
    let due = 0;
    let learning = 0;
    let mastered = 0;
    let fresh = 0;
    for (const c of chars) {
      const state = cardState(store[c], now);
      if (state === 'new') fresh++;
      else if (state === 'due') due++;
      else if (state === 'mastered') mastered++;
      else learning++;
    }
    return { total: chars.length, due, learning, mastered, fresh };
  }, [chars, store, now]);

  return { store, stats, buildQueue, grade, reset, refresh };
}