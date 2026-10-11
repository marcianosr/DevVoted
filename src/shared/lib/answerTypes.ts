export const ANSWER_TYPES = ["single", "multiple", "pairs"] as const;
export type AnswerType = (typeof ANSWER_TYPES)[number];

export const PAIRS = 4;
export const PAIR_SIZE = 2;
export const PAIR_TILES = PAIRS * PAIR_SIZE;
