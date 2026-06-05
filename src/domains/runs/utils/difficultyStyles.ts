import type { GateDifficulty } from "~/domains/runs/models/pipeline.model";

export const DIFFICULTY_CLASSES: Record<GateDifficulty, string> = {
	low: "text-blue-400 border-blue-400",
	medium: "text-green-400 border-green-400",
	high: "text-orange-400 border-orange-400",
	critical: "text-red-500 border-red-500",
};
