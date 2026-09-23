import { describe, expect, it } from "vitest";

import {
	ATTACK_DEALING,
	ATTACK_UNARMED,
	attackOfferViewFor,
	attackPanelFor,
	incidentFeedRowFor,
	rivalChipFor,
} from "~/modules/run/incident/application/incident.viewmodel";

const MISTY_BUILD = {
	configs: [
		{ id: "ts", label: ".ts", slots: 1, level: 4 },
		{ id: "cache", label: "Cache", slots: 4 },
	],
	vendorLockedConfigId: "cache",
};

const row = {
	id: 5,
	sentBy: { id: "red", name: "Red" },
	target: { id: "misty", name: "Misty" },
	targetGate: 6,
	auditId: "not-found" as const,
	status: "locked" as const,
	createdAt: new Date("2026-09-22T09:00:00"),
};

describe("incidentFeedRowFor", () => {
	it("names both parties, the audit and the gate it lands on", () => {
		expect(incidentFeedRowFor(row, "brock")).toEqual({
			id: 5,
			sentBy: "Red",
			target: "Misty",
			code: 404,
			name: "Not Found",
			gate: 6,
			gateName: "Soul",
			status: "locked",
			own: false,
		});
	});

	it("rings a row the viewer fired or was hit by", () => {
		expect(incidentFeedRowFor(row, "red").own).toBe(true);
		expect(incidentFeedRowFor(row, "misty").own).toBe(true);
	});
});

describe("attackOfferViewFor", () => {
	it("labels each payload for the press that fires it", () => {
		expect(
			attackOfferViewFor({
				targetRunId: 2,
				targetUserId: "misty",
				name: "Misty",
				targetGate: 9,
				build: MISTY_BUILD,
				payloads: ["timeout", "memory-leak"],
			})
		).toEqual({
			targetRunId: 2,
			name: "Misty",
			gate: 9,
			gateName: "Volcano",
			build: MISTY_BUILD,
			payloads: [
				{ auditId: "timeout", code: 408, name: "Request Timeout" },
				{ auditId: "memory-leak", code: 507, name: "Insufficient Storage" },
			],
		});
	});
});

describe("attackPanelFor", () => {
	it("keeps the last filing's note once the credit is spent", () => {
		const panel = attackPanelFor(null, null, null, "filed 502 against Brock");
		expect(panel.empty).toBe(ATTACK_UNARMED);
		expect(panel.note).toBe("filed 502 against Brock");
	});

	it("says it is still dealing while armed with no offers read yet", () => {
		expect(attackPanelFor({ band: "healthy" }, null).empty).toBe(
			ATTACK_DEALING
		);
	});
});

describe("rivalChipFor (ADR-100)", () => {
	it("draws name, weight and version with nothing to press", () => {
		expect(rivalChipFor(MISTY_BUILD.configs[0])).toEqual({
			name: ".ts",
			slots: 1,
			version: 4,
			badges: [],
		});
	});

	it("leaves the version off a config never upgraded", () => {
		expect(rivalChipFor(MISTY_BUILD.configs[1])).not.toHaveProperty("version");
	});

	it("badges the config the rival vendor-locked as locked in", () => {
		expect(rivalChipFor(MISTY_BUILD.configs[1], "cache").badges).toEqual([
			{ label: "locked in", color: "saffron" },
		]);
	});
});

describe("attackPanelFor lists the rival's build", () => {
	it("hands each rival row its build as chips", () => {
		const offer = attackOfferViewFor({
			targetRunId: 2,
			targetUserId: "misty",
			name: "Misty",
			targetGate: 9,
			build: MISTY_BUILD,
			payloads: ["timeout"],
		});

		const [rival] = attackPanelFor({ band: "healthy" }, [offer]).rivals;

		expect(rival.build.map((chip) => chip.name)).toEqual([".ts", "Cache"]);
	});
});
