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

/**
 * Generates a hand of upgrade cards for the player to choose from.
 * Always offers 2 add-slot cards (randomly drawn gate types) plus
 * 1 upgrade-slot card if any existing slot can be upgraded.
 */
export const generateUpgradeCards = (
	slots: PipelineSlot[],
	gateNumber: number
): UpgradeCard[] => {
	const cards: UpgradeCard[] = [];
	const weights = getDifficultyWeights(gateNumber);

	// 2 add-slot cards from randomly drawn available gate types
	const availableTypes = getAvailableGateTypes(slots);
	const shuffledTypes = [...availableTypes].sort(() => Math.random() - 0.5);
	const typesToOffer = shuffledTypes.slice(0, 2);

	for (const gateTypeId of typesToOffer) {
		cards.push({
			kind: "add-slot",
			slot: getSlotDefinition(gateTypeId, pickWeightedDifficulty(weights)),
		});
	}

	// One upgrade card per upgradeable slot — player sees all options, picks one
	for (const slot of getUpgradeableSlots(slots)) {
		const nextDifficulty = getNextDifficulty(slot.difficulty);

		// nextDifficulty is always defined — getUpgradeableSlots filters out intense slots.
		if (!nextDifficulty) continue;

		cards.push({
			kind: "upgrade-slot",
			gateTypeId: slot.gateTypeId,
			from: slot.difficulty,
			to: nextDifficulty,
			slot: getSlotDefinition(slot.gateTypeId, nextDifficulty),
		});
	}

	return cards;
};

export const getStorageDrain = (
	slots: PipelineSlot[],
	isWrongAnswer: boolean
): number => {
	if (!isWrongAnswer) return 0;

	for (const slot of slots) {
		if (slot.requirement.type === "storage-drain") {
			return slot.requirement.drainPerWrong;
		}
	}

	return 0;
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
