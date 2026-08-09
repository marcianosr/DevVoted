import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";

import type { AnsweredPoll } from "~/modules/run/climb/run.model";
import { CONFIGS } from "~/modules/run/configs/configRoster.model";
import { RewardScreen } from "./RewardScreen.ui";

const answered: AnsweredPoll[] = [
	{
		id: "js1",
		question: "typeof null?",
		category: "js",
		outcome: "correct",
		picked: ['"object"'],
	},
	{
		id: "js2",
		question: "at(-1)?",
		category: "js",
		outcome: "wrong",
		picked: ["pop()"],
	},
];

const base = {
	clearedGate: 1,
	gateReward: 80,
	coverageGainedByCategory: { js: 8, css: 3.5 },
	answered,
	passedChecks: [
		{
			label: "Correct",
			progress: "2/2",
			current: 2,
			target: 2,
			state: "success" as const,
			sourceConfigId: "unit-tests",
		},
	],
	configs: [CONFIGS.unitTests],
};

describe(RewardScreen, () => {
	it("shows the cleared gate and the reward report", () => {
		render(<RewardScreen {...base} />);
		// The report headlines success and names the gate after its badge.
		const heading = screen.getByRole("heading", {
			name: "Boulder gate cleared!",
		});
		expect(heading.parentElement).toHaveTextContent("gate 1");
		// Unit Tests pays its flat clear payout in its row.
		expect(screen.getByText("+32KB")).toBeInTheDocument();
		// The totals footer frames the sums as the gate's winnings. With no running
		// total passed, the gate's own delta is the whole story: one line, not two.
		expect(screen.getByText("storage this gate")).toBeInTheDocument();
		// One coverage chip per category gained.
		expect(screen.getByText("JavaScript")).toBeInTheDocument();
		expect(screen.getByText("+8%")).toBeInTheDocument();
		expect(screen.getByText("+3.5%")).toBeInTheDocument();
	});

	// The answers themselves moved to /run/review; this button is the way through
	// to them, with the score left to the answers page itself.
	it("keeps the answers off the screen, offering a way through to them", () => {
		const onReviewAnswers = vi.fn();
		render(<RewardScreen {...base} onReviewAnswers={onReviewAnswers} />);
		expect(screen.queryByText("typeof null?")).not.toBeInTheDocument();
		const link = screen.getByRole("button", { name: /Review your answers/ });
		fireEvent.click(link);
		expect(onReviewAnswers).toHaveBeenCalledTimes(1);
	});

	it("drops the review line when there is no page to send the player to", () => {
		render(<RewardScreen {...base} />);
		expect(
			screen.queryByRole("button", { name: /Review your answers/ })
		).not.toBeInTheDocument();
	});

	// The way forward sits beside the way through to the answers, not above it.
	it("offers a way to the shop beside reviewing the answers", () => {
		const onContinue = vi.fn();
		render(
			<RewardScreen
				{...base}
				onReviewAnswers={vi.fn()}
				onContinue={onContinue}
			/>
		);
		const shopButton = screen.getByRole("button", { name: /Continue to shop/ });
		fireEvent.click(shopButton);
		expect(onContinue).toHaveBeenCalledTimes(1);
	});

	it("drops the shop button when there is nowhere for the run to continue", () => {
		render(<RewardScreen {...base} />);
		expect(
			screen.queryByRole("button", { name: /Continue to shop/ })
		).not.toBeInTheDocument();
	});

	it("names the badge this clear won as a reward beside the storage and coverage", () => {
		render(<RewardScreen {...base} />);
		// Gate 1 is Boulder's gate, so its clear is what awards Boulder.
		const swatch = screen.getByTestId("earned-swatch");
		expect(swatch).toHaveTextContent("Boulder Swatch");
		// A reward of its own, listed under the rewards heading.
		expect(swatch.closest("li")).toBeInTheDocument();
	});

	it("lists the three rewards a clear pays, one line each", () => {
		render(<RewardScreen {...base} />);
		expect(screen.getByText("Gate rewards")).toBeInTheDocument();
		const rewards = screen.getAllByRole("listitem");
		expect(rewards[0]).toHaveTextContent("storage");
		expect(rewards[1]).toHaveTextContent("coverage");
		expect(rewards[2]).toHaveTextContent("Boulder Swatch");
	});

	it("prints one figure, not two, when the gate paid everything the run holds", () => {
		// The base fixture's clear pays 80KB. A run holding exactly 80KB is what the
		// first gate always looks like — the same number twice — so the pair merges.
		render(<RewardScreen {...base} storage={80} />);
		const storage = screen.getAllByRole("listitem")[0];
		expect(storage).toHaveTextContent("storage this gate");
		expect(within(storage).getByText("+80KB")).toBeInTheDocument();
		expect(within(storage).queryByText("+80KB this gate")).toBeNull();
	});

	it("keeps the running total and the delta apart once they differ", () => {
		render(<RewardScreen {...base} storage={200} capKb={512} />);
		const storage = screen.getAllByRole("listitem")[0];
		expect(within(storage).getByText("storage")).toBeInTheDocument();
		expect(within(storage).getByText("200KB")).toBeInTheDocument();
		expect(within(storage).getByText("+80KB this gate")).toBeInTheDocument();
	});

	it("closes the payout with the coverage split, biggest earner first", () => {
		render(<RewardScreen {...base} />);
		const split = screen.getByRole("heading", { name: "Coverage by category" })
			.parentElement?.parentElement;
		if (!split) throw new Error("no coverage split section");
		// The base fixture gains JavaScript +8% and CSS +3.5%, ranked by size.
		expect(within(split).getByText("JavaScript")).toBeInTheDocument();
		expect(within(split).getByText("+8%")).toBeInTheDocument();
		expect(within(split).getByText("CSS")).toBeInTheDocument();
		expect(within(split).getByText("+3.5%")).toBeInTheDocument();
		expect(split.textContent?.indexOf("JavaScript")).toBeLessThan(
			split.textContent?.indexOf("CSS") ?? -1
		);
	});

	it("meters storage and coverage against what each is filling toward", () => {
		render(
			<RewardScreen
				{...base}
				storage={96}
				capKb={512}
				coverage={6.5}
				slots={3}
				slotCoverageRequired={8}
			/>
		);

		const [storage, coverage, slotProgress] = screen.getAllByRole("listitem");
		expect(within(storage).getByText("96KB")).toBeInTheDocument();
		expect(storage).toHaveTextContent("this gate");
		expect(storage).toHaveTextContent("of 512KB cap");
		expect(within(coverage).getByText("6.5%")).toBeInTheDocument();
		expect(slotProgress).toHaveTextContent("slot 4 progress");
		expect(within(slotProgress).getByText("6.5% of 8%")).toHaveClass(
			"text-zinc-400"
		);
		expect(
			screen.getAllByRole("progressbar", { name: "coverage toward slot 4" })
		).toHaveLength(1);
	});

	it("drops the coverage bar at the slot cap, where nothing is left to buy", () => {
		render(
			<RewardScreen
				{...base}
				storage={96}
				coverage={6.5}
				slots={14}
				slotCoverageRequired={Infinity}
			/>
		);
		expect(screen.queryByText(/for slot/)).not.toBeInTheDocument();
		expect(screen.getAllByRole("listitem")[1]).toHaveTextContent("coverage");
	});

	it("counts the fresh badge against the whole collection", () => {
		render(<RewardScreen {...base} />);
		expect(screen.getAllByRole("listitem")[2]).toHaveTextContent(
			"earned · 2 of 13"
		);
	});

	it("shows where the clear leaves the climb, and what is next", () => {
		render(<RewardScreen {...base} />);
		expect(
			screen.getByRole("group", { name: "gate 2 of 12" })
		).toBeInTheDocument();
		expect(
			screen.getByText("gate 2 of 12 · next up: Cascade gate")
		).toBeInTheDocument();
	});

	it("reads the slot progress as unlocked once its rung is met", () => {
		render(
			<RewardScreen
				{...base}
				coverage={8.5}
				slots={3}
				slotCoverageRequired={8}
			/>
		);
		expect(screen.getByText("8.5% of 8%")).toHaveClass("text-gradient-green");
	});

	it("headlines every clear as a clear — the climb never holds", () => {
		render(<RewardScreen {...base} clearedGate={3} />);
		expect(
			screen.getByRole("heading", { name: "Thunder gate cleared!" })
		).toBeInTheDocument();
		expect(screen.queryByText(/still gate 3/)).not.toBeInTheDocument();
	});
});
