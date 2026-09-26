import { describe, expect, it } from "vitest";

import {
	CONFIG_UNLOCKS,
	type EarnedConfigUnlock,
} from "~/modules/run/config/domain/configUnlock.model";
import {
	fallbackCaptionFor,
	provenanceOf,
	STARTER_PROVENANCE,
	thematicCaptionFor,
} from "~/modules/run/config/domain/unlockCaption.model";

const earnedUnlock = (configId: string): EarnedConfigUnlock => {
	const unlock = CONFIG_UNLOCKS[configId];
	if (unlock.kind !== "earned") throw new Error(`${configId} is free`);
	return unlock;
};

describe(thematicCaptionFor, () => {
	it("carries the caption with a structured count toward a cumulative target", () => {
		expect(thematicCaptionFor(earnedUnlock("telemetry"), 3)).toEqual({
			kind: "counted",
			text: "Peek the community split 5 times",
			count: 3,
			target: 5,
		});
	});

	it("renders a one-shot objective as a checkbox, done at its target", () => {
		expect(thematicCaptionFor(earnedUnlock("volkswagen-ci"), 0)).toEqual({
			kind: "one-shot",
			text: "Clear Marsh's Mirror audit without a miss",
			done: false,
		});
		expect(thematicCaptionFor(earnedUnlock("volkswagen-ci"), 1)).toMatchObject({
			done: true,
		});
	});
});

describe(fallbackCaptionFor, () => {
	it("counts lifetime polls toward the config's own fallback target", () => {
		expect(fallbackCaptionFor(earnedUnlock("telemetry"), 43)).toEqual({
			kind: "counted",
			text: "Answer 100 polls",
			count: 43,
			target: 100,
		});
	});
});

describe(provenanceOf, () => {
	it("reads a null metric as the starter set, never an earning", () => {
		expect(provenanceOf("js", null)).toBe(STARTER_PROVENANCE);
	});

	it("prints the authored past tense for a thematic grant", () => {
		expect(provenanceOf("volkswagen-ci", "mirror-clear-no-miss")).toBe(
			"Earned: cleared Marsh's Mirror audit without a miss"
		);
	});

	it("prints the fallback count for a polls-answered grant", () => {
		expect(provenanceOf("telemetry", "polls-answered")).toBe(
			"Earned: answered 100 polls"
		);
	});

	it("never throws on an unknown config in the render path", () => {
		expect(provenanceOf("missingno", "polls-answered")).toBe(
			STARTER_PROVENANCE
		);
	});
});
