export const ANSWER_TYPES = ["single", "multiple", "grid"] as const;
export type AnswerType = (typeof ANSWER_TYPES)[number];

export const GRID_GROUPS = 3;
export const GRID_GROUP_SIZE = 4;
export const GRID_TILES = GRID_GROUPS * GRID_GROUP_SIZE;
