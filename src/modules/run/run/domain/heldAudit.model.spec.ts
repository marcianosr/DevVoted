import { describe, expect, it } from "vitest";

import { poolForGate } from "~/modules/run/gate/domain/auditSchedule.model";
import {
	canRepackage,
	fireAudit,
	handAudit,
	isHeldAuditBand,
	isKept,
	isOpened,
	isSealed,
	keepPayload,
	landingGateFor,
	openAudit,
	payloadCountFor,
	repackage,
	repackageAvailable,
	takeAudit,
} from "~/modules/run/run/domain/heldAudit.model";
import { REPACKAGE_KB } from "~/modules/run/run/domain/rules.model";
import { clearGate, started } from "~/modules/run/run/domain/run.factory";
import type { HeldAudit, RunState } from "~/modules/run/run/domain/run.model";

const SEED = "64:2026-09-23";

/** The shop after gate 0: one sealed PERFECT audit in hand. */
const shopping = (): RunState => clearGate(started(["js"]));

const holding = (
	heldAudit: HeldAudit,
	extra: Partial<RunState> = {}
): RunState => ({
	...shopping(),
	...extra,
	heldAudit,
});

describe("handAudit (ADR-119: every clear hands a sealed audit)", () => {
	it("an OK clear hands a sealed audit that will open two", () => {
		expect(handAudit({}, "ok", 3)).toEqual({
			heldAudit: { band: "ok", gate: 3 },
			auditHandedAtGate: 3,
		});
		expect(payloadCountFor("ok")).toBe(2);
	});

	it("a HEALTHY and a PERFECT clear each hand one that opens one", () => {
		expect(handAudit({}, "healthy", 4).heldAudit).toEqual({
			band: "healthy",
			gate: 4,
		});
		expect(handAudit({}, "perfect", 5).heldAudit).toEqual({
			band: "perfect",
			gate: 5,
		});
		expect(payloadCountFor("healthy")).toBe(1);
		expect(payloadCountFor("perfect")).toBe(1);
	});

	it("a hold hands nothing and offers nothing", () => {
		expect(handAudit({}, "shaky", 3)).toEqual({});
		expect(
			handAudit({ heldAudit: { band: "ok", gate: 2 } }, "danger", 3)
		).toEqual({});
		expect(isHeldAuditBand("shaky")).toBe(false);
	});

	it("a clear while one is held leaves the held one alone and offers the new one", () => {
		const held = { band: "perfect", gate: 2, payload: "not-found" } as const;
		expect(handAudit({ heldAudit: held }, "healthy", 4)).toEqual({
			offeredAudit: { band: "healthy", gate: 4 },
			auditHandedAtGate: 4,
		});
	});

	it("isSealed reads neither choices nor payload, isKept narrows to a payload", () => {
		const sealed = { band: "ok", gate: 1 } as const;
		const choosing = { ...sealed, choices: ["not-found", "timeout"] } as const;
		const kept = { ...sealed, payload: "not-found" } as const;
		expect(isSealed(sealed)).toBe(true);
		expect(isOpened(sealed)).toBe(false);
		expect(isSealed(choosing)).toBe(false);
		expect(isKept(choosing)).toBe(false);
		expect(isKept(kept)).toBe(true);
	});
});

describe("the landing pool (ADR-119)", () => {
	it("opens from the first audited pool below it, and from the gate ahead once past it", () => {
		expect(landingGateFor(0)).toBe(3);
		expect(landingGateFor(2)).toBe(3);
		expect(landingGateFor(8)).toBe(9);
	});
});

describe("openAudit", () => {
	it("opening a HEALTHY audit at gate 0 draws one payload from pool A, the first audited pool", () => {
		const opened = openAudit(holding({ band: "healthy", gate: 0 }), SEED);
		expect(opened.heldAudit?.payload).toBeDefined();
		expect(opened.heldAudit?.choices).toBeUndefined();
		expect(poolForGate(3)).toContain(opened.heldAudit?.payload);
	});

	it("opening an OK audit draws two distinct choices and keeps none yet", () => {
		const opened = openAudit(holding({ band: "ok", gate: 0 }), SEED);
		expect(opened.heldAudit?.payload).toBeUndefined();
		expect(opened.heldAudit?.choices).toHaveLength(2);
		expect(new Set(opened.heldAudit?.choices).size).toBe(2);
	});

	it("opening at gate 8 draws from the gate-9 pool, the lowest a rival can stand on", () => {
		const deep = holding({ band: "perfect", gate: 7 }, { gatesCleared: 8 });
		const opened = openAudit(deep, SEED);
		expect(poolForGate(9)).toContain(opened.heldAudit?.payload);
	});

	it("the same seed opens the same payload; other runs' seeds do not all agree", () => {
		const sealed = holding({ band: "healthy", gate: 0 });
		expect(openAudit(sealed, SEED)).toEqual(openAudit(sealed, SEED));
		const payloads = new Set(
			Array.from(
				{ length: 12 },
				(_, run) => openAudit(sealed, `${run}:2026-09-23`).heldAudit?.payload
			)
		);
		expect(payloads.size).toBeGreaterThan(1);
	});

	it("opening twice changes nothing", () => {
		const opened = openAudit(holding({ band: "healthy", gate: 0 }), SEED);
		expect(openAudit(opened, SEED)).toBe(opened);
	});

	it("opens nothing when nothing is held", () => {
		const empty = { ...shopping(), heldAudit: undefined };
		expect(openAudit(empty, SEED)).toBe(empty);
	});
});

