import { describe, expect, it } from "vitest";

import {
	kantoPrepCalibration,
	kantoPrepChampion,
	kantoPrepFirstAudit,
	kantoPrepPrefetched,
	kantoPrepPrefetchedAtV1,
	kantoPrepSealed,
} from "~/test/kantoPoll.factory";
import {
	outageTargetLineFor,
	subscriptionsLedgerFor,
} from "~/modules/run/run/application/prepScreen.viewmodel";

describe("the prep header", () => {
	it("names the gate over a line of subtext", () => {
		const { header } = kantoPrepSealed();

		expect(header.title).toBeUndefined();
		expect(header.subtitle).toBe("Look at what's at stake!");
	});
});

describe("the five polls", () => {
	it("seals all five tiles while no config opens the window", () => {
		const { polls } = kantoPrepSealed();

		expect(polls.state).toBe("sealed");
		expect(polls.tiles).toHaveLength(5);
		expect(polls.tiles.every((tile) => tile.locked === true)).toBe(true);
		expect(polls.after).toBeUndefined();
	});

	it("credits the config that opened the window", () => {
		expect(kantoPrepPrefetched().polls.state).toBe("revealed by Prefetch");
	});

	it("names each tile's category and, at v2, its answer type and option count", () => {
		const { polls } = kantoPrepPrefetched();

		expect(polls.tiles).toEqual([
			{ category: "TypeScript", shape: "single · 4 options" },
			{ category: "TypeScript", shape: "multiple · 4 options" },
			{ category: "TypeScript", shape: "multiple · 5 options" },
			{ category: "JavaScript", shape: "multiple · 6 options" },
			{ category: "JavaScript", shape: "multiple · 4 options" },
		]);
	});

	it("names the category alone at v1, the shape still hidden", () => {
		const { polls } = kantoPrepPrefetchedAtV1();

		expect(polls.tiles.every((tile) => tile.shape === undefined)).toBe(true);
		expect(polls.tiles.map((tile) => tile.category)).toContain("TypeScript");
	});

	it("tallies the next gate's categories under the tiles, a repeat with a times sign", () => {
		const { polls } = kantoPrepPrefetched();
		const [next] = polls.after ?? [];

		expect(next.label).toBe("next gate");
		expect(
			(next.figures ?? []).map((figure) =>
				figure.locked === true ? "" : figure.label
			)
		).toEqual(["Git ×5"]);
	});

	it("states the summit instead of a next gate at the Champion", () => {
		const [next] = kantoPrepChampion().polls.after ?? [];

		expect(
			(next?.figures ?? []).map((figure) =>
				figure.locked === true ? "" : figure.label
			)
		).toEqual(["the summit — nothing after this"]);
	});
});

describe("the audits panel", () => {
	const firstAuditAt = (clearedGates: readonly number[]) =>
		kantoPrepFirstAudit(clearedGates).audits;

	it("draws no audits panel before the first audited gate", () => {
		expect(kantoPrepCalibration().audits).toBeUndefined();
	});

	it("badges the panel and the row new on a player's first audit", () => {
		const audits = firstAuditAt([0, 1, 2]);

		expect(audits?.badge).toEqual({ label: "new", color: "cerulean" });
		expect(audits?.rows.map((row) => row.isNew)).toEqual([true]);
	});

	it("drops the badge once the player has cleared a gate that holds the audit", () => {
		const audits = firstAuditAt([0, 1, 2, 3]);

		expect(audits?.badge).toBeUndefined();
		expect(audits?.rows.map((row) => row.isNew)).toEqual([false]);
	});
});

describe("the subscriptions ledger", () => {
	it("badges the build space's weight ahead of its line, the words left plain", () => {
		const ledger = subscriptionsLedgerFor({
			lines: [
				{
					id: "build-space",
					label: "weight build space",
					weight: 6,
					kb: 16,
					billedOnMiss: false,
				},
			],
			totalKb: 16,
			onMissKb: 0,
			shortfallKb: 0,
		});

		expect(ledger?.rows[0]).toEqual(
			expect.objectContaining({ lead: "6", label: "weight build space" })
		);
	});

	it("leads a config's own line with no badge", () => {
		const ledger = subscriptionsLedgerFor({
			lines: [{ id: "ci", label: "CI Pipeline", kb: 8, billedOnMiss: false }],
			totalKb: 8,
			onMissKb: 0,
			shortfallKb: 0,
		});

		expect(ledger?.rows[0]?.lead).toBeUndefined();
	});
});

describe("outageTargetLineFor", () => {
	const SAME = [[".js"], [".js"], [".js"], [".js"], [".js"]];
	const MOVING = [[".js"], ["Cache"], [".js"], ["Cache"], [".js"]];
	const FIRST_POLL_ONLY = [[".js", "Cache", "npm audit"], [], [], [], []];

	it("names one target when every poll agrees", () => {
		expect(outageTargetLineFor(SAME, 3)).toBe("takes .js offline");
	});

	it("lists the targets in play order when they differ", () => {
		expect(outageTargetLineFor(MOVING, 3)).toBe(
			"takes .js · Cache · .js · Cache · .js offline, one a poll"
		);
	});

	it("names the whole build on poll 1 for a Too Early gate", () => {
		expect(outageTargetLineFor(FIRST_POLL_ONLY, 3)).toBe(
			"takes the whole build offline on poll 1"
		);
	});

	it("names nothing when no poll loses a config", () => {
		expect(outageTargetLineFor([[], [], [], [], []], 3)).toBeUndefined();
	});
});
