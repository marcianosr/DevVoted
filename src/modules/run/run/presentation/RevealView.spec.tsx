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

// A miss earns nothing and loses separately: the engine never signs coverageEarned.
const missed: AnsweredPoll = {
	...answered,
	outcome: "wrong",
	picked: ["arr.smoosh()"],
	coverageEarned: 0,
	coverageLost: 0.8,
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

const optionRow = (label: string) => screen.getByText(label).closest("div");

describe("RevealView", () => {
	it("keeps the answered poll on screen with its options settled", () => {
		render_();

		expect(
			screen.getByText("Which method flattens one level?")
		).toBeInTheDocument();
		expect(screen.getByText("arr.flat()")).toBeInTheDocument();
		expect(screen.getByText("arr.smoosh()")).toBeInTheDocument();
	});

	// Nothing is pressable after the answer lands, or a settled poll would look
	// like it could still be changed.
	it("settles the options, so none of them is pressable", () => {
		render_();

		expect(optionRow("arr.flat()")?.tagName).not.toBe("BUTTON");
	});

	it("names what the gate expected and what was picked", () => {
		render_();

		expect(screen.getByText("expected · you picked")).toBeInTheDocument();
	});

	it("marks the option that was wrongly picked apart from the expected one", () => {
		render_(missed);

		expect(screen.getByText("expected")).toBeInTheDocument();
		expect(screen.getByText("you picked")).toBeInTheDocument();
	});

	// .js names itself on the build rail too, so the equation has to be scoped.
	it("reads the earn as its factors, every contributing config named", () => {
		render_();

		const equation = screen.getByText("coverage earned").closest("div");
		if (!equation) throw new Error("No equation rendered");

		expect(within(equation).getByText("correct")).toBeInTheDocument();
		expect(within(equation).getByText("streak")).toBeInTheDocument();
		expect(within(equation).getByText(".js")).toBeInTheDocument();
	});

	it("keeps the poll's trail and facts on a miss, so the page does not jump", () => {
		render_(missed);

		expect(screen.getByLabelText("Polls in this gate")).toBeInTheDocument();
		expect(screen.getByText("scores")).toBeInTheDocument();
		expect(screen.getByText("wrong costs")).toBeInTheDocument();
	});

	it("still credits the author the poll screen credited", () => {
		render_({ ...answered, author: "@matthijsgroen" });

		expect(screen.getByText(/@matthijsgroen/)).toBeInTheDocument();
	});

	it("marks the revealed poll as the trail's current step, not the next one", () => {
		render_();

		const steps = within(
			screen.getByLabelText("Polls in this gate")
		).getAllByText(/^\d+$/);
		const current = steps.filter((step) =>
			step.className.includes("text-zinc-100")
		);

		expect(current).toHaveLength(1);
		expect(current[0]?.textContent).toBe("1");
	});

	it("leaves the streak out when it was not paying", () => {
		render_({
			...answered,
			coverageFactors: { correct: 1, build: 1.25, streak: 1 },
		});

		expect(screen.queryByText("streak")).not.toBeInTheDocument();
	});

	it("totals the coverage the answer earned", () => {
		render_();

		expect(screen.getByText("+1.6%")).toBeInTheDocument();
		expect(screen.getByText("coverage earned")).toBeInTheDocument();
	});

	// coverageFactors is absent on a miss, so there is no multiplication to show.
	it("shows no factors on a miss, configs never touching a loss", () => {
		render_(missed);

		expect(screen.queryByText("streak")).not.toBeInTheDocument();
	});

	it("states a miss as the coverage it costs, not as nothing earned", () => {
		render_(missed);

		expect(screen.getByText("−0.8%")).toBeInTheDocument();
		expect(screen.getByText("coverage lost")).toBeInTheDocument();
		expect(screen.queryByText("coverage earned")).not.toBeInTheDocument();
	});

	it("hands the explanation to the player, the learning half of the beat", () => {
		render_();

		expect(
			screen.getByText("flat() flattens one level unless told deeper.")
		).toBeInTheDocument();
	});

	it("names the button for what comes next", () => {
		render_();

		expect(
			screen.getByRole("button", { name: "Next poll →" })
		).toBeInTheDocument();
	});

	it("moves on only when the player asks to", async () => {
		const onNext = render_();

		expect(onNext).not.toHaveBeenCalled();
		await userEvent.click(screen.getByRole("button", { name: /^Next/ }));

		expect(onNext).toHaveBeenCalledOnce();
	});

	it("badges the KB the faucet just paid, clamp and all, not its list rate", () => {
		render_({ ...answered, faucetKb: 6 }, [CONFIGS.indexedDb, CONFIGS.js]);

		const rail = screen.getByText("Build").closest("details");
		if (!rail) throw new Error("No build rail rendered");

		expect(within(rail).getByText("+6 KB")).toBeInTheDocument();
	});
});
