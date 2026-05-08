import type { GateDifficulty, GateTypeId } from "~/domains/runs/models/pipeline.model";
import type { Run } from "~/domains/runs/models/run.model";

export const GATE_TYPE_IDS: GateTypeId[] = [
	"coverage-gain",
	"correct-answers",
	"short-window",
	"cold-start",
	"category-mastery",
];

export const GATE_DIFFICULTIES: GateDifficulty[] = [
	"low",
	"medium",
	"high",
	"critical",
];

export const toSlotKey = (gateTypeId: GateTypeId, difficulty: GateDifficulty) =>
	`${gateTypeId}:${difficulty}`;

export const getDiscoveredSlotKeys = (runs: Run[]): Set<string> => {
	const keys = new Set<string>();

	runs.forEach((run) => {
		[...run.pipelineSlots, ...run.pipelineSlotSnapshots.flat()].forEach(
			(slot) => keys.add(toSlotKey(slot.gateTypeId, slot.difficulty))
		);
	});

	return keys;
};
