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

// The climb ladder names every gate's badge in a pip tooltip, so a bare
// document-wide query for a swatch name (or a gate number) now hits the ladder
// too. Anything about what this clear *held* is scoped to its own section.
const collectedSection = () => {
	const section = screen.getByText("Swatches collected").parentElement;
	if (!section) throw new Error("no collected section");
	return section;
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

	// The answers themselves moved to /run/review; the score stays here, since it
	// is the gate's report card and the way through to them.
	it("keeps the answers off the screen, offering the score as the way in", () => {
		const onReviewAnswers = vi.fn();
		render(<RewardScreen {...base} onReviewAnswers={onReviewAnswers} />);
		expect(screen.queryByText("typeof null?")).not.toBeInTheDocument();
		const link = screen.getByRole("button", { name: /Review your answers/ });
		expect(link).toHaveTextContent("1 of 2 correct");
		fireEvent.click(link);
		expect(onReviewAnswers).toHaveBeenCalledTimes(1);
	});

	it("drops the review line when there is no page to send the player to", () => {
		render(<RewardScreen {...base} />);
		expect(
			screen.queryByRole("button", { name: /Review your answers/ })
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
		expect(storage).toHaveTextContent("+80KB storage this gate");
		expect(within(storage).queryByText("+80KB this gate")).toBeNull();
	});

	it("keeps the running total and the delta apart once they differ", () => {
		render(<RewardScreen {...base} storage={200} />);
		const storage = screen.getAllByRole("listitem")[0];
		expect(storage).toHaveTextContent("200KB storage");
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
				coverage={6.5}
				slots={3}
				slotCoverageRequired={8}
			/>
		);
		// Each reward leads with where the run now stands, then this gate's delta.
		const [storage, coverage] = screen.getAllByRole("listitem");
		expect(storage).toHaveTextContent("96KB storage");
		expect(storage).toHaveTextContent("this gate");
		expect(storage).toHaveTextContent("of 512KB cap");
		expect(coverage).toHaveTextContent("6.5% coverage");
		// Coverage buys width, so its meter is the slot's own row (ADR-019): one
		// bar toward the rung, plus whether the rung has bought anything yet.
		expect(coverage).toHaveTextContent("Opens at 8% coverage");
		expect(coverage).toHaveTextContent("6.5% reached");
		expect(coverage).toHaveTextContent("locked");
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
		// The total still reads — only the bar and its target go.
		expect(screen.getAllByRole("listitem")[1]).toHaveTextContent("coverage");
	});

	it("counts the fresh badge against the whole collection", () => {
		render(<RewardScreen {...base} />);
		// Clearing gate 1 banks Pallet and Boulder: 2 of the 13 gates' swatches.
		expect(screen.getAllByRole("listitem")[2]).toHaveTextContent(
			"earned · 2 of 13"
		);
	});

	it("names every swatch the run holds, the fresh one included", () => {
		render(<RewardScreen {...base} clearedGate={2} />);
		const collected = within(collectedSection());
		// Clearing gate 2 banks gates 0 through 2 — Pallet, Boulder, Cascade.
		for (const name of ["Pallet Swatch", "Boulder Swatch", "Cascade Swatch"])
			expect(collected.getByText(name)).toBeInTheDocument();
		expect(collected.queryByText("Thunder Swatch")).not.toBeInTheDocument();
	});

	it("gives gate 0's clear Pallet and nothing else", () => {
		render(<RewardScreen {...base} clearedGate={0} />);
		const collected = within(collectedSection());
		expect(collected.getByText("Pallet Swatch")).toBeInTheDocument();
		expect(collected.queryByText("Boulder Swatch")).not.toBeInTheDocument();
	});

	it("shows where the clear leaves the climb, and what is next", () => {
		render(<RewardScreen {...base} />);
		// Clearing gate 1 puts the run on gate 2 — the ladder and its caption agree.
		expect(
			screen.getByRole("group", { name: "gate 2 of 12" })
		).toBeInTheDocument();
		expect(screen.getAllByRole("listitem")[2]).toHaveTextContent(
			"gate 2 of 12 · next up: Cascade gate"
		);
	});

	it("calls out a slot this gate's coverage just opened", () => {
		render(
			<RewardScreen
				{...base}
				coverage={8.5}
				slots={3}
				slotCoverageRequired={8}
			/>
		);
		// The fixture gains 11.5%, so the run crossed 8% inside this gate.
		expect(
			screen.getByText("slot 4 unlocked this gate — claim it in the shop")
		).toBeInTheDocument();
		// ...and the row it sits under agrees.
		expect(screen.getByText("unlocked")).toBeInTheDocument();
	});

	it("keeps naming the target when the rung was already cleared earlier", () => {
		render(
			<RewardScreen
				{...base}
				// 20% now, 8.5% before this gate's 11.5% — the rung fell two gates ago.
				coverage={20}
				slots={3}
				slotCoverageRequired={8}
			/>
		);
		// The row still reads "unlocked" — it is; only the "this gate" news is gone.
		expect(screen.queryByText(/unlocked this gate/)).not.toBeInTheDocument();
	});

	it("headlines every clear as a clear — the climb never holds", () => {
		render(<RewardScreen {...base} clearedGate={3} />);
		expect(
			screen.getByRole("heading", { name: "Thunder gate cleared!" })
		).toBeInTheDocument();
		expect(screen.queryByText(/still gate 3/)).not.toBeInTheDocument();
	});
});
