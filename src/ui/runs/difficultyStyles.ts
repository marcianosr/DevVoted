import type { GateDifficulty } from "~/domains/runs/models/pipeline.model";

export const DIFFICULTY_CLASSES: Record<GateDifficulty, string> = {
	low: "text-blue-400 border-blue-400",
	medium: "text-green-400 border-green-400",
	high: "text-orange-400 border-orange-400",
	critical: "text-red-500 border-red-500",
};

export const DIFFICULTY_BG: Record<GateDifficulty, string> = {
	low: "bg-blue-400",
	medium: "bg-green-400",
	high: "bg-orange-400",
	critical: "bg-red-500",
};

export const DIFFICULTY_LABEL: Record<GateDifficulty, string> = {
	low: "Low",
	medium: "Normal",
	high: "Hard",
	critical: "Critical",
};
