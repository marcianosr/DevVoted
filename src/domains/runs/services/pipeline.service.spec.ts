import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { STORAGE_UNITS } from "~/lib/storage";
import { getSlotDefinition } from "~/domains/runs/data/pipelineSlots";
import type { PipelineSlot, UpgradeCard } from "~/domains/runs/models/pipeline";
import {
	applyUpgradeCard,
	generateUpgradeCards,
	getInitialPipelineSlots,
	getStorageDrain,
	isMaxPipeline,
} from "./pipeline.service";

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const allTypesAtNormal: PipelineSlot[] = [
	getSlotDefinition("coverage-gain", "normal"),
	getSlotDefinition("correct-answers", "normal"),
	getSlotDefinition("storage-drain", "normal"),
	getSlotDefinition("disabled-config", "normal"),
	getSlotDefinition("short-window", "normal"),
];

const allTypesAtIntense: PipelineSlot[] = allTypesAtNormal.map((slot) =>
	getSlotDefinition(slot.gateTypeId, "intense")
);

// ─── getInitialPipelineSlots ──────────────────────────────────────────────────

describe("getInitialPipelineSlots", () => {
	it("returns a single slot", () => {
		expect(getInitialPipelineSlots()).toHaveLength(1);
	});

	it("returns correct-answers at easy difficulty", () => {
		const [slot] = getInitialPipelineSlots();
		expect(slot.gateTypeId).toBe("correct-answers");
		expect(slot.difficulty).toBe("easy");
	});

	it("gate 1 requirement is 3 correct answers", () => {
		const [slot] = getInitialPipelineSlots();
		expect(slot.requirement).toMatchObject({
			type: "correct-answers",
			count: 3,
		});
	});
});

// ─── isMaxPipeline ────────────────────────────────────────────────────────────

describe("isMaxPipeline", () => {
	it("returns false for empty pipeline", () => {
		expect(isMaxPipeline([])).toBe(false);
	});

	it("returns false when fewer than all slot types are active", () => {
		const partial = [
			getSlotDefinition("correct-answers", "intense"),
			getSlotDefinition("coverage-gain", "intense"),
		];
		expect(isMaxPipeline(partial)).toBe(false);
	});

	it("returns false when all types are active but not all at intense", () => {
		expect(isMaxPipeline(allTypesAtNormal)).toBe(false);
	});

	it("returns true when all types are active and all at intense", () => {
		expect(isMaxPipeline(allTypesAtIntense)).toBe(true);
	});
});

// ─── applyUpgradeCard ─────────────────────────────────────────────────────────

describe("applyUpgradeCard", () => {
	describe("add-slot card", () => {
		it("appends the new slot to the pipeline", () => {
			const slots = [getSlotDefinition("correct-answers", "easy")];
			const card: UpgradeCard = {
				kind: "add-slot",
				slot: getSlotDefinition("coverage-gain", "normal"),
			};

			const result = applyUpgradeCard(slots, card);

			expect(result).toHaveLength(2);
			expect(result[1].gateTypeId).toBe("coverage-gain");
		});

		it("does not mutate the original array", () => {
			const slots = [getSlotDefinition("correct-answers", "easy")];
			const card: UpgradeCard = {
				kind: "add-slot",
				slot: getSlotDefinition("coverage-gain", "normal"),
			};

			applyUpgradeCard(slots, card);

			expect(slots).toHaveLength(1);
		});
	});

	describe("upgrade-slot card", () => {
		it("replaces the matching slot with the upgraded version", () => {
			const slots = [
				getSlotDefinition("correct-answers", "easy"),
				getSlotDefinition("coverage-gain", "easy"),
			];
			const card: UpgradeCard = {
				kind: "upgrade-slot",
				gateTypeId: "correct-answers",
				from: "easy",
				to: "normal",
				slot: getSlotDefinition("correct-answers", "normal"),
			};

			const result = applyUpgradeCard(slots, card);

			expect(result[0].difficulty).toBe("normal");
			expect(result[0].gateTypeId).toBe("correct-answers");
		});

		it("leaves other slots unchanged", () => {
			const slots = [
				getSlotDefinition("correct-answers", "easy"),
				getSlotDefinition("coverage-gain", "easy"),
			];
			const card: UpgradeCard = {
				kind: "upgrade-slot",
				gateTypeId: "correct-answers",
				from: "easy",
				to: "normal",
				slot: getSlotDefinition("correct-answers", "normal"),
			};

			const result = applyUpgradeCard(slots, card);

			expect(result[1].gateTypeId).toBe("coverage-gain");
			expect(result[1].difficulty).toBe("easy");
		});

		it("does not mutate the original array", () => {
			const slots = [getSlotDefinition("correct-answers", "easy")];
			const card: UpgradeCard = {
				kind: "upgrade-slot",
				gateTypeId: "correct-answers",
				from: "easy",
				to: "normal",
				slot: getSlotDefinition("correct-answers", "normal"),
			};

			applyUpgradeCard(slots, card);

			expect(slots[0].difficulty).toBe("easy");
		});
	});
});

