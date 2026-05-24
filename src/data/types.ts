export interface EtymologyData {
  type: 'pictographic' | 'indicative' | 'ideographic' | 'pictophonetic';
  phonetic?: string;
  semantic?: string;
  hint?: string;
}

export interface HanziEntry {
  character: string;
  definition: string;
  pinyin: string[];
  leafComponents: string[];
  directComponents?: string[];
  radical: string;
  etymology?: EtymologyData;
  etymologyHint?: string;
  decomposition?: string;
  traditional?: string;
  traditionalComponents?: string[];
  simplified?: string[];
}

export interface DecompositionNode {
  character: string;
  decomposition: string;
  children: DecompositionNode[];
  isLeaf: boolean;
}

export interface GraphNode {
  id: string;
  character: string;
  type: 'core' | 'component' | 'cognate';
  definition?: string;
  pinyin?: string;
  radius?: number;
  x?: number;
  y?: number;
}

export interface GraphLink {
  source: string;
  target: string;
  type: 'decomposition' | 'cognate';
}

export interface CognateResult {
  character: string;
  definition: string;
  pinyin: string;
  sharedComponents: string[];
  score: number;
}

export interface ComponentCognateResult {
  character: string;
  definition: string;
  pinyin: string;
  score: number;
}

export interface StrokeData {
  strokes: string[];
  medians: number[][][];
}

export interface CulturalData {
  evolution: string;
  allusions: string[];
  words: string[];
}

export interface ShuowenEntry {
  char: string;
  shuowen: string;
  summary: string;
  structure: string;
  sixBooks: string;
}

export interface ScoredRelation {
  character: string;
  definition: string;
  pinyin: string;
  /** Overall weighted score (0-100) */
  totalScore: number;
  /** Form/structure dimension score */
  formScore: number;
  /** Sound/phonetic dimension score */
  soundScore: number;
  /** Meaning/semantic dimension score */
  meaningScore: number;
  /** Relation labels (e.g. "同声旁", "同形旁", "同音", "反义") */
  tags: string[];
}

export interface CharRelations {
  /** chars derived FROM this char (differentiation) */
  differentiations: string[];
  /** chars sharing the same phonetic component */
  phoneticFamily: string[];
  /** chars sharing the same semantic component */
  semanticFamily: string[];
  /** chars whose decomposition contains this char */
  containedIn: string[];
  /** chars with identical pinyin */
  homophones: string[];
  /** chars with same pinyin ignoring tone */
  nearHomophones: string[];
  /** antonym pairs */
  antonyms: string[];
  /** CJK components in this char's decomposition */
  components: string[];
  /** chars sharing the same radical */
  radicalFamily: string[];
  /** traditional form, if simplified */
  traditional: string | null;
  /** simplified form, if traditional */
  simplified: string | null;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export type GameMode = 'decompose' | 'assemble' | 'match';

export interface PuzzleRound {
  mode: GameMode;
  targetChar: string;
  components: string[];
  options: string[];
  correctAnswer: string | string[];
  points: number;
}

export interface GameState {
  score: number;
  streak: number;
  round: number;
  totalRounds: number;
  mode: GameMode | null;
  feedback: 'correct' | 'wrong' | null;
  correctAnswer: string | null;
}
