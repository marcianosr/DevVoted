export const SLICE_WINDOW = 5;
export const CLIMB_BASE_REQUIREMENT = 1;
export const VICTORY_GATE = 5;
export const SPEED_MS = 4000;

export const escalation = (gatesCleared: number): number =>
	Math.floor(gatesCleared / 2);

export const dropCount = (gatesCleared: number): number =>
	1 + Math.floor(gatesCleared / 2);
