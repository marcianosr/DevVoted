import { describe, expect, it } from "vitest";

import {
	BASE_SPOTS,
	occupiedSpots,
} from "~/modules/run/pipeline/domain/pipeline.model";
import {
	CONFIG_LIST,
	CONFIGS,
} from "~/modules/run/config/domain/configRoster.model";
import {
	stackMatching,
	STARTER_STACKS,
	starterStackFor,
} from "~/modules/run/config/domain/stack.model";

describe("STARTER_STACKS", () => {
	it("fits the opening pipeline, with room left to draft into", () => {
		for (const stack of STARTER_STACKS) {
			expect(occupiedSpots(stack.configs)).toBeLessThanOrEqual(BASE_SPOTS);
			expect(stack.configs.length).toBeGreaterThan(0);
		}
	});

	it("only bundles roster configs, so every member exists in the handed pool", () => {
		const rosterIds = new Set(CONFIG_LIST.map((config) => config.id));
		for (const stack of STARTER_STACKS)
			for (const config of stack.configs)
				expect(rosterIds.has(config.id)).toBe(true);
	});

	it("never repeats a config within a stack", () => {
		for (const stack of STARTER_STACKS) {
			const ids = stack.configs.map((config) => config.id);
			expect(new Set(ids).size).toBe(ids.length);
		}
	});

	it("gives each stack a distinct id", () => {
		const ids = STARTER_STACKS.map((stack) => stack.id);
		expect(new Set(ids).size).toBe(ids.length);
	});
});

describe(starterStackFor, () => {
	it("resolves a stack by id", () => {
		expect(starterStackFor("ship-it")?.name).toBe("Gamble");
	});

	it("returns undefined for an unknown id", () => {
		expect(starterStackFor("kanto-starter")).toBeUndefined();
	});
});

describe(stackMatching, () => {
	it("recognizes a pipeline holding exactly a stack's contents, order-blind", () => {
		const shipIt = starterStackFor("ship-it");
		if (!shipIt) throw new Error("ship-it stack missing");
		const reversed = [...shipIt.configs].reverse();
		expect(stackMatching(reversed)?.id).toBe("ship-it");
	});

	it("stops matching once the pipeline deviates from the stack", () => {
		const shipIt = starterStackFor("ship-it");
		if (!shipIt) throw new Error("ship-it stack missing");
		const edited = [...shipIt.configs.slice(0, -1), CONFIGS.agentsMd];
		expect(stackMatching(edited)).toBeUndefined();
	});

	it("matches nothing on an empty pipeline", () => {
		expect(stackMatching([])).toBeUndefined();
	});
});