// ─── getStorageDrain ──────────────────────────────────────────────────────────

describe("getStorageDrain", () => {
	const drainSlot = getSlotDefinition("storage-drain", "normal"); // 10kb/wrong

	it("returns 0 on a correct answer regardless of pipeline", () => {
		expect(getStorageDrain([drainSlot], false)).toBe(0);
	});

	it("returns 0 on wrong answer when no drain slot is active", () => {
		const slots = [getSlotDefinition("correct-answers", "easy")];
		expect(getStorageDrain(slots, true)).toBe(0);
	});

	it("returns 0 on wrong answer when pipeline is empty", () => {
		expect(getStorageDrain([], true)).toBe(0);
	});

	it("returns drainPerWrong amount on wrong answer when drain slot is active", () => {
		const expectedDrain = 10 * STORAGE_UNITS.KB; // normal tier: 10kb per wrong
		expect(getStorageDrain([drainSlot], true)).toBe(expectedDrain);
	});

	it("returns the correct drain per difficulty tier", () => {
		const easy = getSlotDefinition("storage-drain", "easy"); // 5kb
		const hard = getSlotDefinition("storage-drain", "hard"); // 20kb
		const intense = getSlotDefinition("storage-drain", "intense"); // 40kb

		expect(getStorageDrain([easy], true)).toBeLessThan(
			getStorageDrain([hard], true)
		);
		expect(getStorageDrain([hard], true)).toBeLessThan(
			getStorageDrain([intense], true)
		);
	});
});

// ─── generateUpgradeCards ─────────────────────────────────────────────────────

describe("generateUpgradeCards", () => {
	beforeEach(() => {
		vi.spyOn(Math, "random").mockReturnValue(0);
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it("returns 2 add-slot cards when pipeline is empty", () => {
		const cards = generateUpgradeCards([], 1);
		expect(cards.length).toBe(2);
		expect(cards.every((c) => c.kind === "add-slot")).toBe(true);
	});

	it("returns one upgrade-slot card per upgradeable slot when all types are active", () => {
		const cards = generateUpgradeCards(allTypesAtNormal, 8);
		// all 5 types at normal are upgradeable — one card each, no add-slot cards
		expect(cards.length).toBe(5);
		expect(cards.every((c) => c.kind === "upgrade-slot")).toBe(true);
	});

	it("add-slot cards each contain a valid slot definition", () => {
		const cards = generateUpgradeCards([], 1);
		for (const card of cards) {
			if (card.kind !== "add-slot") throw new Error("Expected add-slot");
			expect(card.slot.gateTypeId).toBeDefined();
			expect(card.slot.difficulty).toBeDefined();
			expect(card.slot.reward).toBeGreaterThan(0);
		}
	});

	it("upgrade-slot card increments difficulty by one tier", () => {
		const cards = generateUpgradeCards(allTypesAtNormal, 8);
		const upgradeCard = cards.find((c) => c.kind === "upgrade-slot");
		if (!upgradeCard || upgradeCard.kind !== "upgrade-slot")
			throw new Error("Expected upgrade-slot");

		expect(upgradeCard.from).toBe("normal");
		expect(upgradeCard.to).toBe("hard");
	});

	it("add-slot cards only offer gate types not already in the pipeline", () => {
		const existing = [getSlotDefinition("correct-answers", "easy")];
		const cards = generateUpgradeCards(existing, 1);
		const addSlotCards = cards.filter((c) => c.kind === "add-slot");

		for (const card of addSlotCards) {
			if (card.kind !== "add-slot") continue;
			expect(card.slot.gateTypeId).not.toBe("correct-answers");
		}
	});

	it("respects difficulty distribution weights for gate number", () => {
		// At gate 16+, only hard and intense are available (easy/normal weight = 0).
		const cards = generateUpgradeCards([], 16);
		for (const card of cards) {
			if (card.kind !== "add-slot") continue;
			expect(["hard", "intense"]).toContain(card.slot.difficulty);
		}
	});

	it("includes an upgrade-slot card alongside add-slot cards when upgrades are possible", () => {
		const singleSlot = [getSlotDefinition("correct-answers", "easy")];
		const cards = generateUpgradeCards(singleSlot, 1);
		// 2 add-slot (5 available types) + 1 upgrade-slot
		expect(cards.length).toBe(3);
		expect(cards.filter((c) => c.kind === "add-slot").length).toBe(2);
		expect(cards.filter((c) => c.kind === "upgrade-slot").length).toBe(1);
	});
});
