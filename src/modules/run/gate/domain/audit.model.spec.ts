import { describe, expect, it } from "vitest";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import {
	type Audit,
	type AuditId,
	type AuditSchedule,
	auditAt,
	auditBurnKb,
	auditDemandFactor,
	auditFeeMultiplier,
	auditLabel,
	auditPaidActionLimit,
	auditRedactionPerPoll,
	auditsCloseShop,
	auditsForGate,
	auditsFreezeManualEffects,
	auditsHideCategory,
	auditScoreShare,
	auditTimeLimitMs,
	liveAuditsFor,
	mirrorsPolls,
	offlineConfigsFor,
	redactedOptionIdsFor,
	suppressedAuditFor,
} from "~/modules/run/gate/domain/audit.model";
import type { RunPoll } from "~/modules/run/run/domain/runPoll.model";
import {
	AUDIT_RANK,
	DEFAULT_AUDIT_SCHEDULE,
} from "~/modules/run/gate/domain/auditSchedule.model";
import { VICTORY_GATE } from "~/modules/run/run/domain/rules.model";

const at = (gate: number, ...ids: AuditId[]): readonly Audit[] =>
	ids.map((id) => auditAt(id, gate));

const scheduleWith = (gate: number, ...ids: AuditId[]): AuditSchedule => ({
	[gate]: ids,
});

describe("the audit roster", () => {
	const everyAudit = AUDIT_RANK.map((id) => auditAt(id, 11));

	it("holds sixteen rules, each reachable by its own id", () => {
		expect(AUDIT_RANK).toHaveLength(16);
		expect(new Set(AUDIT_RANK).size).toBe(16);
		for (const id of AUDIT_RANK) expect(auditAt(id, 11).id).toBe(id);
	});

	it("states every audit on the receipt, and cues the ones that change play", () => {
		for (const audit of everyAudit) {
			expect(audit.description.length).toBeGreaterThan(0);
			const settledAtTheDoor =
				audit.closesShop === true || audit.peelShareOnFail !== undefined;
			expect(audit.answerCue === undefined).toBe(settledAtTheDoor);
		}
	});

	it("pairs one code with one name, both ways", () => {
		const byCode = new Map(everyAudit.map((audit) => [audit.code, audit.name]));
		const byName = new Map(everyAudit.map((audit) => [audit.name, audit.code]));
		expect(byCode.size).toBe(byName.size);
		for (const audit of everyAudit) {
			expect(byCode.get(audit.code)).toBe(audit.name);
			expect(byName.get(audit.name)).toBe(audit.code);
		}
	});
});

describe("auditLabel", () => {
	it("reads an audit as its status line", () => {
		expect(auditLabel(auditAt("cost-overrun", 3))).toBe("402 Payment Required");
		expect(auditLabel(auditAt("timeout", 8))).toBe("408 Request Timeout");
	});

	it("keeps one status across an audit's per-gate dials", () => {
		expect(auditLabel(auditAt("timeout", 8))).toBe(
			auditLabel(auditAt("timeout", VICTORY_GATE))
		);
		expect(auditLabel(auditAt("strip", 11))).toBe(
			auditLabel(auditAt("strip", VICTORY_GATE))
		);
	});
});

describe("auditsForGate", () => {
	it("hydrates the schedule's ids into audits dialled for that gate", () => {
		const schedule = scheduleWith(VICTORY_GATE, "timeout", "strip");
		expect(
			auditsForGate(VICTORY_GATE, schedule).map((audit) => audit.id)
		).toEqual(["timeout", "strip"]);
		expect(auditsForGate(VICTORY_GATE, schedule)[0]?.timedPolls).toEqual({
			count: 5,
			limitMs: 20_000,
		});
	});

	it("leaves a gate the schedule says nothing about clean", () => {
		expect(auditsForGate(0, DEFAULT_AUDIT_SCHEDULE)).toEqual([]);
	});
});

