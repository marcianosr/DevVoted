import { describe, expect, it } from "vitest";

import {
	CONFIG_GROUP_ORDER,
	type ConfigGroup,
	configGroupOf,
} from "~/modules/run/config/domain/configGroup.model";
import {
	CONFIGS,
	CONFIG_LIST,
} from "~/modules/run/config/domain/configRoster.model";

const idsIn = (group: ConfigGroup): readonly string[] =>
	CONFIG_LIST.filter((config) => configGroupOf(config) === group).map(
		(config) => config.id
	);

describe("configGroupOf", () => {
	it("reads a focus config as coverage", () => {
		expect(configGroupOf(CONFIGS.ts)).toBe("coverage");
	});

	it("reads a config that only adds coverage as coverage", () => {
		expect(configGroupOf(CONFIGS.codeCoverage)).toBe("coverage");
	});

	it("groups a coverage config by what it pays, not by the cost it carries", () => {
		expect(configGroupOf(CONFIGS.coldStart)).toBe("coverage");
		expect(configGroupOf(CONFIGS.overclock)).toBe("coverage");
		expect(configGroupOf(CONFIGS.deprecated)).toBe("coverage");
	});

	it("reads a config that pays KB as storage", () => {
		expect(configGroupOf(CONFIGS.indexedDb)).toBe("storage");
		expect(configGroupOf(CONFIGS.mooresLaw)).toBe("storage");
	});

	it("reads a config that takes KB off a bill as storage", () => {
		expect(configGroupOf(CONFIGS.yagni)).toBe("storage");
		expect(configGroupOf(CONFIGS.freemium)).toBe("storage");
	});

	it("reads a config that reveals or narrows a poll as answer help", () => {
		expect(configGroupOf(CONFIGS.eslint)).toBe("answerHelp");
		expect(configGroupOf(CONFIGS.telemetry)).toBe("answerHelp");
		expect(configGroupOf(CONFIGS.prefetch)).toBe("answerHelp");
	});

	it("reads a config you commit to before you know as risk", () => {
		expect(configGroupOf(CONFIGS.strict)).toBe("risk");
		expect(configGroupOf(CONFIGS.sla)).toBe("risk");
		expect(configGroupOf(CONFIGS.planningPoker)).toBe("risk");
	});

	it("reads a config that answers for a bad outcome as risk", () => {
		expect(configGroupOf(CONFIGS.tryCatch)).toBe("risk");
		expect(configGroupOf(CONFIGS.volkswagenCi)).toBe("risk");
	});

	it("drops a config that pays in none of those into misc", () => {
		expect(configGroupOf(CONFIGS.dependabot)).toBe("misc");
	});
});

describe("the roster partition", () => {
	it("gives every config exactly one group", () => {
		const grouped = CONFIG_GROUP_ORDER.flatMap(idsIn);

		expect(grouped).toHaveLength(CONFIG_LIST.length);
		expect(new Set(grouped).size).toBe(CONFIG_LIST.length);
	});

	it("holds the roster at the counts each group is designed for", () => {
		expect(idsIn("coverage")).toHaveLength(21);
		expect(idsIn("storage")).toHaveLength(8);
		expect(idsIn("answerHelp")).toHaveLength(8);
		expect(idsIn("risk")).toHaveLength(5);
	});

	it("leaves only the four configs misc is meant to hold", () => {
		expect(idsIn("misc")).toEqual([
			"yarn-lock",
			"wtfpl",
			"dependabot",
			"vendor-lock-in",
		]);
	});
});
