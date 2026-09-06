import { describe, expect, it } from "vitest";

import {
	CONFIG_UNLOCKS,
	FREE_CONFIG_IDS,
	ONE_SHOT_METRICS,
	configsUnlockedBy,
	isOneShotMetric,
	isUnlockSatisfied,
} from "~/modules/run/config/domain/configUnlock.model";
import {
	CONFIG_LIST,
	CONFIGS,
} from "~/modules/run/config/domain/configRoster.model";
import { STARTER_POOL } from "~/modules/run/config/domain/hand.model";

const countsOf = (rows: Record<string, number>) =>
	Object.entries(rows).map(([metric, count]) => ({ metric, count }));

describe("CONFIG_UNLOCKS", () => {
	it("covers every roster config exactly once", () => {
		const rosterIds = CONFIG_LIST.map((config) => config.id).sort();
		const unlockIds = Object.keys(CONFIG_UNLOCKS).sort();
		expect(unlockIds).toEqual(rosterIds);
	});

	it("marks exactly the starter pool free", () => {
		const starterIds = STARTER_POOL.map((config) => config.id).sort();
		expect([...FREE_CONFIG_IDS].sort()).toEqual(starterIds);
	});

	it("keeps a focus config in the free set", () => {
		const freeConfigs = CONFIG_LIST.filter((config) =>
			FREE_CONFIG_IDS.includes(config.id)
		);
		expect(
			freeConfigs.some((config) => config.focusCategory !== undefined)
		).toBe(true);
	});

	it("gives every earned unlock positive targets", () => {
		const earnedUnlocks = Object.values(CONFIG_UNLOCKS).filter(
			(unlock) => unlock.kind === "earned"
		);
		expect(earnedUnlocks.length).toBe(27);
		for (const unlock of earnedUnlocks) {
			expect(unlock.objective.target).toBeGreaterThan(0);
			expect(unlock.fallbackPollsAnswered).toBeGreaterThan(0);
		}
	});

	it("gives every one-shot objective a target of exactly 1", () => {
		const oneShotUnlocks = Object.values(CONFIG_UNLOCKS).filter(
			(unlock) =>
				unlock.kind === "earned" && isOneShotMetric(unlock.objective.metric)
		);
		expect(oneShotUnlocks.length).toBe(ONE_SHOT_METRICS.length);
		for (const unlock of oneShotUnlocks) {
			if (unlock.kind === "free") continue;
			expect(unlock.objective.target).toBe(1);
		}
	});

	it("authors caption and earned copy on every earned unlock", () => {
		for (const unlock of Object.values(CONFIG_UNLOCKS)) {
			if (unlock.kind === "free") continue;
			expect(unlock.objective.caption.length).toBeGreaterThan(0);
			expect(unlock.objective.earned.length).toBeGreaterThan(0);
		}
	});
});

describe(isOneShotMetric, () => {
	it("recognizes the six one-shot predicates", () => {
		for (const metric of ONE_SHOT_METRICS) {
			expect(isOneShotMetric(metric)).toBe(true);
		}
	});

	it("rejects cumulative metrics including category templates", () => {
		expect(isOneShotMetric("polls-answered")).toBe(false);
		expect(isOneShotMetric("category-correct:html")).toBe(false);
	});
});

describe(isUnlockSatisfied, () => {
	const telemetry = CONFIG_UNLOCKS[CONFIGS.telemetry.id];

	it("treats a free unlock as always satisfied", () => {
		expect(isUnlockSatisfied(CONFIG_UNLOCKS.js, () => 0)).toBe(true);
	});

	it("satisfies via the thematic path at its target", () => {
		const countOf = (metric: string) => (metric === "community-peeks" ? 5 : 0);
		expect(isUnlockSatisfied(telemetry, countOf)).toBe(true);
	});

	it("satisfies via the polls-answered fallback at its target", () => {
		const countOf = (metric: string) => (metric === "polls-answered" ? 100 : 0);
		expect(isUnlockSatisfied(telemetry, countOf)).toBe(true);
	});

	it("stays unsatisfied below both targets", () => {
		const countOf = (metric: string) => {
			if (metric === "community-peeks") return 4;
			if (metric === "polls-answered") return 99;
			return 0;
		};
		expect(isUnlockSatisfied(telemetry, countOf)).toBe(false);
	});
});

describe(configsUnlockedBy, () => {
	it("grants a config crossing its thematic target with that metric as provenance", () => {
		const grants = configsUnlockedBy(countsOf({ "community-peeks": 5 }));
		expect(grants).toEqual([
			{ configId: "telemetry", viaMetric: "community-peeks" },
		]);
	});

	it("grants via polls-answered with the fallback as provenance", () => {
		const grants = configsUnlockedBy(countsOf({ "polls-answered": 25 }));
		expect(grants).toEqual([{ configId: "html", viaMetric: "polls-answered" }]);
	});

	it("grants once with the thematic metric when both paths cross together", () => {
		const grants = configsUnlockedBy(
			countsOf({ "category-correct:html": 10, "polls-answered": 25 })
		);
		expect(grants).toEqual([
			{ configId: "html", viaMetric: "category-correct:html" },
		]);
	});

	it("grants nothing below every target", () => {
		expect(
			configsUnlockedBy(countsOf({ "community-peeks": 4, "gates-cleared": 3 }))
		).toEqual([]);
	});

	it("grants nothing for a metric no objective reads", () => {
		expect(configsUnlockedBy(countsOf({ rebuilds: 100 }))).toEqual([]);
	});

	it("grants every config sharing a crossed metric", () => {
		const grants = configsUnlockedBy(countsOf({ "configs-sold": 20 }));
		expect(grants).toEqual([
			{ configId: "deprecated", viaMetric: "configs-sold" },
			{ configId: "garbage-collection", viaMetric: "configs-sold" },
		]);
	});
});
