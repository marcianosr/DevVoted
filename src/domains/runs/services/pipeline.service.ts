import {
	STARTER_GATE_TYPE_IDS,
	getCategoryMasterySlot,
	getDifficultyWeights,
	getSlotDefinition,
	type StaticGateTypeId,
} from "~/domains/runs/data/pipelineSlots";
import type {
	GateDifficulty,
	PipelineSlot,
	UpgradeCard,
	UpgradeCategoryMasterySlotCard,
} from "~/domains/runs/models/pipeline";
import type { CategoryCode } from "~/domains/shared/categories";

const DIFFICULTY_ORDER: readonly GateDifficulty[] = [
	"low",
	"medium",
	"high",
	"critical",
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

const getAvailableGateTypes = (slots: PipelineSlot[]): StaticGateTypeId[] => {
	const activeTypes = new Set(slots.map((s) => s.gateTypeId));
	return STARTER_GATE_TYPE_IDS.filter((id) => !activeTypes.has(id));
};

const getUpgradeableSlots = (slots: PipelineSlot[]): PipelineSlot[] =>
	slots.filter((s) => getNextDifficulty(s.difficulty) !== null);

export const getInitialPipelineSlots = (): PipelineSlot[] => [
	getSlotDefinition("short-window", "low")!,
];

export const isMaxPipeline = (slots: PipelineSlot[]): boolean =>
	STARTER_GATE_TYPE_IDS.every((id) =>
		slots.some((s) => s.gateTypeId === id && s.difficulty === "critical")
	);

const getAvailableCategoryMasteryCategories = (
	slots: PipelineSlot[],
	availableCategories: CategoryCode[]
): CategoryCode[] => {
	const activeCategories = new Set(
		slots
			.filter((s) => s.requirement.type === "category-mastery")
			.map((s) => (s.requirement as { category: CategoryCode }).category)
	);
	return availableCategories.filter((c) => !activeCategories.has(c));
};

/**
 * Generates a hand of upgrade cards for the player to choose from.
 * Always offers 2 add-slot cards (randomly drawn gate types) plus
 * 1 upgrade-slot card if any existing slot can be upgraded.
 * If availableCategories is provided, may also offer a category mastery card.
 */
export const generateUpgradeCards = (
	slots: PipelineSlot[],
	gateNumber: number,
	availableCategories: CategoryCode[] = []
): UpgradeCard[] => {
	const cards: UpgradeCard[] = [];
	const weights = getDifficultyWeights(gateNumber);

	// Pool: static gate types + one random category mastery (if available)
	const availableTypes = getAvailableGateTypes(slots);
	const availableCategoryTypes = getAvailableCategoryMasteryCategories(
		slots,
		availableCategories
	);

	const staticPool: Array<
		| { kind: "static"; gateTypeId: StaticGateTypeId }
		| { kind: "category"; category: CategoryCode }
	> = [
		...availableTypes.map((gateTypeId) => ({
			kind: "static" as const,
			gateTypeId,
		})),
		...availableCategoryTypes.map((category) => ({
			kind: "category" as const,
			category,
		})),
	];

	const shuffledPool = [...staticPool].sort(() => Math.random() - 0.5);
	const toOffer = shuffledPool.slice(0, 2);

	for (const entry of toOffer) {
		if (entry.kind === "static") {
			const slot = getSlotDefinition(
				entry.gateTypeId,
				pickWeightedDifficulty(weights)
			);
			if (!slot) continue;
			cards.push({ kind: "add-slot", slot });
		} else {
			const slot = getCategoryMasterySlot(entry.category);
			cards.push({ kind: "add-slot", slot });
		}
	}

	for (const slot of getUpgradeableSlots(slots)) {
		const nextDifficulty = getNextDifficulty(slot.difficulty);
		if (!nextDifficulty) continue;

		if (slot.requirement.type === "category-mastery") {
			const nextSlot = getCategoryMasterySlot(
				slot.requirement.category,
				nextDifficulty
			);
			const card: UpgradeCategoryMasterySlotCard = {
				kind: "upgrade-category-mastery-slot",
				category: slot.requirement.category,
				from: slot.difficulty,
				to: nextDifficulty,
				slot: nextSlot,
			};
			cards.push(card);
			continue;
		}

		const nextSlot = getSlotDefinition(
			slot.gateTypeId as StaticGateTypeId,
			nextDifficulty
		);
		if (!nextSlot) continue;

		cards.push({
			kind: "upgrade-slot",
			gateTypeId: slot.gateTypeId,
			from: slot.difficulty,
			to: nextDifficulty,
			slot: nextSlot,
		});
	}

	return cards;
};

export const applyUpgradeCard = (
	slots: PipelineSlot[],
	card: UpgradeCard
): PipelineSlot[] => {
	if (card.kind === "add-slot") return [...slots, card.slot];

	if (card.kind === "upgrade-category-mastery-slot") {
		return slots.map((slot) => {
			if (slot.gateTypeId !== "category-mastery") return slot;
			if (slot.requirement.type !== "category-mastery") return slot;
			return slot.requirement.category === card.category ? card.slot : slot;
		});
	}

	return slots.map((slot) => {
		if (slot.gateTypeId !== card.gateTypeId) return slot;
		return card.slot;
	});
};
