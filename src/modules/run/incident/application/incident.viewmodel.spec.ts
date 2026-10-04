import { describe, expect, it } from "vitest";

import {
	attackOfferViewFor,
	incidentFeedRowFor,
	rivalIdsFor,
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
			sentBy: { userId: "red", name: "Red", you: false },
			target: { userId: "misty", name: "Misty", you: false },
			code: 404,
			name: "Not Found",
			gate: 6,
			status: "locked",
			own: false,
		});
	});

	it("hands over each party's face, and marks the viewer's own", () => {
		const faced = incidentFeedRowFor(
			{
				...row,
				sentBy: { ...row.sentBy, photoUrl: "/editors/red.png" },
				target: { ...row.target, borderUrl: "/borders/gold.png" },
			},
			"red"
		);

		expect(faced.sentBy).toEqual({
			userId: "red",
			name: "Red",
			photoUrl: "/editors/red.png",
			you: true,
		});
		expect(faced.target.borderUrl).toBe("/borders/gold.png");
	});

	it("rings a row the viewer fired or was hit by", () => {
		expect(incidentFeedRowFor(row, "red").own).toBe(true);
		expect(incidentFeedRowFor(row, "misty").own).toBe(true);
	});
});

describe("attackOfferViewFor", () => {
	it("states the audit it would file, read at the gate it would land on", () => {
		expect(
			attackOfferViewFor({
				targetRunId: 2,
				targetUserId: "misty",
				name: "Misty",
				targetGate: 9,
				build: MISTY_BUILD,
				auditId: "timeout",
			})
		).toMatchObject({
			targetRunId: 2,
			userId: "misty",
			name: "Misty",
			gate: 9,
			build: MISTY_BUILD,
			audit: { auditId: "timeout", code: 408, name: "Request Timeout" },
		});
	});
});

describe("rivalIdsFor", () => {
	const fired = {
		...row,
		id: 6,
		sentBy: { id: "red", name: "Red" },
		target: { id: "brock", name: "Brock" },
	};
	const hitBy = {
		...row,
		id: 7,
		sentBy: { id: "misty", name: "Misty" },
		target: { id: "red", name: "Red" },
	};

	it("names who the viewer fired at and who fired at them", () => {
		expect(rivalIdsFor([fired, hitBy], "red")).toEqual(["brock", "misty"]);
	});

	it("names a rival once however many audits they traded", () => {
		expect(rivalIdsFor([row, fired, { ...fired, id: 8 }], "red")).toEqual([
			"misty",
			"brock",
		]);
	});

	it("leaves out every incident the viewer is not part of", () => {
		expect(rivalIdsFor([row, fired], "koga")).toEqual([]);
	});
});

describe("an offer carries the rival's open build (ADR-101)", () => {
	it("ships the public build straight through to the card", () => {
		const offer = attackOfferViewFor({
			targetRunId: 2,
			targetUserId: "misty",
			name: "Misty",
			targetGate: 9,
			build: MISTY_BUILD,
			auditId: "timeout",
		});

		expect(offer.build).toEqual(MISTY_BUILD);
	});
});
