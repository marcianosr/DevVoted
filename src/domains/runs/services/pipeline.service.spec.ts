import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getSlotDefinition } from "~/domains/runs/data/pipelineSlots";
import type { PipelineSlot, UpgradeCard } from "~/domains/runs/models/pipeline";
import {
	applyUpgradeCard,
	generateUpgradeCards,
	getInitialPipelineSlots,
	isMaxPipeline,
} from "./pipeline.service";

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const allTypesAtMedium: PipelineSlot[] = [
	getSlotDefinition("coverage-gain", "medium"),
	getSlotDefinition("correct-answers", "medium"),
	getSlotDefinition("short-window", "medium"),
];

const allTypesAtCritical: PipelineSlot[] = allTypesAtMedium.map((slot) =>
	getSlotDefinition(slot.gateTypeId, "critical")
);

// ─── getInitialPipelineSlots ──────────────────────────────────────────────────

describe("getInitialPipelineSlots", () => {
	it("returns a single slot", () => {
		expect(getInitialPipelineSlots()).toHaveLength(1);
	});

	it("returns short-window at low difficulty", () => {
		const [slot] = getInitialPipelineSlots();
		expect(slot.gateTypeId).toBe("short-window");
		expect(slot.difficulty).toBe("low");
	});

	it("gate 1 requirement is a 5-poll window", () => {
		const [slot] = getInitialPipelineSlots();
		expect(slot.requirement).toMatchObject({
			type: "short-window",
			pollCount: 5,
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
			getSlotDefinition("correct-answers", "critical"),
			getSlotDefinition("coverage-gain", "critical"),
		];
		expect(isMaxPipeline(partial)).toBe(false);
	});

	it("returns false when all types are active but not all at critical", () => {
		expect(isMaxPipeline(allTypesAtMedium)).toBe(false);
	});

	it("returns true when all types are active and all at critical", () => {
		expect(isMaxPipeline(allTypesAtCritical)).toBe(true);
	});
});

// ─── applyUpgradeCard ─────────────────────────────────────────────────────────

describe("applyUpgradeCard", () => {
	describe("add-slot card", () => {
		it("appends the new slot to the pipeline", () => {
			const slots = [getSlotDefinition("correct-answers", "low")];
			const card: UpgradeCard = {
				kind: "add-slot",
				slot: getSlotDefinition("coverage-gain", "medium"),
			};

			const result = applyUpgradeCard(slots, card);

			expect(result).toHaveLength(2);
			expect(result[1].gateTypeId).toBe("coverage-gain");
		});

		it("does not mutate the original array", () => {
			const slots = [getSlotDefinition("correct-answers", "low")];
			const card: UpgradeCard = {
				kind: "add-slot",
				slot: getSlotDefinition("coverage-gain", "medium"),
			};

			applyUpgradeCard(slots, card);

			expect(slots).toHaveLength(1);
		});
	});

	describe("upgrade-slot card", () => {
		it("replaces the matching slot with the upgraded version", () => {
			const slots = [
				getSlotDefinition("correct-answers", "low"),
				getSlotDefinition("coverage-gain", "low"),
			];
			const card: UpgradeCard = {
				kind: "upgrade-slot",
				gateTypeId: "correct-answers",
				from: "low",
				to: "medium",
				slot: getSlotDefinition("correct-answers", "medium"),
			};

			const result = applyUpgradeCard(slots, card);

			expect(result[0].difficulty).toBe("medium");
			expect(result[0].gateTypeId).toBe("correct-answers");
		});

		it("leaves other slots unchanged", () => {
			const slots = [
				getSlotDefinition("correct-answers", "low"),
				getSlotDefinition("coverage-gain", "low"),
			];
			const card: UpgradeCard = {
				kind: "upgrade-slot",
				gateTypeId: "correct-answers",
				from: "low",
				to: "medium",
				slot: getSlotDefinition("correct-answers", "medium"),
			};

			const result = applyUpgradeCard(slots, card);

			expect(result[1].gateTypeId).toBe("coverage-gain");
			expect(result[1].difficulty).toBe("low");
		});

		it("does not mutate the original array", () => {
			const slots = [getSlotDefinition("correct-answers", "low")];
			const card: UpgradeCard = {
				kind: "upgrade-slot",
				gateTypeId: "correct-answers",
				from: "low",
				to: "medium",
				slot: getSlotDefinition("correct-answers", "medium"),
			};

			applyUpgradeCard(slots, card);

			expect(slots[0].difficulty).toBe("low");
		});
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
		const cards = generateUpgradeCards(allTypesAtMedium, 8);
		// all 3 types at medium are upgradeable — one card each, no add-slot cards
		expect(cards.length).toBe(3);
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
		const cards = generateUpgradeCards(allTypesAtMedium, 8);
		const upgradeCard = cards.find((c) => c.kind === "upgrade-slot");
		if (!upgradeCard || upgradeCard.kind !== "upgrade-slot")
			throw new Error("Expected upgrade-slot");

		expect(upgradeCard.from).toBe("medium");
		expect(upgradeCard.to).toBe("high");
	});

	it("add-slot cards only offer gate types not already in the pipeline", () => {
		const existing = [getSlotDefinition("correct-answers", "low")];
		const cards = generateUpgradeCards(existing, 1);
		const addSlotCards = cards.filter((c) => c.kind === "add-slot");

		for (const card of addSlotCards) {
			if (card.kind !== "add-slot") continue;
			expect(card.slot.gateTypeId).not.toBe("correct-answers");
		}
	});

	it("respects difficulty distribution weights for gate number", () => {
		// At gate 16+, only high and critical are available (low/medium weight = 0).
		const cards = generateUpgradeCards([], 16);
		for (const card of cards) {
			if (card.kind !== "add-slot") continue;
			expect(["high", "critical"]).toContain(card.slot.difficulty);
		}
	});

	it("includes an upgrade-slot card alongside add-slot cards when upgrades are possible", () => {
		const singleSlot = [getSlotDefinition("correct-answers", "low")];
		const cards = generateUpgradeCards(singleSlot, 1);
		// 2 add-slot (2 remaining types) + 1 upgrade-slot
		expect(cards.length).toBe(3);
		expect(cards.filter((c) => c.kind === "add-slot").length).toBe(2);
		expect(cards.filter((c) => c.kind === "upgrade-slot").length).toBe(1);
	});
});
