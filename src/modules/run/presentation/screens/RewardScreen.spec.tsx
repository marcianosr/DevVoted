import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

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
	answered,
	configs: [CONFIGS.unitTests],
	storage: 96,
	capKb: 512,
};

describe(RewardScreen, () => {
	it("headlines the cleared gate by its swatch name", () => {
		render(<RewardScreen {...base} />);
		expect(
			screen.getByText(
				(_, element) =>
					element?.tagName === "P" &&
					element.textContent === "Boulder gate · cleared"
			)
		).toBeInTheDocument();
	});

	it("lands the whole storage payout as one number", () => {
		render(<RewardScreen {...base} />);
		expect(screen.getByText("+80KB")).toHaveClass("text-gradient-green");
		expect(screen.getByText("storage earned")).toBeInTheDocument();
	});

	it("folds faucet income into the payout instead of itemizing it", () => {
		render(<RewardScreen {...base} faucetThisGateKb={16} />);
		expect(screen.getByText("+96KB")).toBeInTheDocument();
	});

	it("teaches what storage is for in one line", () => {
		render(<RewardScreen {...base} />);
		expect(
			screen.getByText("Spend storage on configs, upgrades, and patches.")
		).toBeInTheDocument();
	});

	it("names the swatch this clear unlocked", () => {
		render(<RewardScreen {...base} />);
		expect(
			screen.getByText(
				(_, element) =>
					element?.tagName === "P" &&
					element.textContent === "Boulder Swatch unlocked"
			)
		).toBeInTheDocument();
	});

	it("shows the running storage total against the cap", () => {
		render(<RewardScreen {...base} />);
		const bar = screen.getByRole("progressbar", { name: "storage used" });
		expect(bar).toHaveAttribute("aria-valuenow", "96");
		expect(bar).toHaveAttribute("aria-valuemax", "512");
	});

	it("shows the cleared gate's swatch chip beside its name and its unlock line", () => {
		render(<RewardScreen {...base} />);
		expect(screen.getAllByTestId("swatch")).toHaveLength(2);
	});

	// The payoff replaced the per-config report (ADR-026) — attribution lives on
	// in the failed gate's report, where knowing what fell short matters.
	it("drops the per-config reward report from the clear", () => {
		render(<RewardScreen {...base} />);
		expect(screen.queryByText("Gate rewards")).not.toBeInTheDocument();
		expect(screen.queryByRole("listitem")).not.toBeInTheDocument();
		expect(screen.queryByText(/Coverage by category/)).not.toBeInTheDocument();
	});

	it("keeps the answers off the screen, offering a way through to them", () => {
		const onReviewAnswers = vi.fn();
		render(<RewardScreen {...base} onReviewAnswers={onReviewAnswers} />);
		expect(screen.queryByText("typeof null?")).not.toBeInTheDocument();
		fireEvent.click(screen.getByRole("button", { name: "Review answers" }));
		expect(onReviewAnswers).toHaveBeenCalledTimes(1);
	});

	it("drops the review line when there is no page to send the player to", () => {
		render(<RewardScreen {...base} />);
		expect(
			screen.queryByRole("button", { name: "Review answers" })
		).not.toBeInTheDocument();
	});

	it("routes the payout straight into spending it", () => {
		const onContinue = vi.fn();
		render(<RewardScreen {...base} onContinue={onContinue} />);
		fireEvent.click(screen.getByRole("button", { name: "Enter shop →" }));
		expect(onContinue).toHaveBeenCalledTimes(1);
	});

	it("drops the shop button when there is nowhere for the run to continue", () => {
		render(<RewardScreen {...base} />);
		expect(
			screen.queryByRole("button", { name: "Enter shop →" })
		).not.toBeInTheDocument();
	});

	it("names the window's bill when the plan collected one", () => {
		render(<RewardScreen {...base} billKb={8} />);
		expect(
			screen.getByText("Storage plan billed −8KB this window.")
		).toBeInTheDocument();
	});

	it("stays quiet about the bill on the free tier", () => {
		render(<RewardScreen {...base} billKb={0} />);
		expect(screen.queryByText(/Storage plan billed/)).not.toBeInTheDocument();
	});

	it("calls out an unpaid bill's downgrade — that news outranks the payout", () => {
		render(<RewardScreen {...base} planDowngraded />);
		expect(
			screen.getByText("Storage bill unpaid — downgraded to the free tier.")
		).toBeInTheDocument();
	});
});
