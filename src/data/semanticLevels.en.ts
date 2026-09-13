/**
 * English companion descriptions for semanticLevels.ts
 *
 * Key = SemanticLevel (1–8), value = English translation of the level description.
 * Display-only strings — no computation depends on them.
 */

export const SEMANTIC_LEVEL_DESCRIPTIONS_EN: Record<string, string> = {
  '1': 'The character and its semantic component have exactly the same meaning.',
  '2': 'What the character denotes belongs to the class of things denoted by its semantic component.',
  '3': 'The meaning of the character is directly related to the meaning of its semantic component.',
  '4': 'The meaning of the character is indirectly related to the meaning of its semantic component.',
  '5': 'The extended meaning of the character is directly related to the meaning of its semantic component.',
  '6': 'The extended meaning of the character is indirectly related to the meaning of its semantic component.',
  '7': 'The meaning of the character is unrelated to the meaning of its semantic component.',
  '8': 'The relation to the semantic component cannot be defined, whether because of simplification or for other reasons.',
};
