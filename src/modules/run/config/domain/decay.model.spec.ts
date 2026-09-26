import { describe, expect, it } from "vitest";

import type { Config } from "~/modules/run/config/domain/config.model";
import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import { decayOnClear } from "~/modules/run/config/domain/decay.model";

describe("decayOnClear", () => {
	it("fades a decaying config's multiplier by its step", () => {
		const { configs, deleted } = decayOnClear([CONFIGS.deprecated]);
		expect(configs).toEqual([
			{ ...CONFIGS.deprecated, coverageMultiplier: 2.5 },
		]);
		expect(deleted).toEqual([]);
	});

	it("returns the very same array when nothing on it decays", () => {
		const build = [CONFIGS.js, CONFIGS.agentsMd];
		const { configs, deleted } = decayOnClear(build);
		expect(configs).toBe(build);
		expect(deleted).toEqual([]);
	});

	it("leaves the other configs untouched while one fades", () => {
		const { configs } = decayOnClear([CONFIGS.js, CONFIGS.deprecated]);
		expect(configs[0]).toBe(CONFIGS.js);
	});

	it("deletes the config that fades to ×1 — a dead multiplier never sits in a slot", () => {
		const nearlySpent = { ...CONFIGS.deprecated, coverageMultiplier: 1.5 };
		const { configs, deleted } = decayOnClear([CONFIGS.js, nearlySpent]);
		expect(configs).toEqual([CONFIGS.js]);
		expect(deleted).toEqual([{ ...nearlySpent, coverageMultiplier: 1 }]);
	});

	it("serves exactly four gates from a fresh ×3: 3, 2.5, 2, 1.5, gone", () => {
		const ladder: number[] = [];
		let build: readonly Config[] = [CONFIGS.deprecated];
		while (build.length > 0) {
			ladder.push(build[0].coverageMultiplier ?? 0);
			build = decayOnClear(build).configs;
		}
		expect(ladder).toEqual([3, 2.5, 2, 1.5]);
	});
});
