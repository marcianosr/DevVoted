import { CATEGORY_METADATA } from "~/shared/lib/categories";
import type {
	GateTypeId,
	PipelineSlotRequirement,
} from "~/domains/runs/models/pipeline.model";

export const formatRequirement = (
	req: PipelineSlotRequirement,
	windowSize?: number
): string => {
	switch (req.type) {
		case "coverage-gain":
			return `Gain ${req.threshold}% coverage`;

		case "correct-answers": {
			const countStr = windowSize
				? `${req.count}/${windowSize}`
				: `${req.count}`;
			return req.streakRequired
				? `${countStr} correct (streak ×${req.streakRequired})`
				: `${countStr} correct`;
		}

		case "short-window":
			if (req.correctRequired)
				return `${req.pollCount} polls, ${req.correctRequired}/${req.pollCount} correct`;
			return `${req.pollCount} polls`;

		case "cold-start":
			return req.count === 1
				? "First poll must be correct"
				: `First ${req.count} polls must be correct`;

		case "category-mastery": {
			const name = CATEGORY_METADATA[req.category].name;
			return req.minCorrect === null
				? `All ${name} polls correct`
				: `≥${req.minCorrect} ${name} correct (or all, if fewer)`;
		}
	}
};

const SLOT_LABELS: Record<GateTypeId, string> = {
	"coverage-gain": "Coverage gain pipeline",
	"correct-answers": "Correct answer pipeline",
	"short-window": "Short window pipeline",
	"cold-start": "Cold start pipeline",
	"category-mastery": "Category mastery pipeline",
};

export const getSlotLabel = (gateTypeId: GateTypeId): string =>
	SLOT_LABELS[gateTypeId];
