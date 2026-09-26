import { describe, expect, it } from "vitest";

import {
	CONFIGS,
	CONFIG_LIST,
	readsMissedHistory,
} from "~/modules/run/config/domain/configRoster.model";

describe("readsMissedHistory", () => {
	it("is false for a build no config of which reads a poll's history", () => {
		expect(readsMissedHistory([])).toBe(false);
		expect(readsMissedHistory([CONFIGS.js, CONFIGS.agentsMd])).toBe(false);
	});

	it("is true once the build holds Regression Test", () => {
		expect(readsMissedHistory([CONFIGS.js, CONFIGS.regressionTest])).toBe(true);
	});

	it("resolves against the roster rather than the embedded shape", () => {
		expect(readsMissedHistory([{ id: "regression-test" }])).toBe(true);
	});

	it("ignores an id the roster no longer carries", () => {
		expect(readsMissedHistory([{ id: "bulbasaur" }])).toBe(false);
	});
});

describe("the roster", () => {
	it("gives every config a unique id", () => {
		const ids = CONFIG_LIST.map((config) => config.id);

		expect(new Set(ids).size).toBe(ids.length);
	});

	it("gives every config a unique label", () => {
		const labels = CONFIG_LIST.map((config) => config.label);

		expect(new Set(labels).size).toBe(labels.length);
	});
});
