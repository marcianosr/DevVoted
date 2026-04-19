import type {
	GateTypeId,
	PipelineSlotRequirement,
} from "~/domains/runs/models/pipeline";

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
	}
};

const SLOT_LABELS: Record<GateTypeId, string> = {
	"coverage-gain": "Coverage gain pipeline",
	"correct-answers": "Correct answer pipeline",
	"short-window": "Short window pipeline",
};

export const getSlotLabel = (gateTypeId: GateTypeId): string =>
	SLOT_LABELS[gateTypeId];
