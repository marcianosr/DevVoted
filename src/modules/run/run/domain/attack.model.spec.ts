import { describe, expect, it } from "vitest";

import {
	armAttack,
	fireAudit,
	payloadCountFor,
} from "~/modules/run/run/domain/attack.model";
import { clearGate, started } from "~/modules/run/run/domain/run.factory";

describe("armAttack (ADR-099: one attack, held for the run)", () => {
	it("arms a single-payload attack on a HEALTHY clear", () => {
		expect(armAttack(undefined, "healthy")).toEqual({ band: "healthy" });
	});

	it("arms a two-payload attack on a PERFECT clear", () => {
		expect(armAttack(undefined, "perfect")).toEqual({ band: "perfect" });
	});

	it("arms nothing on an OK clear — a thin clear is not ammunition", () => {
		expect(armAttack(undefined, "ok")).toBeUndefined();
	});

	it("upgrades a held HEALTHY attack when a PERFECT clear follows", () => {
		expect(armAttack({ band: "healthy" }, "perfect")).toEqual({
			band: "perfect",
		});
	});

	it("never downgrades a held PERFECT attack, and never stacks a second", () => {
		const held = { band: "perfect" } as const;
		expect(armAttack(held, "healthy")).toBe(held);
		expect(armAttack(held, "perfect")).toBe(held);
	});

	it("keeps whatever is held through an OK clear", () => {
		const held = { band: "healthy" } as const;
		expect(armAttack(held, "ok")).toBe(held);
	});
});

describe("payloadCountFor", () => {
	it("offers one payload for HEALTHY and a choice of two for PERFECT", () => {
		expect(payloadCountFor("healthy")).toBe(1);
		expect(payloadCountFor("perfect")).toBe(2);
	});
});

describe("fireAudit", () => {
	it("spends the armed attack from a prep phase", () => {
		const armed = clearGate(started(["js"]));
		expect(armed.status).toBe("rewarding");
		expect(armed.attack).toBeDefined();

		expect(fireAudit(armed).attack).toBeUndefined();
	});

	it("is a no-op with nothing armed, so a double press changes nothing", () => {
		const unarmed = { ...clearGate(started(["js"])), attack: undefined };
		expect(fireAudit(unarmed)).toBe(unarmed);
	});

	it("is refused mid-window — the picker lives on prep", () => {
		const answering = {
			...started(["js"]),
			attack: { band: "healthy" } as const,
		};
		expect(fireAudit(answering)).toBe(answering);
	});
});
