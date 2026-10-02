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
import { leadTextOf } from "~/ui/kanto-theme/Lead.ui";

const REVEAL_NOTE = "Some configs reveal these before you answer.";

describe("the five polls", () => {
	it("counts nothing revealed while no config opens the window, and says what would", () => {
		const { polls } = kantoPrepSealed();

		expect(leadTextOf(polls.meta ?? [])).toBe("0 of 4 facts revealed");
		expect(polls.note).toBe(REVEAL_NOTE);
		expect(polls.rows).toHaveLength(4);
		expect(
			polls.rows.every((row) =>
				(row.figures ?? []).every((figure) => figure.locked === true)
			)
		).toBe(true);
	});

	it("counts the window revealed and credits the config that opened it", () => {
		const { polls } = kantoPrepPrefetched();

		expect(leadTextOf(polls.meta ?? [])).toBe(
			"4 of 4 facts revealed by Prefetch"
		);
		expect(polls.meta).toContainEqual({ figure: "Prefetch" });
		expect(polls.note).toBeUndefined();
		expect(polls.rows.map((row) => row.label)).toEqual([
			"answer types",
			"options each",
			"categories",
			"next gate",
		]);
	});

	it("counts two of four revealed by a v1 Prefetch and says what v2 adds", () => {
		const { polls } = kantoPrepPrefetchedAtV1();

		expect(leadTextOf(polls.meta ?? [])).toBe(
			"2 of 4 facts revealed by Prefetch"
		);
		expect(polls.note).toBe(
			"Prefetch v2 reveals the answer types and option counts too."
		);
		const lockedRows = polls.rows.map((row) =>
			(row.figures ?? []).every((figure) => figure.locked === true)
		);
		expect(lockedRows).toEqual([true, true, false, false]);
	});

	it("names a category by its proper name and tallies a repeat with a times sign", () => {
		const { polls } = kantoPrepPrefetched();
		const labelsOf = (row: number) =>
			(polls.rows[row].figures ?? []).map((figure) =>
				figure.locked === true ? "" : figure.label
			);

		expect(labelsOf(2)).toEqual(["TypeScript ×3", "JavaScript ×2"]);
		expect(labelsOf(3)).toContain("Git ×5");
		expect(
			[...labelsOf(2), ...labelsOf(3)].some((label) => /×1$/.test(label))
		).toBe(false);
		expect(
			[...labelsOf(2), ...labelsOf(3)].some((label) => /^[a-z]/.test(label))
		).toBe(false);
	});
});

describe("today's answers", () => {
	it("draws only the gate being prepped, as the current row", () => {
		const { scores } = kantoPrepSealed();

		expect(scores.rows).toHaveLength(1);
		expect(scores.rows[0].current).toBe(true);
		expect(scores.rows[0].swatch.gateName).toBe("Lavender");
		expect(scores.rows[0].polls).toBe(5);
	});

	it("keeps the summit's own row at the summit", () => {
		const { scores } = kantoPrepChampion();

		expect(scores.rows).toHaveLength(1);
		expect(scores.rows[0].swatch.gateName).toBe("Champion");
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
