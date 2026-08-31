import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { Config } from "~/modules/run/config/domain/config.model";
import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import type { AnsweredPoll } from "~/modules/run/run/domain/runPoll.model";
import { createMockRunView } from "~/test/runView.factory";

import { RevealView } from "./RevealView.component";

const answered: AnsweredPoll = {
	id: "poll-flat",
	question: "Which method flattens one level?",
	category: "js",
	outcome: "correct",
	picked: ["arr.flat()"],
	correct: ["arr.flat()"],
	options: ["arr.flat()", "arr.smoosh()"],
	coverageEarned: 1.6,
	coverageBreakdown: {
		base: 1,
		streakBonus: 0.1,
		configBonuses: [{ configId: "js", value: 0.5 }],
	},
	coverageFactors: { correct: 1, build: 1.25, streak: 1.1 },
	explanation: "flat() flattens one level unless told deeper.",
};

const missed: AnsweredPoll = {
	...answered,
	outcome: "wrong",
	picked: ["arr.smoosh()"],
	coverageEarned: -0.8,
	coverageBreakdown: { base: -0.8, streakBonus: 0, configBonuses: [] },
	coverageFactors: undefined,
};

const render_ = (
	poll: AnsweredPoll = answered,
	configs: readonly Config[] = [CONFIGS.js, CONFIGS.ts],
	onNext = vi.fn()
) => {
	render(
		<RevealView
			view={createMockRunView({ configs, answeredThisGate: [poll] })}
			answered={poll}
			onNext={onNext}
		/>
	);
	return onNext;
};

// Scoped: a config names itself on the track too, and the trail speaks the word
// "correct" for screen readers.
const equation = () => {
	const panel = screen.getByText(/^coverage (earned|lost)$/).closest("section");
	if (!panel) throw new Error("No equation rendered");
	return panel;
};

// A factor sets its figure over its name, so neither is findable on its own.
const factorOf = (label: string) =>
	within(equation()).getByText(label).parentElement?.textContent;

describe("RevealView", () => {
	it("keeps the answered poll on screen with its options settled", () => {
		render_();

		expect(
			screen.getByText("Which method flattens one level?")
		).toBeInTheDocument();
		screen.getAllByRole("radio").forEach((option) => {
			expect(option).toBeDisabled();
		});
	});

	it("badges what the gate expected and what was wrongly picked", () => {
		render_(missed);

		expect(screen.getByText("expected")).toBeInTheDocument();
		expect(screen.getByText("you picked")).toBeInTheDocument();
	});

	it("reads the earn as its multiplication, every contributing config named", () => {
		render_();

		expect(factorOf("correct")).toBe("1.0correct");
		expect(factorOf("streak")).toBe("1.1streak");
		expect(factorOf(".js")).toBe("1.25.js");
		expect(screen.getByLabelText("+1.6%")).toBeInTheDocument();
	});

	it("adds a flat config in, quoting the coverage it actually contributed", () => {
		render_(
			{
				...answered,
				coverageBreakdown: {
					base: 1,
					streakBonus: 0,
					configBonuses: [{ configId: "code-coverage", value: 0.5 }],
				},
			},
			[CONFIGS.codeCoverage]
		);

		expect(factorOf("Code Coverage")).toBe("+0.5Code Coverage");
		expect(screen.getByText("+")).toBeInTheDocument();
	});

	it("quotes what the add paid on this answer, not the config's own rate", () => {
		render_(
			{
				...answered,
				outcome: "partial",
				coverageEarned: 0.9,
				coverageFactors: { correct: 0.6, build: 1.5, streak: 1 },
				coverageBreakdown: {
					base: 0.6,
					streakBonus: 0,
					configBonuses: [{ configId: "code-coverage", value: 0.3 }],
				},
			},
			[CONFIGS.codeCoverage]
		);

		expect(factorOf("Code Coverage")).toBe("+0.3Code Coverage");
	});

	it("brackets the base and its adds when multipliers scale their sum", () => {
		render_(
			{
				...answered,
				coverageBreakdown: {
					base: 1,
					streakBonus: 0,
					configBonuses: [
						{ configId: "code-coverage", value: 0.5 },
						{ configId: "js", value: 0.4 },
					],
				},
			},
			[CONFIGS.codeCoverage, CONFIGS.js]
		);

		expect(screen.getByText("(")).toBeInTheDocument();
		expect(screen.getByText(")")).toBeInTheDocument();
		expect(factorOf("Code Coverage")).toBe("+0.5Code Coverage");
		expect(factorOf(".js")).toBe("1.25.js");
	});

	it("names the button for what comes next, and says nothing else beside it", () => {
		render_();

		expect(
			screen.getByRole("button", { name: "Next poll →" })
		).toBeInTheDocument();
		expect(screen.queryByText(/to go/)).not.toBeInTheDocument();
	});

	it("badges the contributing config's share in its own track cell", () => {
		render_();

		expect(screen.getByText("paid +0.5")).toBeInTheDocument();
		expect(screen.getByText("ts only")).toBeInTheDocument();
	});

	it("badges the KB the faucet just paid, clamp and all — not its list rate", () => {
		render_({ ...answered, faucetKb: 4 }, [CONFIGS.js, CONFIGS.indexedDb]);

		expect(screen.getByText("paid +4 KB")).toBeInTheDocument();
	});

	it("keeps the rail silent on a miss — configs never touch losses", () => {
		render_(missed);

		expect(screen.getByLabelText("−0.8%")).toBeInTheDocument();
		expect(screen.queryByText(/^paid /)).not.toBeInTheDocument();
		expect(screen.queryByText("1 applied")).not.toBeInTheDocument();
	});

	it("hands the explanation to the player — the learning half of the beat", () => {
		render_();

		expect(
			screen.getByText("flat() flattens one level unless told deeper.")
		).toBeInTheDocument();
	});

	it("moves on only when the player asks to", async () => {
		const onNext = render_();

		await userEvent.click(screen.getByRole("button", { name: "Next poll →" }));

		expect(onNext).toHaveBeenCalledOnce();
	});
});
