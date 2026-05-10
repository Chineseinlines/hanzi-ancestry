/* ── Shared animation variants for About page sections ── */

export const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] },
  }),
};

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    transition: { duration: 0.5, delay, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] },
  }),
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, delay, ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number] },
  }),
};

export const brushReveal = {
  hidden: { clipPath: 'inset(0 100% 0 0)' },
  visible: (delay: number = 0) => ({
    clipPath: 'inset(0 0% 0 0)',
    transition: { duration: 1.2, delay, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  }),
};

export const staggerContainer = {
  hidden: {},
  visible: (stagger: number = 0.12) => ({
    transition: { staggerChildren: stagger },
  }),
};

export const viewportOnce = { once: true, amount: 0.15 as const };
