import { formatStorage } from "~/lib/storage";
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

		case "storage-drain":
			return `−${formatStorage(req.drainPerWrong)} per wrong answer`;

		case "disabled-config":
			return req.requiresRarePlus
				? `Disable ${req.count} rare+ config${req.count > 1 ? "s" : ""}`
				: `Disable ${req.count} config${req.count > 1 ? "s" : ""}`;

		case "short-window":
			if (req.correctRequired)
				return `${req.pollCount} polls, ${req.correctRequired}/${req.pollCount} correct`;
			return `${req.pollCount} polls`;
	}
};

const SLOT_LABELS: Record<GateTypeId, string> = {
	"coverage-gain": "Coverage",
	"correct-answers": "Accuracy",
	"storage-drain": "Memory Leak",
	"disabled-config": "Config Lock",
	"short-window": "Sprint",
};

export const getSlotLabel = (gateTypeId: GateTypeId): string =>
	SLOT_LABELS[gateTypeId];