describe("auditScoreShare", () => {
	it("leaves a share alone when no audit touches it", () => {
		expect(auditScoreShare([], 0.5)).toBe(0.5);
		expect(auditScoreShare(at(7, "mirrored"), 0.5)).toBe(0.5);
	});
});

describe("507 Insufficient Storage", () => {
	const leak = at(9, "memory-leak");

	it("taxes every poll, more on a miss", () => {
		expect(auditBurnKb(leak, false)).toBe(16);
		expect(auditBurnKb(leak, true)).toBe(32);
	});

	it("charges nothing at a gate without it", () => {
		expect(auditBurnKb(at(5, "not-found"), true)).toBe(0);
	});
});

describe("the paid-action audits", () => {
	it("doubles every fee at 402 Payment Required", () => {
		expect(auditFeeMultiplier(at(3, "cost-overrun"))).toBe(2);
	});

	it("leaves fees alone everywhere else", () => {
		expect(auditFeeMultiplier(at(4, "dependency-outage"))).toBe(1);
		expect(auditFeeMultiplier([])).toBe(1);
	});

	it("multiplies stacked overruns rather than taking the first", () => {
		const doubled = at(3, "cost-overrun");
		expect(auditFeeMultiplier([...doubled, ...doubled])).toBe(4);
	});

	it("freezes the paid actions at 403 Forbidden", () => {
		expect(auditsFreezeManualEffects(at(11, "feature-freeze"))).toBe(true);
		expect(auditsFreezeManualEffects(at(3, "cost-overrun"))).toBe(false);
		expect(auditsFreezeManualEffects(at(10, "too-many-requests"))).toBe(false);
	});
});

describe("405 Method Not Allowed", () => {
	it("shuts the shop where it lands and nowhere else", () => {
		expect(auditsCloseShop(at(6, "read-only"))).toBe(true);
		expect(auditsCloseShop(at(5, "not-found"))).toBe(false);
	});
});

describe("408 Request Timeout", () => {
	it("clocks the window's first polls and frees the rest", () => {
		const clocked = at(8, "timeout");
		expect(auditTimeLimitMs(clocked, 0)).toBe(30_000);
		expect(auditTimeLimitMs(clocked, 2)).toBe(30_000);
		expect(auditTimeLimitMs(clocked, 3)).toBeUndefined();
	});

	it("tightens with depth: 30s early, 25s at 10, 20s at the Champion", () => {
		expect(auditTimeLimitMs(at(8, "timeout"), 0)).toBe(30_000);
		expect(auditTimeLimitMs(at(10, "timeout"), 0)).toBe(25_000);
		expect(auditTimeLimitMs(at(VICTORY_GATE, "timeout"), 0)).toBe(20_000);
	});

	it("clocks five polls at the Champion rather than three", () => {
		expect(auditTimeLimitMs(at(VICTORY_GATE, "timeout"), 4)).toBe(20_000);
		expect(auditTimeLimitMs(at(8, "timeout"), 4)).toBeUndefined();
	});

	it("tightens rather than replaces when two would stack", () => {
		const stacked = [...at(8, "timeout"), ...at(VICTORY_GATE, "timeout")];
		expect(auditTimeLimitMs(stacked, 0)).toBe(20_000);
	});

	it("leaves an unclocked gate free", () => {
		expect(auditTimeLimitMs(at(9, "memory-leak"), 0)).toBeUndefined();
	});
});