describe("keepPayload", () => {
	const choosing = (): RunState =>
		holding({ band: "ok", gate: 0, choices: ["not-found", "timeout"] });

	it("settles an OK choice and clears the alternatives", () => {
		expect(keepPayload(choosing(), "timeout").heldAudit).toEqual({
			band: "ok",
			gate: 0,
			payload: "timeout",
		});
	});

	it("refuses an audit that was not offered", () => {
		const state = choosing();
		expect(keepPayload(state, "read-only")).toBe(state);
	});

	it("refuses once the audit is kept or still sealed", () => {
		const kept = holding({ band: "ok", gate: 0, payload: "timeout" });
		expect(keepPayload(kept, "timeout")).toBe(kept);
		const sealed = holding({ band: "ok", gate: 0 });
		expect(keepPayload(sealed, "timeout")).toBe(sealed);
	});
});

describe("takeAudit", () => {
	it("swaps the offered audit into the hand and drops the held one, opened or not", () => {
		const offered = { band: "healthy", gate: 1 } as const;
		const taken = takeAudit(
			holding(
				{ band: "ok", gate: 0, payload: "not-found" },
				{ offeredAudit: offered }
			)
		);
		expect(taken.heldAudit).toEqual(offered);
		expect(taken.offeredAudit).toBeUndefined();
	});

	it("changes nothing when nothing is offered", () => {
		const state = holding({ band: "ok", gate: 0 });
		expect(takeAudit(state)).toBe(state);
	});
});

describe("repackage", () => {
	const kept = (extra: Partial<RunState> = {}): RunState =>
		holding(
			{ band: "healthy", gate: 0, payload: "not-found" },
			{ storage: 100, ...extra }
		);

	it("is sold only while an opened audit is in hand", () => {
		expect(repackageAvailable(holding({ band: "healthy", gate: 0 }))).toBe(
			false
		);
		expect(repackageAvailable(kept())).toBe(true);
		expect(repackageAvailable({ ...shopping(), heldAudit: undefined })).toBe(
			false
		);
	});

	it("redraws the band's count without repeating what was in hand, for 32 KB", () => {
		const repackaged = repackage(kept(), SEED);
		expect(repackaged.heldAudit?.payload).toBeDefined();
		expect(repackaged.heldAudit?.payload).not.toBe("not-found");
		expect(repackaged.storage).toBe(100 - REPACKAGE_KB);
		expect(repackaged.repackagedThisShop).toBe(true);
	});

	it("on a kept OK audit hands two fresh choices to choose from again", () => {
		const repackaged = repackage(
			holding({ band: "ok", gate: 0, payload: "not-found" }, { storage: 100 }),
			SEED
		);
		expect(repackaged.heldAudit?.choices).toHaveLength(2);
		expect(repackaged.heldAudit?.choices).not.toContain("not-found");
		expect(repackaged.heldAudit?.payload).toBeUndefined();
	});

	it("refuses a sealed audit, an empty wallet, and a second try in one shop", () => {
		const sealed = holding({ band: "healthy", gate: 0 }, { storage: 100 });
		expect(repackage(sealed, SEED)).toBe(sealed);
		const broke = kept({ storage: REPACKAGE_KB - 1 });
		expect(canRepackage(broke)).toBe(false);
		expect(repackage(broke, SEED)).toBe(broke);
		const used = repackage(kept(), SEED);
		expect(canRepackage(used)).toBe(false);
		expect(repackage(used, SEED)).toBe(used);
	});
});

describe("fireAudit", () => {
	it("firing a kept payload empties the hand", () => {
		const fired = fireAudit(
			holding({ band: "healthy", gate: 0, payload: "not-found" })
		);
		expect(fired.heldAudit).toBeUndefined();
	});

	it("firing slides the offered audit in, sealed", () => {
		const fired = fireAudit(
			holding(
				{ band: "healthy", gate: 0, payload: "not-found" },
				{ offeredAudit: { band: "ok", gate: 1 } }
			)
		);
		expect(fired.heldAudit).toEqual({ band: "ok", gate: 1 });
		expect(fired.offeredAudit).toBeUndefined();
	});

	it("refuses a sealed or still-choosing audit, and an empty hand", () => {
		const sealed = holding({ band: "healthy", gate: 0 });
		expect(fireAudit(sealed)).toBe(sealed);
		const choosing = holding({
			band: "ok",
			gate: 0,
			choices: ["not-found", "timeout"],
		});
		expect(fireAudit(choosing)).toBe(choosing);
		const empty = { ...shopping(), heldAudit: undefined };
		expect(fireAudit(empty)).toBe(empty);
	});
});
