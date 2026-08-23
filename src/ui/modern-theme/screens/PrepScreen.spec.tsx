import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { PrepScreen, type PrepScreenProps } from "./PrepScreen.ui";

const props: PrepScreenProps = {
	theme: "lavender",
	gateName: "Lavender",
	gate: {
		title: "Gate 4 · Lavender",
		audits: ["dependency-outage"],
		storage: { plan: "Standard plan", used: 184, cap: 640 },
	},
	pollCount: 5,
	coverageDemand: 60,
	coverageHeld: 0,
	removeOnMiss: 2,
	missIsFatal: false,
	configs: [
		{ id: "ts", label: ".ts" },
		{ id: "intellisense", label: "Intellisense" },
		{ id: "indexeddb", label: "IndexedDB" },
	],
	slots: [{ id: "slot-4", gate: 6 }],
	audits: [
		{
			id: "dependency-outage",
			description: "One config goes offline for this gate.",
		},
	],
	reward: {
		coveragePerCorrect: 2.6,
		storageKbPerCorrect: 8,
		matchingMultiplier: 1.25,
		streakMultiplier: 1.1,
		gateRewardKb: 96,
	},
	bills: [
		{ id: "plan", label: "Standard plan", kb: -32, billedOnMiss: true },
		{ id: "freemium", label: "Freemium", kb: -128, billedOnMiss: false },
	],
	prefetch: {
		thisGate: ["typescript", "javascript", "javascript"],
		nextGate: ["git"],
	},
};

const bare: PrepScreenProps = {
	...props,
	audits: [],
	bills: [],
	prefetch: undefined,
};

