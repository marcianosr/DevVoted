import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import type { AnsweredPoll } from "~/modules/run/run/domain/runPoll.model";
import { createMockRunView } from "~/test/runView.factory";

import { GameOverView } from "./GameOverView.component";

const answer = (
	id: string,
	outcome: AnsweredPoll["outcome"]
): AnsweredPoll => ({
	id,
	question: `question ${id}`,
	category: "js",
	outcome,
	picked: ["a wrong pick"],
});

const view = createMockRunView({
	gatesCleared: 4,
	configs: [CONFIGS.js, CONFIGS.ts],
	slots: 4,
	slotsUsed: 2,
	storage: 96,
	coverage: 38.25,
	allAnswered: [
		answer("a", "correct"),
		answer("b", "wrong"),
		answer("c", "partial"),
	],
});

const render_ = (won = false, onNewRun = vi.fn()) => {
	render(<GameOverView view={view} won={won} onNewRun={onNewRun} />);
	return onNewRun;
};

describe("GameOverView", () => {
	it("names the gate the run stopped at", () => {
		render_();

		expect(screen.getByText("Stopped at Lavender")).toBeInTheDocument();
	});

	it("says the climb is done when the run was won", () => {
		render_(true);

		expect(screen.getByText("The climb is done")).toBeInTheDocument();
	});

	it("reports what the run reached, rounded to one place", () => {
		render_();

		// The facts line badges its numbers, so the text is split across spans.
		expect(
			screen.getByText(
				(_, element) =>
					element?.textContent ===
					"4 gates of 12 cleared · 38.3% coverage · 96 KB left"
			)
		).toBeTruthy();
	});

	it("counts the swatches still out there", () => {
		render_();

		expect(screen.getByText("8 still out there")).toBeInTheDocument();
	});

	// Only the misses are worth reviewing on a death screen.
	it("lists what the run lost it on, correct answers left out", () => {
		render_();

		expect(screen.getByText("2 missed polls")).toBeInTheDocument();
		expect(screen.getByText("question b")).toBeInTheDocument();
		expect(screen.getByText("question c")).toBeInTheDocument();
		expect(screen.queryByText("question a")).not.toBeInTheDocument();
	});

	it("shows the build the run ended with", () => {
		render_();

		expect(screen.getByText("2 configs")).toBeInTheDocument();
		expect(screen.getByText(".js")).toBeInTheDocument();
		expect(screen.getByText("2 of 4 slots filled")).toBeInTheDocument();
	});

	// DVTD-54gi: what a finished run banks is not built, so the section is
	// withheld rather than shown as a zeroed bar.
	it("shows no archive split while the mechanic does not exist", () => {
		render_();

		expect(screen.queryByText("Archive")).not.toBeInTheDocument();
	});

	it("starts a new run from the footer", async () => {
		const onNewRun = render_();

		await userEvent.click(screen.getByRole("button", { name: "Play again →" }));

		expect(onNewRun).toHaveBeenCalledOnce();
	});

	it("offers no share until there is something to share", () => {
		render_();

		expect(screen.getByRole("button", { name: "Copy result" })).toBeDisabled();
	});
});
