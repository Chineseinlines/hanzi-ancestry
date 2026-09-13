/**
 * English companion descriptions for phoneticLevels.ts
 *
 * Key = PhoneticLevel (1–6), value = English translation of the level description.
 * Display-only strings — no computation depends on them.
 */

export const PHONETIC_LEVEL_DESCRIPTIONS_EN: Record<string, string> = {
  '1': 'The character is pronounced exactly as its phonetic component is, tone included.',
  '2': 'The character has the same syllable as its phonetic component but a different tone.',
  '3': 'The character has the same final as its phonetic component but a different initial.',
  '4': 'The character has the same initial as its phonetic component but a different final.',
  '5': 'The character is pronounced quite differently from its phonetic component.',
  '6': 'Either the character or its phonetic component has more than one pronunciation.',
};