describe("451 Unavailable For Legal Reasons", () => {
	const optioned = (count: number, id = "q1"): RunPoll => ({
		id,
		category: "js",
		question: "Which one?",
		answerType: "single",
		options: Array.from({ length: count }, (_, index) => ({
			id: `${id}-${index}`,
			label: `Option ${index}`,
			correct: index === 0,
		})),
	});

	const held = at(8, "legal-hold");

	it("seals the window's first polls and frees the rest", () => {
		expect(redactedOptionIdsFor(optioned(4), held, 0)).toHaveLength(2);
		expect(redactedOptionIdsFor(optioned(4), held, 2)).toHaveLength(2);
		expect(redactedOptionIdsFor(optioned(4), held, 3)).toEqual([]);
	});

	// The property the whole audit rests on: if redaction tracked correctness,
	// ????? would tell you the answer instead of hiding it.
	it("never seals an option because it is wrong", () => {
		const poll = optioned(4);
		const flipped: RunPoll = {
			...poll,
			options: poll.options.map((option) => ({
				...option,
				correct: !option.correct,
			})),
		};
		expect(redactedOptionIdsFor(poll, held, 0)).toEqual(
			redactedOptionIdsFor(flipped, held, 0)
		);
	});

	it("seals the same options when the same poll is read again", () => {
		expect(redactedOptionIdsFor(optioned(4), held, 0)).toEqual(
			redactedOptionIdsFor(optioned(4), held, 0)
		);
	});

	it("seals a different set on a different poll", () => {
		expect(redactedOptionIdsFor(optioned(4, "q1"), held, 0)).not.toEqual(
			redactedOptionIdsFor(optioned(4, "q2"), held, 0).map((id) =>
				id.replace("q2", "q1")
			)
		);
	});

	it("always leaves two options readable", () => {
		for (let count = 2; count <= 20; count++)
			expect(
				count - redactedOptionIdsFor(optioned(count), held, 0).length
			).toBeGreaterThanOrEqual(2);
	});

	it("seals nothing on a two-option poll, which would be a coin flip", () => {
		expect(redactedOptionIdsFor(optioned(2), held, 0)).toEqual([]);
	});

	it("seals nothing at a gate that never drew it", () => {
		expect(redactedOptionIdsFor(optioned(4), at(9, "memory-leak"), 0)).toEqual(
			[]
		);
	});

	it("seals the deeper count when two would stack", () => {
		const stacked = [...held, ...at(11, "legal-hold")];
		expect(auditRedactionPerPoll(stacked, 0)).toBe(2);
	});
});

describe("410 Gone", () => {
	it("deepens the peel more at the Champion than at Elite", () => {
		expect(auditAt("strip", 11).peelShareOnFail).toBe(0.1);
		expect(auditAt("strip", VICTORY_GATE).peelShareOnFail).toBe(0.15);
	});
});

