import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getSlotDefinition } from "~/domains/runs/data/pipelineSlots";
import type { PipelineSlot, UpgradeCard } from "~/domains/runs/models/pipeline";
import {
	applyUpgradeCard,
	generateUpgradeCard,
	getInitialPipelineSlots,
	isMaxPipeline,
} from "./pipeline.service";

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const allSixTypesAtNormal: PipelineSlot[] = [
	getSlotDefinition("coverage-gain", "normal"),
	getSlotDefinition("correct-answers", "normal"),
	getSlotDefinition("no-wrong-answers", "normal"),
	getSlotDefinition("storage-drain", "normal"),
	getSlotDefinition("disabled-config", "normal"),
	getSlotDefinition("short-window", "normal"),
];

const allSixTypesAtIntense: PipelineSlot[] = allSixTypesAtNormal.map((slot) =>
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

	it("returns false when fewer than 6 slots are active", () => {
		const partial = [
			getSlotDefinition("correct-answers", "intense"),
			getSlotDefinition("coverage-gain", "intense"),
		];
		expect(isMaxPipeline(partial)).toBe(false);
	});

	it("returns false when all 6 types active but not all at intense", () => {
		expect(isMaxPipeline(allSixTypesAtNormal)).toBe(false);
	});

	it("returns true when all 6 types are active and all at intense", () => {
		expect(isMaxPipeline(allSixTypesAtIntense)).toBe(true);
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

// ─── generateUpgradeCard ──────────────────────────────────────────────────────

describe("generateUpgradeCard", () => {
	beforeEach(() => {
		vi.spyOn(Math, "random").mockReturnValue(0);
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it("generates an add-slot card when pipeline is empty", () => {
		const card = generateUpgradeCard([], 1);
		expect(card.kind).toBe("add-slot");
	});

	it("generates an upgrade-slot card when all types are already active", () => {
		const card = generateUpgradeCard(allSixTypesAtNormal, 8);
		expect(card.kind).toBe("upgrade-slot");
	});

	it("add-slot card contains a valid slot definition", () => {
		const card = generateUpgradeCard([], 1);
		if (card.kind !== "add-slot") throw new Error("Expected add-slot");

		expect(card.slot.gateTypeId).toBeDefined();
		expect(card.slot.difficulty).toBeDefined();
		expect(card.slot.reward).toBeGreaterThan(0);
	});

	it("upgrade-slot card increments difficulty by one tier", () => {
		const slots = [getSlotDefinition("correct-answers", "easy")];
		const card = generateUpgradeCard(slots, 1);

		if (card.kind !== "upgrade-slot") {
			// With Math.random = 0, shouldAdd = true (only upgrade is possible
			// if we have all types). For a single slot, both are possible —
			// shouldAdd = Math.random() < 0.5 = 0 < 0.5 = true → add-slot.
			// So we test upgrade explicitly with all types active.
		}

		const upgradeCard = generateUpgradeCard(allSixTypesAtNormal, 8);
		if (upgradeCard.kind !== "upgrade-slot")
			throw new Error("Expected upgrade-slot");

		expect(upgradeCard.from).toBe("normal");
		expect(upgradeCard.to).toBe("hard");
	});

	it("generated add-slot card type is not already in the pipeline", () => {
		const existing = [getSlotDefinition("correct-answers", "easy")];
		const card = generateUpgradeCard(existing, 1);

		if (card.kind !== "add-slot") throw new Error("Expected add-slot");

		expect(card.slot.gateTypeId).not.toBe("correct-answers");
	});

	it("uses difficulty distribution weights for gate number", () => {
		// At gate 16+, only hard and intense are available (easy/normal weight = 0).
		// With Math.random = 0, weighted pick returns the first eligible difficulty.
		// hard: 30, intense: 70 → random=0, 0-30=-30 ≤ 0 → hard
		const card = generateUpgradeCard([], 16);
		if (card.kind !== "add-slot") throw new Error("Expected add-slot");

		expect(["hard", "intense"]).toContain(card.slot.difficulty);
	});
});
