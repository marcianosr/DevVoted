import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
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
	coveragePerWrong: -1.3,
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
		// The header composes its audit line from ids, so the count is its own
		// node. GateHeader's spec owns the names that follow it.
		expect(screen.getByText("1 audit")).toBeInTheDocument();
	});

	// A build filling every slot it holds reads full, and the row for the slot a
	// later gate grants is a preview beside it rather than width already owned.
	it("counts the build against the width it holds, not the width to come", () => {
		render(<PrepScreen {...props} />);

		expect(screen.getByText("3 / 3")).toBeInTheDocument();
		expect(screen.getByText("opens when gate 6 clears")).toBeInTheDocument();
	});

	it("counts an empty slot the build could still fill", () => {
		render(
			<PrepScreen
				{...props}
				slots={[{ id: "slot-4" }, { id: "slot-5", gate: 6 }]}
			/>
		);

		expect(screen.getByText("3 / 4")).toBeInTheDocument();
	});

	it("states both things the gate asks for", () => {
		render(<PrepScreen {...props} />);

		expect(screen.getByText("Answer all 5 polls")).toBeInTheDocument();
		expect(
			screen.getByText("Earn 60% coverage in this window")
		).toBeInTheDocument();
		expect(screen.getByText("0 / 60%")).toBeInTheDocument();
	});

	// The peel moved into the shared Stake fold, which every gate surface now
	// composes, so prep states it in the same words the poll rail does.
	it("prices a miss in the Stake fold rather than in prose of its own", () => {
		render(<PrepScreen {...props} />);

		expect(screen.getByText("Stake")).toBeInTheDocument();
		expect(screen.getByText("Gate missed")).toBeInTheDocument();
		expect(screen.getByText("remove 2 configs")).toBeInTheDocument();
		expect(screen.getByText("Wrong answer")).toBeInTheDocument();
		expect(screen.getByText("−1.3")).toBeInTheDocument();
	});

	it("stays quiet about the run ending while the build can survive a miss", () => {
		render(<PrepScreen {...props} />);

		expect(screen.queryByText(/ends the run/)).not.toBeInTheDocument();
	});

	it("says the run ends when the removal would take the whole build", () => {
		render(<PrepScreen {...props} removeOnMiss={3} missIsFatal />);

		expect(
			screen.getByText("your whole pipeline — the run ends here")
		).toHaveClass("text-cinnabar");
		expect(screen.getByText("remove 3 configs")).toBeInTheDocument();
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

	// Only the bill that waits is qualified. A bill charged either way is just
	// the bill, and saying so on every line made the two read as equally special.
	it("qualifies the bill that waits for the clear, and only that one", () => {
		render(<PrepScreen {...props} />);

		expect(screen.getByText("on clear")).toBeInTheDocument();
		expect(screen.queryByText("pass or fail")).not.toBeInTheDocument();
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

		// Scoped to the fold: the gate header names the same audit, so an
		// unscoped query matches twice.
		const fold = screen.getByText("Audits").closest("details");
		if (!fold) throw new Error("No Audit fold rendered");

		expect(within(fold).getByText("Dependency Outage")).toHaveClass(
			"line-through"
		);
		expect(screen.getByText("reported passing")).toBeInTheDocument();
	});

	// Online, skipped and offline are all facts about a poll on deck, and prep has
	// none: a marker here would state something this screen cannot know.
	it("claims no status for the configs it lists", () => {
		render(<PrepScreen {...props} />);

		expect(screen.queryAllByRole("img", { name: "idle" })).toHaveLength(0);
	});

	// The build cannot be changed here, so the pipeline offers the trip rather
	// than a sentence describing it.
	it("sends the player to the shop from the pipeline it cannot edit", async () => {
		const onBackToShop = vi.fn();
		render(<PrepScreen {...props} onBackToShop={onBackToShop} />);

		await userEvent.click(
			screen.getByRole("button", { name: "Change build in shop" })
		);

		expect(onBackToShop).toHaveBeenCalledOnce();
		expect(
			screen.queryByRole("button", { name: /Drop/ })
		).not.toBeInTheDocument();
	});

	// Pushed to the far edge, a figure sat a gutter away from the thing it
	// priced and read as a column. Row.CONTENT is the flex-1 half of the row,
	// so landing inside it is what "on the label's own line" means structurally.
	it("sets a reward's figure on the label's line, not across the row", () => {
		render(<PrepScreen {...props} />);

		expect(screen.getByText("+96 KB").closest(".flex-1")).not.toBeNull();
	});

	// The build is a pipeline, and a pipeline runs in order. Without the numbers
	// the column read as an unordered inventory.
	it("numbers the build in the order it runs", () => {
		render(<PrepScreen {...props} />);

		const pipeline = screen.getByText("Your pipeline").closest("details");
		const rows = within(pipeline as HTMLElement).getAllByRole("listitem");

		expect(rows[0]).toHaveTextContent("1");
		expect(rows[1]).toHaveTextContent("2");
	});

	// What the gate is about to do to the build is not a thing to put away, and
	// a folded Audits section hid the one row that changes how a gate is played.
	it("opens every section, audits included", () => {
		const { container } = render(<PrepScreen {...props} />);

		expect(container.querySelectorAll("details:not([open])")).toHaveLength(0);
	});

	it("offers no trip to a shop the caller cannot open", () => {
		render(<PrepScreen {...props} />);

		expect(
			screen.queryByRole("button", { name: "Change build in shop" })
		).not.toBeInTheDocument();
	});

	it("lists the draw in play order, duplicates left standing", () => {
		render(<PrepScreen {...props} />);

		expect(screen.getAllByText("javascript")).toHaveLength(2);
		expect(screen.getByText("next gate")).toBeInTheDocument();
	});

	it("omits the sections a lean gate has nothing to put in", () => {
		render(<PrepScreen {...bare} />);

		expect(screen.queryByText("Audits")).not.toBeInTheDocument();
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
