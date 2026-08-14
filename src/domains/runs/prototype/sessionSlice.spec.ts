import { describe, expect, it } from "vitest";

import {
	coverageForAnswer,
	effectiveRequirement,
	Pipeline,
	rewardMultiplierFor,
	SLICE_TAGS,
	stripSticker,
	Tag,
} from "./sessionSlice";

const pipelineWith = (tags: Tag[]): Pipeline => ({
	id: "hyrule-ci",
	slots: 3,
	tags,
});

describe("effectiveRequirement", () => {
	it("returns the base threshold for a bare pipeline", () => {
		expect(effectiveRequirement(pipelineWith([]), 3)).toBe(3);
	});

	it("raises the threshold per Risk tag (push --force)", () => {
		expect(effectiveRequirement(pipelineWith([SLICE_TAGS.pushForce]), 3)).toBe(
			4
		);
	});

	it("stacks Risk raises", () => {
		expect(
			effectiveRequirement(
				pipelineWith([SLICE_TAGS.pushForce, SLICE_TAGS.deployFriday]),
				3
			)
		).toBe(6);
	});

	it("cancels all raises when yarn.lock is equipped", () => {
		expect(
			effectiveRequirement(
				pipelineWith([SLICE_TAGS.deployFriday, SLICE_TAGS.yarnLock]),
				3
			)
		).toBe(3);
	});

	it("floors at 1", () => {
		expect(effectiveRequirement(pipelineWith([]), 1)).toBe(1);
	});
});

describe("rewardMultiplierFor", () => {
	it("multiplies the Risk payout across equipped Risk tags", () => {
		expect(
			rewardMultiplierFor(
				pipelineWith([SLICE_TAGS.pushForce, SLICE_TAGS.deployFriday])
			)
		).toBe(6);
	});

	it("is 1 for a bare pipeline", () => {
		expect(rewardMultiplierFor(pipelineWith([]))).toBe(1);
	});
});

describe("stripSticker", () => {
	it("peels the chosen tag off the pipeline", () => {
		const stripped = stripSticker(
			pipelineWith([SLICE_TAGS.js, SLICE_TAGS.eslint]),
			"eslint"
		);
		expect(stripped.tags.map((tag) => tag.id)).toEqual(["js"]);
	});

	it("throws when asked to peel a tag that is not equipped", () => {
		expect(() =>
			stripSticker(pipelineWith([SLICE_TAGS.js]), "deploy-friday")
		).toThrow();
	});
});

describe("coverageForAnswer", () => {
	it("pays 1.5x on a correct answer in a Focus category", () => {
		expect(coverageForAnswer([SLICE_TAGS.js], "js", true)).toBe(1.5);
	});

	it("pays a flat 1% outside the Focus category", () => {
		expect(coverageForAnswer([SLICE_TAGS.js], "css", true)).toBe(1);
	});

	it("multiplies coverage with an Amplify tag (Copilot)", () => {
		expect(coverageForAnswer([SLICE_TAGS.copilot], "css", true)).toBe(2);
	});

	it("stacks Focus and Amplify across the whole build", () => {
		expect(
			coverageForAnswer([SLICE_TAGS.js, SLICE_TAGS.copilot], "js", true)
		).toBe(3);
	});

	it("adds flat coverage from Code Coverage", () => {
		expect(coverageForAnswer([SLICE_TAGS.codeCoverage], "css", true)).toBe(1.5);
	});

	it("scales Focus coverage with level", () => {
		const leveled: Tag = { ...SLICE_TAGS.js, level: 2 };
		expect(coverageForAnswer([leveled], "js", true)).toBe(2);
	});

	it("pays nothing for a wrong answer", () => {
		expect(coverageForAnswer([SLICE_TAGS.js], "js", false)).toBe(0);
	});
});
