import { describe, expect, it } from "vitest";

import {
	publicBuildOf,
	publicWeightOf,
} from "~/modules/run/build/domain/publicBuild.model";

const held = (id: string, level: number | null = null, minified = false) => ({
	id,
	level,
	minified,
});

describe("publicBuildOf", () => {
	it("reads the label and weight from the roster, never the snapshot", () => {
		const build = publicBuildOf({
			configs: [held("cache", 2)],
			vendorLockedConfigId: null,
		});

		expect(build.configs).toEqual([
			{ id: "cache", label: "Cache", slots: 4, level: 2 },
		]);
		expect(JSON.stringify(build)).not.toContain("description");
	});

	it("leaves the version off a config that was never upgraded", () => {
		const [config] = publicBuildOf({
			configs: [held("ts")],
			vendorLockedConfigId: null,
		}).configs;

		expect(config).not.toHaveProperty("level");
	});

	it("halves the weight of a minified config", () => {
		const [config] = publicBuildOf({
			configs: [held("cache", null, true)],
			vendorLockedConfigId: null,
		}).configs;

		expect(config.slots).toBe(2);
	});

	it("drops a config the roster no longer knows", () => {
		const build = publicBuildOf({
			configs: [held("retired-config"), held("ts")],
			vendorLockedConfigId: null,
		});

		expect(build.configs.map((config) => config.id)).toEqual(["ts"]);
	});

	it("keeps the vendor lock only while the config it names is installed", () => {
		const stored = { configs: [held("cache"), held("ts")] };

		expect(
			publicBuildOf({ ...stored, vendorLockedConfigId: "cache" })
				.vendorLockedConfigId
		).toBe("cache");
		expect(
			publicBuildOf({ ...stored, vendorLockedConfigId: "eslint" })
		).not.toHaveProperty("vendorLockedConfigId");
	});
});

describe("publicWeightOf", () => {
	it("sums the slots of what is installed", () => {
		const build = publicBuildOf({
			configs: [held("cache"), held("ts"), held("vendor-lock-in")],
			vendorLockedConfigId: null,
		});

		expect(publicWeightOf(build)).toBe(9);
	});
});