describe("PrepScreen", () => {
	it("wears the gate's own header, the way the poll screen does", () => {
		render(<PrepScreen {...props} />);

		expect(
			screen.getByRole("heading", { name: "Gate 4 · Lavender" })
		).toBeInTheDocument();
		expect(screen.getByText("1 audit · Dependency Outage")).toBeInTheDocument();
	});

	it("counts the build against the width the gate grants", () => {
		render(<PrepScreen {...props} />);

		expect(screen.getByText("3 / 4")).toBeInTheDocument();
		expect(screen.getByText("opens at gate 6")).toBeInTheDocument();
	});

	it("states both things the gate asks for", () => {
		render(<PrepScreen {...props} />);

		expect(screen.getByText("Answer all 5 polls")).toBeInTheDocument();
		expect(
			screen.getByText("Earn 60% coverage in this window")
		).toBeInTheDocument();
		expect(screen.getByText("0 / 60%")).toBeInTheDocument();
	});

	it("prices a miss in configs and in the polls it costs to try again", () => {
		render(<PrepScreen {...props} />);

		expect(
			screen.getByText(
				"A miss removes 2 configs, then you shop and run it again on 5 fresh polls."
			)
		).toBeInTheDocument();
	});

	it("stays quiet about the run ending while the build can survive a miss", () => {
		render(<PrepScreen {...props} />);

		expect(screen.queryByText(/ends the run/)).not.toBeInTheDocument();
	});

	it("says the run ends when the removal would take the whole build", () => {
		render(<PrepScreen {...props} removeOnMiss={3} missIsFatal />);

		expect(
			screen.getByText(
				"That removal takes your whole pipeline. A miss here ends the run."
			)
		).toHaveClass("text-cinnabar");
	});

	it("badges the multipliers beside the base they ride on", () => {
		render(<PrepScreen {...props} />);

		expect(screen.getByText("×1.25").parentElement).toHaveClass(
			"bg-celadon/15"
		);
		expect(screen.getByText("on a matching poll")).toBeInTheDocument();
		expect(screen.getByText("×1.1").parentElement).toHaveClass("bg-celadon/15");
		expect(screen.getByText("per streak step")).toBeInTheDocument();
	});

	it("drops the matching multiplier when no config focuses a category", () => {
		render(
			<PrepScreen
				{...props}
				reward={{ ...props.reward, matchingMultiplier: undefined }}
			/>
		);

		expect(screen.getByText("per streak step")).toBeInTheDocument();
		expect(screen.queryByText("on a matching poll")).not.toBeInTheDocument();
		expect(screen.queryByText("×1.25")).not.toBeInTheDocument();
	});

	it("badges what an answer pays and what the clear pays", () => {
		render(<PrepScreen {...props} />);

		expect(screen.getByText("+2.6").parentElement).toHaveClass("bg-celadon/15");
		expect(screen.getByText("+8 KB")).toBeInTheDocument();
		expect(screen.getByText("+96 KB")).toBeInTheDocument();
	});

	it("leaves the per-answer storage figure off a build that earns none", () => {
		render(
			<PrepScreen
				{...props}
				reward={{ ...props.reward, storageKbPerCorrect: 0 }}
			/>
		);

		expect(screen.queryByText("+0 KB")).not.toBeInTheDocument();
	});

	it("totals the subscriptions and still says what a miss alone costs", () => {
		render(<PrepScreen {...props} />);

		expect(screen.getAllByText("−160 KB")).toHaveLength(2);
		expect(screen.getByText("−32 KB on a miss")).toBeInTheDocument();
	});

	it("separates the bill that lands pass or fail from the one that waits", () => {
		render(<PrepScreen {...props} />);

		expect(screen.getByText("pass or fail")).toBeInTheDocument();
		expect(screen.getByText("on clear")).toBeInTheDocument();
	});

	it("keeps a single bill off the total row, which would only repeat it", () => {
		render(<PrepScreen {...props} bills={[props.bills[0]]} />);

		expect(screen.queryByText("Total this gate")).not.toBeInTheDocument();
	});

	it("warns when the balance cannot cover the bill", () => {
		render(<PrepScreen {...props} shortfallKb={56} />);

		expect(
			screen.getByText("56 KB short. What you cannot pay lapses.")
		).toHaveClass("text-cinnabar");
	});

	it("keeps a suppressed audit on the receipt, struck rather than hidden", () => {
		render(
			<PrepScreen
				{...props}
				audits={[{ ...props.audits[0], suppressed: true }]}
			/>
		);

		expect(screen.getByText("Dependency Outage")).toHaveClass("line-through");
		expect(screen.getByText("reported passing")).toBeInTheDocument();
	});

	it("marks the pipeline idle, since nothing has run against this gate yet", () => {
		render(<PrepScreen {...props} />);

		expect(screen.getAllByRole("img", { name: "idle" })).toHaveLength(3);
	});

	it("points at the shop rather than offering a drop at the door", () => {
		render(<PrepScreen {...props} />);

		expect(
			screen.getByText("Change your build in the shop.")
		).toBeInTheDocument();
		expect(
			screen.queryByRole("button", { name: /Drop/ })
		).not.toBeInTheDocument();
	});

	it("lists the draw in play order, duplicates left standing", () => {
		render(<PrepScreen {...props} />);

		expect(screen.getAllByText("javascript")).toHaveLength(2);
		expect(screen.getByText("next gate")).toBeInTheDocument();
	});

	it("omits the sections a lean gate has nothing to put in", () => {
		render(<PrepScreen {...bare} />);

		expect(screen.queryByText("Audit")).not.toBeInTheDocument();
		expect(screen.queryByText("Subscriptions")).not.toBeInTheDocument();
		expect(screen.queryByText("Prefetch")).not.toBeInTheDocument();
	});

	it("offers no way on or back until the hub actions are wired", () => {
		render(<PrepScreen {...bare} />);

		expect(screen.queryByRole("button")).not.toBeInTheDocument();
	});

	it("leaves the gate from the start button and the run from the other two", async () => {
		const onStart = vi.fn();
		const onBackToShop = vi.fn();
		const onCommunity = vi.fn();
		render(
			<PrepScreen
				{...props}
				onStart={onStart}
				onBackToShop={onBackToShop}
				onCommunity={onCommunity}
			/>
		);

		await userEvent.click(
			screen.getByRole("button", { name: "Start Lavender gate →" })
		);
		await userEvent.click(
			screen.getByRole("button", { name: "← Back to shop" })
		);
		await userEvent.click(screen.getByRole("button", { name: "Community →" }));

		expect(onStart).toHaveBeenCalledOnce();
		expect(onBackToShop).toHaveBeenCalledOnce();
		expect(onCommunity).toHaveBeenCalledOnce();
	});

	it("wears the countdown as its label while the gate is shut", () => {
		render(
			<PrepScreen {...props} onStart={() => {}} startLock="opens in 6h 12m" />
		);

		expect(
			screen.getByRole("button", { name: "opens in 6h 12m" })
		).toBeDisabled();
		expect(
			screen.queryByRole("button", { name: /Start Lavender/ })
		).not.toBeInTheDocument();
		expect(screen.getByText(/Today's polls are spent/)).toBeInTheDocument();
	});
});
