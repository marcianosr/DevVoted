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

describe("RewardView on a clear", () => {
	it("names the gate just cleared, not the one the run now stands at", () => {
		render(
			<RewardView
				view={cleared}
				outcome="cleared"
				onReviewAnswers={() => {}}
				onContinue={() => {}}
			/>
		);

		expect(
			screen.getByRole("heading", { name: "Lavender Swatch" })
		).toBeInTheDocument();
	});

	it("grades the window against the cleared gate's demand, not the next one's", () => {
		render(
			<RewardView
				view={cleared}
				outcome="cleared"
				onReviewAnswers={() => {}}
				onContinue={() => {}}
			/>
		);

		expect(screen.getByText("of 4% needed")).toBeInTheDocument();
	});

	it("wears the cleared gate's colour, not the colour of the gate ahead", () => {
		const { container } = render(
			<RewardView
				view={cleared}
				outcome="cleared"
				onReviewAnswers={() => {}}
				onContinue={() => {}}
			/>
		);

		expect(container.firstElementChild).toHaveAttribute(
			"data-gate-theme",
			"lavender"
		);
	});

	it("groups the window's coverage by category, worst outcome winning the mark", () => {
		render(
			<RewardView
				view={cleared}
				outcome="cleared"
				onReviewAnswers={() => {}}
				onContinue={() => {}}
			/>
		);

		expect(screen.getByText("JavaScript")).toBeInTheDocument();
		expect(screen.getByText("2 polls")).toBeInTheDocument();
		expect(screen.getByText("+3.5")).toBeInTheDocument();
		expect(
			screen.getByRole("button", {
				name: "Every poll in this category was missed",
			})
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", {
				name: "Partly right, so this scored less than a clean answer",
			})
		).toBeInTheDocument();
	});

	it("leaves out a category the window never asked about", () => {
		render(
			<RewardView
				view={cleared}
				outcome="cleared"
				onReviewAnswers={() => {}}
				onContinue={() => {}}
			/>
		);

		expect(screen.queryByText("Ruby")).not.toBeInTheDocument();
	});

	it("states what the balance can buy and moves on to the shop", async () => {
		const onContinue = vi.fn();
		render(
			<RewardView
				view={cleared}
				outcome="cleared"
				onReviewAnswers={() => {}}
				onContinue={onContinue}
			/>
		);

		expect(screen.getByText("240 KB to spend")).toBeInTheDocument();
		await userEvent.click(screen.getByRole("button", { name: "Enter shop →" }));

		expect(onContinue).toHaveBeenCalledOnce();
	});

	it("offers no removal on a gate that was cleared", () => {
		render(
			<RewardView
				view={cleared}
				outcome="cleared"
				onReviewAnswers={() => {}}
				onContinue={() => {}}
			/>
		);

		expect(
			screen.queryByRole("button", { name: /to remove/ })
		).not.toBeInTheDocument();
	});

	it("puts the bill on the ledger as a negative, so the column totals the balance", () => {
		render(
			<RewardView
				view={createMockRunView({
					...cleared,
					gatePayout: {
						...cleared.gatePayout,
						subscriptionBillKb: 16,
					},
				})}
				outcome="cleared"
				onReviewAnswers={() => {}}
				onContinue={() => {}}
			/>
		);

		expect(screen.queryByText("storage plan")).not.toBeInTheDocument();
		expect(screen.getByText("subscriptions")).toBeInTheDocument();
		expect(screen.getByText("−16 KB")).toBeInTheDocument();
	});

	it("keeps a bill of zero off the ledger, which would only read as noise", () => {
		render(
			<RewardView
				view={cleared}
				outcome="cleared"
				onReviewAnswers={() => {}}
				onContinue={() => {}}
			/>
		);

		expect(screen.queryByText("subscriptions")).not.toBeInTheDocument();
	});
});

describe("RewardView on a held gate", () => {
	const held = createMockRunView({
		gatesCleared: 4,
		answeredThisGate: answered,
		configs: [CONFIGS.js, CONFIGS.ts, CONFIGS.eslint],
		peelSpotsRemaining: 2,
	});

	it("says the swatch was not earned rather than announcing a clear", () => {
		render(
			<RewardView
				view={held}
				outcome="held"
				onReviewAnswers={() => {}}
				onChooseRemoval={() => {}}
			/>
		);

		expect(screen.getByText("not earned · the gate holds")).toBeInTheDocument();
	});

	it("prices the miss in configs and hands off to the removal screen", async () => {
		const onChooseRemoval = vi.fn();
		render(
			<RewardView
				view={held}
				outcome="held"
				onReviewAnswers={() => {}}
				onChooseRemoval={onChooseRemoval}
			/>
		);

		await userEvent.click(
			screen.getByRole("button", { name: "Choose 2 to remove →" })
		);

		expect(onChooseRemoval).toHaveBeenCalledOnce();
	});

	it("offers no shop, since the gate has not been cleared", () => {
		render(
			<RewardView
				view={held}
				outcome="held"
				onReviewAnswers={() => {}}
				onChooseRemoval={() => {}}
			/>
		);

		expect(
			screen.queryByRole("button", { name: /Enter shop/ })
		).not.toBeInTheDocument();
	});
});

describe("RewardView details", () => {
	it("opens with attribution showing, and closes on request", async () => {
		render(
			<RewardView
				view={cleared}
				outcome="cleared"
				onReviewAnswers={() => {}}
				onContinue={() => {}}
			/>
		);

		const toggle = screen.getByRole("button", { name: "Collapse details" });
		expect(toggle).toHaveAttribute("aria-expanded", "true");

		await userEvent.click(toggle);

		expect(
			screen.getByRole("button", { name: "Expand details" })
		).toHaveAttribute("aria-expanded", "false");
	});

	it("goes to the answer review", async () => {
		const onReviewAnswers = vi.fn();
		render(
			<RewardView
				view={cleared}
				outcome="cleared"
				onReviewAnswers={onReviewAnswers}
				onContinue={() => {}}
			/>
		);

		await userEvent.click(
			screen.getByRole("button", { name: "Review answers" })
		);

		expect(onReviewAnswers).toHaveBeenCalledOnce();
	});
});
