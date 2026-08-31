import { describe, expect, it } from "vitest";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import {
	auditBurnKb,
	auditDemandFactor,
	auditExtraPeelShare,
	auditFeeMultiplier,
	auditsCloseShop,
	auditsForGate,
	auditsFreezeManualEffects,
	auditScoreShare,
	auditTimeLimitMs,
	GATE_AUDITS,
	liveAuditsFor,
	mirrorsPolls,
	nextAuditedGateFrom,
	offlineConfigsFor,
	suppressedAuditFor,
} from "~/modules/run/gate/domain/audit.model";
import { GATE_COUNT } from "~/modules/run/run/domain/rules.model";

describe("the audit schedule", () => {
	const countAt = (gate: number) => auditsForGate(gate).length;

	it("keeps the first three gates clean — staged exposure", () => {
		expect(countAt(0)).toBe(0);
		expect(countAt(1)).toBe(0);
		expect(countAt(2)).toBe(0);
	});

	it("runs one audit from gate 3, two from 8, three from 11", () => {
		expect([3, 4, 5, 6, 7].map(countAt)).toEqual([1, 1, 1, 1, 1]);
		expect([8, 9, 10].map(countAt)).toEqual([2, 2, 2]);
		expect([11, 12].map(countAt)).toEqual([3, 3]);
	});

	it("never eases off deeper into the climb", () => {
		const counts = Array.from({ length: GATE_COUNT }, (_, gate) =>
			countAt(gate)
		);
		expect(counts).toEqual([...counts].sort((a, b) => a - b));
	});

	it("gives no gate the same audit twice", () => {
		for (const audits of Object.values(GATE_AUDITS)) {
			const ids = audits.map((audit) => audit.id);
			expect(new Set(ids).size).toBe(ids.length);
		}
	});

	it("states every audit on the receipt, and cues the ones that change play", () => {
		for (const audits of Object.values(GATE_AUDITS))
			for (const audit of audits) {
				expect(audit.description.length).toBeGreaterThan(0);
				const settledAtTheDoor =
					audit.closesShop === true || audit.peelShareOnFail !== undefined;
				expect(audit.answerCue === undefined).toBe(settledAtTheDoor);
			}
	});

	it("deepens the peel on Elite and Champion only", () => {
		const stripGates = Object.entries(GATE_AUDITS)
			.filter(([, audits]) => auditExtraPeelShare(audits) > 0)
			.map(([gate]) => Number(gate));
		expect(stripGates).toEqual([11, 12]);
	});
});

describe("auditScoreShare", () => {
	it("leaves a share alone when no audit touches it", () => {
		expect(auditScoreShare(auditsForGate(2), 0.5)).toBe(0.5);
		expect(auditScoreShare(auditsForGate(7), 0.5)).toBe(0.5);
	});
});

describe("the memory leak", () => {
	const volcano = auditsForGate(9);

	it("taxes every poll, more on a miss", () => {
		expect(auditBurnKb(volcano, false)).toBe(16);
		expect(auditBurnKb(volcano, true)).toBe(32);
	});

	it("charges nothing at a gate without it", () => {
		expect(auditBurnKb(auditsForGate(5), true)).toBe(0);
	});
});

describe("the paid-action audits", () => {
	it("doubles every fee at Cost Overrun", () => {
		expect(auditFeeMultiplier(auditsForGate(3))).toBe(2);
	});

	it("leaves fees alone everywhere else", () => {
		expect(auditFeeMultiplier(auditsForGate(4))).toBe(1);
		expect(auditFeeMultiplier([])).toBe(1);
	});

	it("multiplies stacked overruns rather than taking the first", () => {
		const doubled = auditsForGate(3);
		expect(auditFeeMultiplier([...doubled, ...doubled])).toBe(4);
	});

	it("freezes the paid actions at Feature Freeze", () => {
		expect(auditsFreezeManualEffects(auditsForGate(6))).toBe(true);
		expect(auditsFreezeManualEffects(auditsForGate(3))).toBe(false);
		expect(auditsFreezeManualEffects(auditsForGate(10))).toBe(false);
	});
});

describe("read-only", () => {
	it("shuts the shop at its own gate only", () => {
		expect(auditsCloseShop(auditsForGate(5))).toBe(true);
		expect(auditsCloseShop(auditsForGate(6))).toBe(false);
	});
});

describe("the timeout", () => {
	it("clocks the window's first polls and frees the rest", () => {
		expect(auditTimeLimitMs(auditsForGate(8), 0)).toBe(30_000);
		expect(auditTimeLimitMs(auditsForGate(8), 2)).toBe(30_000);
		expect(auditTimeLimitMs(auditsForGate(8), 3)).toBeUndefined();
	});

	it("tightens rather than replaces when two would stack", () => {
		const stacked = [...auditsForGate(8), ...auditsForGate(12)];
		expect(auditTimeLimitMs(stacked, 0)).toBe(20_000);
	});

	it("leaves an unclocked gate free", () => {
		expect(auditTimeLimitMs(auditsForGate(9), 0)).toBeUndefined();
	});
});

