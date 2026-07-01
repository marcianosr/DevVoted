import { describe, expect, it } from "vitest";

import { createMockConfig } from "~/domains/economy/models/config.mock";

import {
	configAppliesToPollCategory,
	getConfigsApplyingToPollCategory,
} from "./pollConfigs";

describe(configAppliesToPollCategory.name, () => {
	it("applies to any category when the config has no target categories", () => {
		// The `.includes` case: works on every multiple-choice poll.
		const includesConfig = createMockConfig({ id: "includes-config" });
		expect(configAppliesToPollCategory(includesConfig, "react")).toBe(true);
		expect(configAppliesToPollCategory(includesConfig, "css")).toBe(true);
	});

	it("applies to any category when target categories is empty", () => {
		const config = createMockConfig({ targetCategories: [] });
		expect(configAppliesToPollCategory(config, "java")).toBe(true);
	});

	it("applies when the poll's category is targeted", () => {
		const cssConfig = createMockConfig({ targetCategories: ["css"] });
		expect(configAppliesToPollCategory(cssConfig, "css")).toBe(true);
	});

	it("does not apply when the poll's category is not targeted", () => {
		const cssConfig = createMockConfig({ targetCategories: ["css"] });
		expect(configAppliesToPollCategory(cssConfig, "react")).toBe(false);
	});
});

describe(getConfigsApplyingToPollCategory.name, () => {
	it("keeps universal and category-matching configs, drops the rest", () => {
		const includes = createMockConfig({ id: "includes-config" });
		const cssOnly = createMockConfig({ id: "css", targetCategories: ["css"] });
		const jsOnly = createMockConfig({ id: "js", targetCategories: ["js"] });

		const applying = getConfigsApplyingToPollCategory(
			[includes, cssOnly, jsOnly],
			"css"
		);

		expect(applying.map((config) => config.id)).toEqual([
			"includes-config",
			"css",
		]);
	});

	it("returns an empty list when nothing applies", () => {
		const jsOnly = createMockConfig({ targetCategories: ["js"] });
		expect(getConfigsApplyingToPollCategory([jsOnly], "python")).toEqual([]);
	});
});
