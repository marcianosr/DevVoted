import { describe, expect, it } from "vitest";

import {
	publicBuildChipsFor,
	publicConfigCardFor,
	publicConfigChipFor,
} from "~/modules/run/build/application/publicBuild.viewmodel";
import { publicSpaceOf } from "~/modules/run/build/domain/publicBuild.model";

const MISTY_BUILD = {
	configs: [
		{ id: "ts", label: ".ts", slots: 1, level: 4 },
		{ id: "cache", label: "Cache", slots: 4 },
	],
	vendorLockedConfigId: "cache",
};

describe("publicConfigChipFor (ADR-101)", () => {
	it("draws name, weight and version with nothing to press", () => {
		expect(publicConfigChipFor(MISTY_BUILD.configs[0])).toEqual({
			name: ".ts",
			slots: 1,
			version: 4,
			badges: [],
		});
	});

	it("leaves the version off a config never upgraded", () => {
		expect(publicConfigChipFor(MISTY_BUILD.configs[1])).not.toHaveProperty(
			"version"
		);
	});

	it("badges the config the player vendor-locked as locked in", () => {
		expect(publicConfigChipFor(MISTY_BUILD.configs[1], "cache").badges).toEqual(
			[{ label: "locked in", color: "saffron" }]
		);
	});
});

describe("publicSpaceOf", () => {
	it("rents the rung the billable weight fits in", () => {
		expect(publicSpaceOf({ configs: [{ id: "a", label: "A", slots: 5 }] })).toBe(
			6
		);
	});

	it("exempts the vendor-locked config, as a live build does", () => {
		expect(publicSpaceOf(MISTY_BUILD)).toBe(4);
	});

	it("rents the smallest rung for a bare build", () => {
		expect(publicSpaceOf({ configs: [] })).toBe(4);
	});

	it("holds a build past the top rung at the top rung", () => {
		expect(
			publicSpaceOf({ configs: [{ id: "a", label: "A", slots: 64 }] })
		).toBe(32);
	});
});

describe("publicConfigCardFor", () => {
	it("carries the description and the version ceiling so the card can expand", () => {
		expect(publicConfigCardFor(MISTY_BUILD.configs[0]).info).toEqual({
			description: "TypeScript polls earn 2× coverage.",
			slots: 1,
			maxVersion: 5,
			version: 4,
		});
	});

	it("reads the description at the version the player actually runs", () => {
		const atFirst = publicConfigCardFor({
			id: "ts",
			label: ".ts",
			slots: 1,
			level: 1,
		});

		expect(atFirst.info?.description).not.toBe(
			publicConfigCardFor(MISTY_BUILD.configs[0]).info?.description
		);
	});

	it("leaves a config the roster no longer knows without an expandable body", () => {
		expect(
			publicConfigCardFor({ id: "retired", label: "Retired", slots: 1 }).info
		).toBeUndefined();
	});

	it("quotes no sell price, because a visitor cannot sell another build", () => {
		expect(publicConfigCardFor(MISTY_BUILD.configs[0]).info).not.toHaveProperty(
			"sellPrice"
		);
	});

	it("states no run note, which is state the visitor may not read", () => {
		expect(publicConfigCardFor(MISTY_BUILD.configs[0]).info).not.toHaveProperty(
			"note"
		);
	});
});

describe("publicBuildChipsFor", () => {
	it("turns a whole build into chips, badging only the locked one", () => {
		expect(publicBuildChipsFor(MISTY_BUILD)).toEqual([
			{ name: ".ts", slots: 1, version: 4, badges: [] },
			{
				name: "Cache",
				slots: 4,
				badges: [{ label: "locked in", color: "saffron" }],
			},
		]);
	});

	it("draws nothing for a bare build", () => {
		expect(publicBuildChipsFor({ configs: [] })).toEqual([]);
	});
});
