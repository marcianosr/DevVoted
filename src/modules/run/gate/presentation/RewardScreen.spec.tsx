import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import type { AnsweredPoll } from "~/modules/run/run/domain/runPoll.model";
import type { GatePayout } from "~/modules/run/run/application/gatePayout.viewmodel";
import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import { RewardScreen } from "~/modules/run/gate/presentation/RewardScreen.ui";
import {
	createMockGatePayout,
	createMockGateStake,
} from "~/test/runView.factory";

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

/** The cleared gate every test starts from; each names only the field it is about. */
const payout = (overrides: Partial<GatePayout> = {}) =>
	createMockGatePayout({
		clearedGateNumber: 1,
		gateRewardPaidKb: 80,
		...overrides,
	});

const base = {
	payout: payout(),
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

	it("announces the config Dependabot merged, since the run log never shows", () => {
		render(
			<RewardScreen
				{...base}
				payout={payout({ autoUpgradedConfig: { ...CONFIGS.js, level: 2 } })}
			/>
		);
		expect(screen.getByText("upgraded")).toBeInTheDocument();
		expect(
			screen.getByText("Dependabot merged this upgrade — free.")
		).toBeInTheDocument();
	});

	it("keeps the merge announcement off a clear without one", () => {
		render(<RewardScreen {...base} />);
		expect(screen.queryByText("upgraded")).not.toBeInTheDocument();
	});

	it("announces a config Deprecated's fade deleted — no chip elsewhere can carry it", () => {
		render(
			<RewardScreen
				{...base}
				payout={payout({
					deletedConfigs: [{ ...CONFIGS.deprecated, coverageMultiplier: 1 }],
				})}
			/>
		);
		expect(screen.getByText("deleted")).toBeInTheDocument();
		expect(screen.getByText("Deprecated")).toBeInTheDocument();
		expect(
			screen.getByText("Faded to ×1 — deleted from the pipeline.")
		).toBeInTheDocument();
	});

	it("keeps the deletion announcement off a clear without one", () => {
		render(<RewardScreen {...base} />);
		expect(screen.queryByText("deleted")).not.toBeInTheDocument();
	});

	it("previews the gate the clear opens onto, so the shop has a target", () => {
		render(
			<RewardScreen
				{...base}
				nextStake={createMockGateStake({ gateNumber: 2 })}
			/>
		);
		expect(screen.getByText("Next up")).toBeInTheDocument();
		expect(screen.getByText("Cascade gate")).toBeInTheDocument();
		expect(screen.getByText("Correct answer")).toBeInTheDocument();
	});

	it("skips the next gate's demand and game-over rules — a clear pays out, it doesn't threaten", () => {
		render(
			<RewardScreen
				{...base}
				nextStake={createMockGateStake({ gateNumber: 2 })}
			/>
		);
		expect(screen.queryByText("Clear the gate")).not.toBeInTheDocument();
		expect(screen.queryByText("Game over")).not.toBeInTheDocument();
		expect(screen.queryByText("To start")).not.toBeInTheDocument();
	});

	it("stays a payout screen when no next gate is handed to it", () => {
		render(<RewardScreen {...base} />);
		expect(screen.queryByTestId("gate-stake-receipt")).not.toBeInTheDocument();
	});

	it("lands the whole storage payout as one number", () => {
		render(<RewardScreen {...base} />);
		expect(screen.getByText("+80KB")).toHaveClass("text-gradient-green");
		expect(screen.getByText("storage earned")).toBeInTheDocument();
	});

	it("teaches what storage is for in one line", () => {
		render(<RewardScreen {...base} />);
		expect(
			screen.getByText("Spend storage on configs, upgrades, and patches.")
		).toBeInTheDocument();
	});

	it("names the swatch this clear unlocked, and that it is only a cosmetic", () => {
		render(<RewardScreen {...base} />);
		expect(screen.getByText("unlocked")).toBeInTheDocument();
		expect(screen.getByText("Boulder Swatch")).toBeInTheDocument();
		expect(screen.getByText("cosmetic")).toBeInTheDocument();
	});

	it("itemizes the clear payout into a base and the configs that added to it", () => {
		render(<RewardScreen {...base} />);
		expect(screen.getByText("base reward")).toBeInTheDocument();
		// 80KB paid, 32 of it Unit Tests' flat on-clear payout.
		expect(screen.getByText("48KB")).toBeInTheDocument();
		expect(screen.getByText("Unit Tests")).toBeInTheDocument();
		expect(screen.getByText("+32KB")).toBeInTheDocument();
	});

	it("credits a faucet config with the whole gate's income, not its per-answer rate", () => {
		render(
			<RewardScreen
				{...base}
				configs={[CONFIGS.unitTests, CONFIGS.indexedDb]}
				payout={payout({ faucetThisGateKb: 24 })}
			/>
		);
		expect(screen.getByText("IndexedDB")).toBeInTheDocument();
		expect(screen.getByText("+24KB")).toBeInTheDocument();
		expect(screen.queryByText("+8KB")).not.toBeInTheDocument();
	});

	it("totals the ledger to the same figure as the headline", () => {
		render(
			<RewardScreen
				{...base}
				configs={[CONFIGS.unitTests, CONFIGS.indexedDb]}
				payout={payout({ faucetThisGateKb: 24 })}
			/>
		);
		expect(screen.getByText("+104KB")).toBeInTheDocument();
		const total = screen.getByText("total").nextElementSibling;
		expect(total).toHaveTextContent("104KB");
	});

	// The chip is the whole point of carrying the Config rather than its label:
	// level and description ride along for free, so a config reads the same here
	// as it does in the shop and the pipeline.
	it("wears the config's level badge and description, as the shop's chips do", () => {
		render(
			<RewardScreen
				{...base}
				configs={[{ ...CONFIGS.mooresLaw, level: 2 }]}
				payout={payout({ interestThisGateKb: 12 })}
			/>
		);
		expect(screen.getByText("L2")).toBeInTheDocument();
		// L2 doubles both halves of the roster line: 2% → 4%, 32KB → 64KB.
		expect(screen.getByRole("tooltip")).toHaveTextContent(
			"+4% of held storage on gate clear."
		);
	});

	it("leaves out configs that paid no storage this gate", () => {
		render(
			<RewardScreen {...base} configs={[CONFIGS.unitTests, CONFIGS.css]} />
		);
		expect(screen.queryByText(CONFIGS.css.label)).not.toBeInTheDocument();
	});

	it("banks storage the equipped configs cannot account for in the base", () => {
		// No faucet config equipped, so the 16KB has nowhere to be attributed —
		// it belongs in the base rather than dropping out of a total the player
		// can check against the headline.
		render(
			<RewardScreen {...base} payout={payout({ faucetThisGateKb: 16 })} />
		);
		expect(screen.getByText("64KB")).toBeInTheDocument();
		expect(screen.getByText("+96KB")).toBeInTheDocument();
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

	// The clear itemizes storage and nothing else (ADR-026 §3, amended): the
	// pipeline report — statuses, roles, coverage — stays on the failed gate's
	// screen, where knowing what fell short is the point.
	it("keeps the pipeline report off the clear even though the ledger is back", () => {
		render(<RewardScreen {...base} />);
		expect(screen.queryByText("Gate rewards")).not.toBeInTheDocument();
		expect(screen.queryByText("Your pipeline")).not.toBeInTheDocument();
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
		render(<RewardScreen {...base} payout={payout({ gateBillPaidKb: 8 })} />);
		expect(
			screen.getByText("Storage plan billed −8KB this window.")
		).toBeInTheDocument();
	});

	it("stays quiet about the bill on the free tier", () => {
		render(<RewardScreen {...base} payout={payout({ gateBillPaidKb: 0 })} />);
		expect(screen.queryByText(/Storage plan billed/)).not.toBeInTheDocument();
	});

	it("calls out an unpaid bill's downgrade — that news outranks the payout", () => {
		render(
			<RewardScreen {...base} payout={payout({ planDowngraded: true })} />
		);
		expect(
			screen.getByText("Storage bill unpaid — downgraded to the free tier.")
		).toBeInTheDocument();
	});
});
