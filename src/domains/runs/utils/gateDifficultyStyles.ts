import type { GateDifficulty } from "~/domains/runs/models/httpGate";

export const DIFFICULTY_COLORS: Record<
	GateDifficulty,
	{ border: string; text: string; bg: string }
> = {
	easy: { border: "border-celadon", text: "text-celadon", bg: "bg-celadon/15" },
	normal: {
		border: "border-saffron",
		text: "text-saffron",
		bg: "bg-saffron/15",
	},
	hard: {
		border: "border-cinnabar",
		text: "text-cinnabar",
		bg: "bg-cinnabar/15",
	},
	intense: {
		border: "border-lavender",
		text: "text-lavender",
		bg: "bg-lavender/15",
	},
};

export const getGateDifficultyBorderClass = (
	difficulty: GateDifficulty
): string => DIFFICULTY_COLORS[difficulty].border;