describe("the configs an audit takes offline", () => {
	const build = [CONFIGS.js, CONFIGS.eslint, CONFIGS.agentsMd];
	const window = 15;
	const idsAcrossWindow = (audits: readonly Audit[]) =>
		[0, 1, 2, 3, 4].map(
			(answered) => offlineConfigsFor(build, audits, window, answered)[0]?.id
		);

	describe("424 Failed Dependency — one config, all attempt", () => {
		const outage = at(4, "dependency-outage");

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

	describe("502 Bad Gateway — a fresh roll every poll", () => {
		const flaky = at(8, "flaky-build");

		it("moves during the window", () => {
			expect(new Set(idsAcrossWindow(flaky)).size).toBeGreaterThan(1);
		});

		it("gives the same poll the same answer twice — a reload is not a re-roll", () => {
			expect(offlineConfigsFor(build, flaky, window, 2)).toEqual(
				offlineConfigsFor(build, flaky, window, 2)
			);
		});
	});

	describe("503 Service Unavailable — a different config each poll", () => {
		const rolling = at(9, "rolling-outage");

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

	describe("409 Conflict — the one you upgraded", () => {
		const breaking = at(10, "breaking-change");
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

	describe("426 Upgrade Required — the one you neglected", () => {
		const stale = at(11, "upgrade-required");
		const levelled = [
			{ ...CONFIGS.js, level: 3 },
			{ ...CONFIGS.eslint, level: 2 },
			CONFIGS.agentsMd,
		];

		it("takes the lowest-level config, the mirror of a breaking change", () => {
			expect(offlineConfigsFor(levelled, stale, window, 0)).toEqual([
				CONFIGS.agentsMd,
			]);
		});

		it("holds it for the whole window", () => {
			const ids = [0, 1, 2].map(
				(answered) =>
					offlineConfigsFor(levelled, stale, window, answered)[0]?.id
			);
			expect(new Set(ids).size).toBe(1);
		});

		it("takes one config, not the whole v1 build", () => {
			expect(offlineConfigsFor(build, stale, window, 0)).toHaveLength(1);
		});
	});

	it("takes nothing at a gate whose audits leave the build alone", () => {
		expect(offlineConfigsFor(build, at(5, "not-found"), window, 0)).toEqual([]);
	});

	it("takes nothing from a build with nothing in it", () => {
		expect(
			offlineConfigsFor([], at(4, "dependency-outage"), window, 0)
		).toEqual([]);
	});
});

describe("404 Not Found", () => {
	it("hides the category where it lands and nowhere else", () => {
		expect(auditsHideCategory(at(5, "not-found"))).toBe(true);
		expect(auditsHideCategory(at(4, "dependency-outage"))).toBe(false);
		expect(auditsHideCategory(at(7, "mirrored"))).toBe(false);
	});
});

describe("429 Too Many Requests", () => {
	it("allows one paid action for the window", () => {
		expect(auditPaidActionLimit(at(10, "too-many-requests"))).toBe(1);
	});

	it("leaves an unlimited gate unlimited", () => {
		expect(auditPaidActionLimit(at(3, "cost-overrun"))).toBeUndefined();
	});

	it("takes the tighter limit when two would stack", () => {
		const [rateLimited] = at(10, "too-many-requests");
		const stacked =
			rateLimited === undefined
				? []
				: [rateLimited, { ...rateLimited, paidActionLimit: 3 }];
		expect(auditPaidActionLimit(stacked)).toBe(1);
	});
});

describe("413 Payload Too Large", () => {
	const payload = at(VICTORY_GATE, "payload-too-large");

	it("charges nothing for a build inside the free width", () => {
		expect(auditBurnKb(payload, false, 12)).toBe(0);
	});

	it("charges every slot past the twelfth, on a right answer too", () => {
		expect(auditBurnKb(payload, false, 15)).toBe(24);
		expect(auditBurnKb(payload, true, 15)).toBe(24);
	});

	it("charges nothing at a gate without it", () => {
		expect(auditBurnKb(at(9, "memory-leak"), false, 24)).toBe(16);
	});
});

describe("the mirror", () => {
	it("marks its gates and only its gates", () => {
		expect(mirrorsPolls(at(7, "mirrored"))).toBe(true);
		expect(mirrorsPolls(at(11, "strip"))).toBe(false);
		expect(mirrorsPolls(at(9, "memory-leak"))).toBe(false);
	});

	it("charges the gate's full demand — a mirrored answer still rides a streak", () => {
		expect(auditDemandFactor(at(7, "mirrored"))).toBe(1);
	});
});

describe("the defeat device (ADR-028, repurposed)", () => {
	const device = [CONFIGS.volkswagenCi];

	it("suppresses exactly the gate's first audit", () => {
		const schedule = scheduleWith(7, "mirrored");
		expect(suppressedAuditFor(device, 7, schedule)?.id).toBe("mirrored");
		expect(liveAuditsFor(device, 7, schedule)).toEqual([]);
	});

	it("leaves the Champion's later audits in force", () => {
		expect(
			liveAuditsFor(device, VICTORY_GATE, DEFAULT_AUDIT_SCHEDULE).map(
				(audit) => audit.id
			)
		).toEqual(["strip", "payload-too-large"]);
	});

	it("suppresses nothing without the device installed", () => {
		const schedule = scheduleWith(7, "mirrored");
		expect(suppressedAuditFor([CONFIGS.js], 7, schedule)).toBeUndefined();
		expect(liveAuditsFor([CONFIGS.js], 7, schedule)).toEqual(
			auditsForGate(7, schedule)
		);
	});
});
