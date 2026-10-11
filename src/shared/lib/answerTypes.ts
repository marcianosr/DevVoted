export const ANSWER_TYPES = ["single", "multiple", "pairs"] as const;
export type AnswerType = (typeof ANSWER_TYPES)[number];

export const MIN_PAIRS = 4;
export const MAX_PAIRS = 6;
export const PAIR_SIZE = 2;
