import { formatStorage } from "~/lib/storage";
import type {
	GateTypeId,
	PipelineSlotRequirement,
} from "~/domains/runs/models/pipeline";

export const formatRequirement = (req: PipelineSlotRequirement): string => {
	switch (req.type) {
		case "coverage-gain":
			return `Gain ${req.threshold}% coverage`;

		case "correct-answers":
			return req.streakRequired
				? `Answer ${req.count} correctly (streak ×${req.streakRequired})`
				: `Answer ${req.count} correctly`;

		case "no-wrong-answers":
			if (req.maxWrong === 0) {
				return req.streakRequired
					? `No wrong answers (streak ×${req.streakRequired})`
					: "No wrong answers";
			}
			return req.streakRequired
				? `Max ${req.maxWrong} wrong (streak ×${req.streakRequired})`
				: `Max ${req.maxWrong} wrong`;

		case "storage-drain":
			return `−${formatStorage(req.drainPerWrong)} per wrong answer`;

		case "disabled-config":
			return req.requiresRarePlus
				? `Disable ${req.count} rare+ config${req.count > 1 ? "s" : ""}`
				: `Disable ${req.count} config${req.count > 1 ? "s" : ""}`;

		case "short-window":
			if (req.noWrongRequired)
				return `${req.pollCount} polls, no wrong answers`;
			if (req.correctRequired)
				return `${req.pollCount} polls, ${req.correctRequired}/${req.pollCount} correct`;
			return `${req.pollCount} polls`;
	}
};

const SLOT_LABELS: Record<GateTypeId, string> = {
	"coverage-gain": "Coverage",
	"correct-answers": "Accuracy",
	"no-wrong-answers": "Precision",
	"storage-drain": "Memory Leak",
	"disabled-config": "Config Lock",
	"short-window": "Sprint",
};

export const getSlotLabel = (gateTypeId: GateTypeId): string =>
	SLOT_LABELS[gateTypeId];
