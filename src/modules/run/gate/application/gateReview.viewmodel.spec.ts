import { describe, expect, it } from "vitest";

import type { GateAnswer } from "~/modules/run/gate/application/gateOutcome.viewmodel";
import { reviewPropsFor } from "~/modules/run/gate/application/gateReview.viewmodel";

const GATE = 4;

const READS_IN_PLACE = "Reads the last element without touching the array.";
const RETURNS_AN_ARRAY = "Returns an array, not the element.";

const BARE: GateAnswer = {
	category: "js",
	question: "Which method returns the last element of an array?",
	outcome: "wrong",
	coverage: -4.4,
	units: -1.1,
	answerType: "single",
	options: ["at(-1)", "pop()", "slice(-1)"],
	picked: ["pop()"],
	correct: ["at(-1)"],
};

const EXPLAINED: GateAnswer = {
	...BARE,
	optionExplanations: {
		"at(-1)": READS_IN_PLACE,
		"slice(-1)": RETURNS_AN_ARRAY,
	},
};

const optionsOf = (answer: GateAnswer) =>
	reviewPropsFor({ gate: GATE, answers: [answer] }).rows[0]?.card.options ?? [];

describe("each option's reason on the review", () => {
	it("hands the right option its explanation, worded as right", () => {
		const [right] = optionsOf(EXPLAINED);

		expect(right?.state).toBe("right");
		expect(right?.explanation).toEqual({ text: READS_IN_PLACE, right: true });
	});

	it("explains an unpicked wrong option as wrong, though its row stays idle", () => {
		const [, , unpicked] = optionsOf(EXPLAINED);

		expect(unpicked?.state).toBe("idle");
		expect(unpicked?.explanation).toEqual({
			text: RETURNS_AN_ARRAY,
			right: false,
		});
	});

	it("leaves an option without an explanation bare", () => {
		const [, picked] = optionsOf(EXPLAINED);

		expect(picked?.state).toBe("wrong");
		expect(picked).not.toHaveProperty("explanation");
	});

	it("builds the same card for an answer recorded without option explanations", () => {
		const options = optionsOf(BARE);

		expect(options.map((option) => option.state)).toEqual([
			"right",
			"wrong",
			"idle",
		]);
		expect(options.some((option) => "explanation" in option)).toBe(false);
	});
});
