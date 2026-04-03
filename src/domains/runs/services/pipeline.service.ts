import {
	STARTER_GATE_TYPE_IDS,
	getDifficultyWeights,
	getSlotDefinition,
} from "~/domains/runs/data/pipelineSlots";
import type {
	GateDifficulty,
	GateTypeId,
	PipelineSlot,
	UpgradeCard,
} from "~/domains/runs/models/pipeline";

// ─── Difficulty ordering ──────────────────────────────────────────────────────

const DIFFICULTY_ORDER: readonly GateDifficulty[] = [
	"easy",
	"normal",
	"hard",
	"intense",
] as const;

const getNextDifficulty = (current: GateDifficulty): GateDifficulty | null => {
	const index = DIFFICULTY_ORDER.indexOf(current);
	return index < DIFFICULTY_ORDER.length - 1
		? DIFFICULTY_ORDER[index + 1]
		: null;
};

// ─── Weighted random selection ────────────────────────────────────────────────

const pickWeightedDifficulty = (
	weights: Record<GateDifficulty, number>
): GateDifficulty => {
	const eligible = DIFFICULTY_ORDER.filter((d) => weights[d] > 0);
	const total = eligible.reduce((sum, d) => sum + weights[d], 0);
	let random = Math.random() * total;

	for (const difficulty of eligible) {
		random -= weights[difficulty];
		if (random <= 0) return difficulty;
	}

	return eligible[eligible.length - 1];
};

// ─── Pipeline slot helpers ────────────────────────────────────────────────────

const getAvailableGateTypes = (slots: PipelineSlot[]): GateTypeId[] => {
	const activeTypes = new Set(slots.map((s) => s.gateTypeId));
	return STARTER_GATE_TYPE_IDS.filter((id) => !activeTypes.has(id));
};

const getUpgradeableSlots = (slots: PipelineSlot[]): PipelineSlot[] =>
	slots.filter((s) => getNextDifficulty(s.difficulty) !== null);

// ─── Public API ───────────────────────────────────────────────────────────────

export const getInitialPipelineSlots = (): PipelineSlot[] => [
	getSlotDefinition("correct-answers", "easy"),
];

export const isMaxPipeline = (slots: PipelineSlot[]): boolean =>
	slots.length === STARTER_GATE_TYPE_IDS.length &&
	slots.every((s) => s.difficulty === "intense");

export const generateUpgradeCard = (
	slots: PipelineSlot[],
	gateNumber: number
): UpgradeCard => {
	const availableTypes = getAvailableGateTypes(slots);
	const upgradeableSlots = getUpgradeableSlots(slots);
	const weights = getDifficultyWeights(gateNumber);

	const canAdd = availableTypes.length > 0;
	const canUpgrade = upgradeableSlots.length > 0;

	const shouldAdd = canAdd && (!canUpgrade || Math.random() < 0.5);

	if (shouldAdd) {
		const gateTypeId =
			availableTypes[Math.floor(Math.random() * availableTypes.length)];
		const difficulty = pickWeightedDifficulty(weights);

		return {
			kind: "add-slot",
			slot: getSlotDefinition(gateTypeId, difficulty),
		};
	}

	const slot =
		upgradeableSlots[Math.floor(Math.random() * upgradeableSlots.length)];
	const nextDifficulty = getNextDifficulty(slot.difficulty);

	// nextDifficulty is always defined here — getUpgradeableSlots filters out
	// slots already at Intense, so getNextDifficulty will never return null.
	if (!nextDifficulty) {
		throw new Error(
			`Slot ${slot.gateTypeId} is already at max difficulty but was included in upgradeable slots`
		);
	}

	return {
		kind: "upgrade-slot",
		gateTypeId: slot.gateTypeId,
		from: slot.difficulty,
		to: nextDifficulty,
		slot: getSlotDefinition(slot.gateTypeId, nextDifficulty),
	};
};

export const applyUpgradeCard = (
	slots: PipelineSlot[],
	card: UpgradeCard
): PipelineSlot[] => {
	if (card.kind === "add-slot") {
		return [...slots, card.slot];
	}

	return slots.map((slot) =>
		slot.gateTypeId === card.gateTypeId ? card.slot : slot
	);
};
