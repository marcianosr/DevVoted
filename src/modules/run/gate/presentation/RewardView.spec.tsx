import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { AnsweredPoll } from "~/modules/run/run/domain/runPoll.model";
import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import {
	createMockGatePayout,
	createMockGateStake,
	createMockRunView,
} from "~/test/runView.factory";

import { RewardView } from "./RewardView.component";

const answer = (
	overrides: Partial<AnsweredPoll> & Pick<AnsweredPoll, "id" | "category">
): AnsweredPoll => ({
	question: "q",
	outcome: "correct",
	picked: [],
	coverageEarned: 2,
	...overrides,
});

const answered: readonly AnsweredPoll[] = [
	answer({ id: "a", category: "js" }),
	answer({ id: "b", category: "js", coverageEarned: 1.5 }),
	answer({ id: "c", category: "ts", outcome: "partial", coverageEarned: 1 }),
	answer({ id: "d", category: "css", outcome: "wrong", coverageEarned: 0 }),
];

const cleared = createMockRunView({
	gatesCleared: 5,
	gateTheme: "rainbow",
	gateStake: createMockGateStake({ gateNumber: 5, coverageDemand: 40 }),
	answeredThisGate: answered,
	configs: [CONFIGS.js],
	storage: 240,
	gatePayout: createMockGatePayout({
		clearedGateNumber: 4,
		clearedGateDemand: 4,
		gateRewardPaidKb: 96,
	}),
});

const noop = () => {};

const renderCleared = (view = cleared) =>
	render(<RewardView view={view} onReviewAnswers={noop} onContinue={noop} />);

describe("RewardView", () => {
	it("names the gate just cleared, not the one the run now stands at", () => {
		renderCleared();

		expect(screen.getByText("Lavender cleared")).toBeInTheDocument();
	});

	it("grades the window against the cleared gate's demand, not the next one's", () => {
		renderCleared();

		expect(screen.getByText(/of 4% needed/)).toBeInTheDocument();
	});

	it("wears the cleared gate's colour, not the colour of the gate ahead", () => {
		const { container } = renderCleared();

		expect(container.querySelector("[data-swatch-theme]")).toHaveAttribute(
			"data-swatch-theme",
			"lavender"
		);
	});

	it("names the gate coming up next", () => {
		renderCleared();

		expect(screen.getByText("next up · Rainbow")).toBeInTheDocument();
	});

	it("groups the window's coverage by category", () => {
		renderCleared();

		expect(screen.getByText("JavaScript")).toBeInTheDocument();
		expect(screen.getByText("2 polls")).toBeInTheDocument();
		expect(screen.getByText("+3.5")).toBeInTheDocument();
	});

	it("leaves out a category the window never asked about", () => {
		renderCleared();

		expect(screen.queryByText("Ruby")).not.toBeInTheDocument();
	});

	it("totals the coverage the window earned", () => {
		renderCleared();

		expect(screen.getByText("+4.5%")).toBeInTheDocument();
	});

	it("moves on to the shop", async () => {
		const onContinue = vi.fn();
		render(
			<RewardView
				view={cleared}
				onReviewAnswers={noop}
				onContinue={onContinue}
			/>
		);

		await userEvent.click(
			screen.getByRole("button", { name: "To the shop →" })
		);

		expect(onContinue).toHaveBeenCalledOnce();
	});

	it("reaches the answer review", async () => {
		const onReviewAnswers = vi.fn();
		render(
			<RewardView
				view={cleared}
				onReviewAnswers={onReviewAnswers}
				onContinue={noop}
			/>
		);

		await userEvent.click(
			screen.getByRole("button", { name: "Review answers" })
		);

		expect(onReviewAnswers).toHaveBeenCalledOnce();
	});

	it("puts the bill on the ledger as a negative, so the column totals the balance", () => {
		renderCleared(
			createMockRunView({
				...cleared,
				gatePayout: { ...cleared.gatePayout, subscriptionBillKb: 16 },
			})
		);

		expect(screen.getByText("subscriptions")).toBeInTheDocument();
		expect(screen.getByText("−16 KB")).toBeInTheDocument();
		expect(screen.queryByText("slot rent")).not.toBeInTheDocument();
	});

	it("keeps a bill of zero off the ledger, which would only read as noise", () => {
		renderCleared();

		expect(screen.queryByText("subscriptions")).not.toBeInTheDocument();
		expect(screen.queryByText("slot rent")).not.toBeInTheDocument();
	});

	it("reports the balance the shop will spend", () => {
		renderCleared();

		expect(screen.getByText("240 KB")).toBeInTheDocument();
	});
});

describe("RewardView changed configs", () => {
	it("badges a config the gate upgraded, faded and deleted", () => {
		renderCleared(
			createMockRunView({
				...cleared,
				gatePayout: {
					...cleared.gatePayout,
					autoUpgradedConfig: CONFIGS.js,
					lapsedConfigs: [CONFIGS.ts],
					deletedConfigs: [CONFIGS.eslint],
				},
			})
		);

		expect(screen.getByText("upgraded")).toBeInTheDocument();
		expect(screen.getByText("faded")).toBeInTheDocument();
		expect(screen.getByText("gone")).toBeInTheDocument();
		expect(screen.getByText("3 configs")).toBeInTheDocument();
	});

	// A quiet gate changed nothing; saying "0 configs" would still be true.
	it("reports no changes when the gate left the build alone", () => {
		renderCleared();

		expect(screen.getByText("0 configs")).toBeInTheDocument();
	});
});