describe("the configs an audit takes offline", () => {
	const build = [CONFIGS.js, CONFIGS.eslint, CONFIGS.agentsMd];
	const window = 15;
	const idsAcrossWindow = (audits: ReturnType<typeof auditsForGate>) =>
		[0, 1, 2, 3, 4].map(
			(answered) => offlineConfigsFor(build, audits, window, answered)[0]?.id
		);

	describe("Dependency Outage — one config, all attempt", () => {
		const outage = auditsForGate(4);

		it("takes one installed config down", () => {
			expect(build).toContain(offlineConfigsFor(build, outage, window, 0)[0]);
		});

		it("holds the same config for every poll of the attempt", () => {
			expect(new Set(idsAcrossWindow(outage)).size).toBe(1);
		});

		it("answers to the build, not the order it was bought in", () => {
			expect(
				offlineConfigsFor([...build].reverse(), outage, window, 0)
			).toEqual(offlineConfigsFor(build, outage, window, 0));
		});

		it("re-rolls for the next attempt, since its window starts later", () => {
			const attempts = [0, 5, 10, 15, 20, 25].map(
				(start) => offlineConfigsFor(build, outage, start, 0)[0]?.id
			);
			expect(new Set(attempts).size).toBeGreaterThan(1);
		});
	});

	describe("Flaky Build — a fresh roll every poll", () => {
		const flaky = auditsForGate(8);

		it("moves during the window", () => {
			expect(new Set(idsAcrossWindow(flaky)).size).toBeGreaterThan(1);
		});

		it("gives the same poll the same answer twice — a reload is not a re-roll", () => {
			expect(offlineConfigsFor(build, flaky, window, 2)).toEqual(
				offlineConfigsFor(build, flaky, window, 2)
			);
		});
	});

	describe("Rolling Outage — a different config each poll", () => {
		const rolling = auditsForGate(9);

		it("never repeats inside one lap of the build", () => {
			const lap = [0, 1, 2].map(
				(answered) => offlineConfigsFor(build, rolling, window, answered)[0]?.id
			);
			expect(new Set(lap).size).toBe(build.length);
		});

		it("wraps around once it runs out of configs", () => {
			expect(offlineConfigsFor(build, rolling, window, 3)).toEqual(
				offlineConfigsFor(build, rolling, window, 0)
			);
		});
	});

	describe("Breaking Change — the one you upgraded", () => {
		const breaking = auditsForGate(10);
		const levelled = [
			CONFIGS.js,
			{ ...CONFIGS.unitTests, level: 3 },
			CONFIGS.agentsMd,
		];

		it("takes the highest-level config, roll or no roll", () => {
			expect(offlineConfigsFor(levelled, breaking, window, 0)[0]?.id).toBe(
				"unit-tests"
			);
		});

		it("holds it for the whole window", () => {
			const ids = [0, 1, 2].map(
				(answered) =>
					offlineConfigsFor(levelled, breaking, window, answered)[0]?.id
			);
			expect(new Set(ids).size).toBe(1);
		});

		it("picks at random among configs tied at the top level", () => {
			const picks = [0, 5, 10, 15, 20, 25].map(
				(start) => offlineConfigsFor(build, breaking, start, 0)[0]?.id
			);
			expect(new Set(picks).size).toBeGreaterThan(1);
			for (const pick of picks)
				expect(build.map((config) => config.id)).toContain(pick);
		});

		it("still ignores the roll when one config stands above the rest", () => {
			const picks = [0, 5, 10, 15].map(
				(start) => offlineConfigsFor(levelled, breaking, start, 0)[0]?.id
			);
			expect(new Set(picks)).toEqual(new Set(["unit-tests"]));
		});
	});

	it("takes nothing at a gate whose audits leave the build alone", () => {
		expect(offlineConfigsFor(build, auditsForGate(5), window, 0)).toEqual([]);
	});

	it("takes nothing from a build with nothing in it", () => {
		expect(offlineConfigsFor([], auditsForGate(4), window, 0)).toEqual([]);
	});
});

describe("the mirror", () => {
	it("marks its gates and only its gates", () => {
		expect(mirrorsPolls(auditsForGate(7))).toBe(true);
		expect(mirrorsPolls(auditsForGate(11))).toBe(true);
		expect(mirrorsPolls(auditsForGate(9))).toBe(false);
	});

	it("charges the gate's full demand — a mirrored answer still rides a streak", () => {
		expect(auditDemandFactor(auditsForGate(7))).toBe(1);
	});
});

describe("the defeat device (ADR-028, repurposed)", () => {
	const device = [CONFIGS.volkswagenCi];

	it("suppresses exactly the gate's first audit", () => {
		expect(suppressedAuditFor(device, 7)?.id).toBe("mirrored");
		expect(liveAuditsFor(device, 7)).toEqual([]);
	});

	it("leaves the Champion's later audits in force", () => {
		expect(liveAuditsFor(device, 12).map((audit) => audit.id)).toEqual([
			"strip-15",
			"timeout-5",
		]);
	});

	it("removes the mirror's demand discount with the mirror", () => {
		expect(auditDemandFactor(liveAuditsFor(device, 7))).toBe(1);
	});

	it("suppresses nothing without the device installed", () => {
		expect(suppressedAuditFor([CONFIGS.js], 7)).toBeUndefined();
		expect(liveAuditsFor([CONFIGS.js], 7)).toEqual(auditsForGate(7));
	});
});

describe("nextAuditedGateFrom", () => {
	it("finds gate 3's Cost Overrun from the clean opening gates", () => {
		const next = nextAuditedGateFrom(0);
		expect(next?.gate).toBe(3);
		expect(next?.audit.id).toBe("cost-overrun");
	});

	it("returns the gate itself when it runs audits", () => {
		expect(nextAuditedGateFrom(7)?.gate).toBe(7);
	});

	it("finds nothing past the last audited gate", () => {
		expect(nextAuditedGateFrom(GATE_COUNT)).toBeUndefined();
	});
});
