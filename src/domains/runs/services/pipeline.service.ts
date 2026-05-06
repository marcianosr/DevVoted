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
} from "~/domains/runs/models/pipeline.model";
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

// TODO: No polls yet for these categories
const CATEGORIES_WITHOUT_POLLS: readonly CategoryCode[] = [
	"general-backend",
	"python",
];

const getAvailableCategoryMasteryCategories = (
	slots: PipelineSlot[],
	availableCategories: CategoryCode[]
): CategoryCode[] => {
	const activeCategories = new Set(
		slots
			.filter((s) => s.requirement.type === "category-mastery")
			.map((s) => (s.requirement as { category: CategoryCode }).category)
	);
	return availableCategories.filter(
		(c) => !activeCategories.has(c) && !CATEGORIES_WITHOUT_POLLS.includes(c)
	);
};

/**
 * Generates a hand of up to 3 cards: 2 random add-slot offers + 1 randomly
 * selected upgrade. Returns fewer when the pool is exhausted.
 */
export const generateUpgradeCards = (
	slots: PipelineSlot[],
	gateNumber: number,
	availableCategories: CategoryCode[] = []
): UpgradeCard[] => {
	const cards: UpgradeCard[] = [];
	const weights = getDifficultyWeights(gateNumber);

	const availableTypes = getAvailableGateTypes(slots);
	const availableCategoryTypes = getAvailableCategoryMasteryCategories(
		slots,
		availableCategories
	);

	type PoolEntry =
		| { kind: "static"; gateTypeId: StaticGateTypeId }
		| { kind: "category"; category: CategoryCode };

	const addPool: PoolEntry[] = [
		...availableTypes.map((gateTypeId) => ({
			kind: "static" as const,
			gateTypeId,
		})),
		...availableCategoryTypes.map((category) => ({
			kind: "category" as const,
			category,
		})),
	];

	const upgradeableSlots = getUpgradeableSlots(slots);
	const addCount = upgradeableSlots.length > 0 ? 2 : 3;

	for (const entry of [...addPool]
		.sort(() => Math.random() - 0.5)
		.slice(0, addCount)) {
		if (entry.kind === "static") {
			const slot = getSlotDefinition(
				entry.gateTypeId,
				pickWeightedDifficulty(weights)
			);
			if (!slot) continue;
			cards.push({ kind: "add-slot", slot });
		} else {
			cards.push({
				kind: "add-slot",
				slot: getCategoryMasterySlot(
					entry.category,
					pickWeightedDifficulty(weights)
				),
			});
		}
	}

	if (upgradeableSlots.length > 0) {
		const slot =
			upgradeableSlots[Math.floor(Math.random() * upgradeableSlots.length)];
		const nextDifficulty = getNextDifficulty(slot.difficulty)!;

		if (slot.requirement.type === "category-mastery") {
			const card: UpgradeCategoryMasterySlotCard = {
				kind: "upgrade-category-mastery-slot",
				category: slot.requirement.category,
				from: slot.difficulty,
				to: nextDifficulty,
				slot: getCategoryMasterySlot(slot.requirement.category, nextDifficulty),
			};
			cards.push(card);
		} else {
			const nextSlot = getSlotDefinition(
				slot.gateTypeId as StaticGateTypeId,
				nextDifficulty
			);
			if (nextSlot) {
				cards.push({
					kind: "upgrade-slot",
					gateTypeId: slot.gateTypeId,
					from: slot.difficulty,
					to: nextDifficulty,
					slot: nextSlot,
				});
			}
		}
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
