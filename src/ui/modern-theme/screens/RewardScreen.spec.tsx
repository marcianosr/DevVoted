import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { LedgerEntry } from "../Ledger.ui";
import type { SwatchTrackItem } from "../SwatchTrack.ui";
import type { CrumbVerdict } from "../Trail.ui";
import { RewardScreen, type RewardScreenProps } from "./RewardScreen.ui";

const track: SwatchTrackItem[] = Array.from({ length: 13 }, (_, gate) =>
	gate === 0
		? { gate, state: "earned", theme: "pallet" }
		: { gate, state: "locked" }
);

const coverage: readonly LedgerEntry[] = [
	{ id: "javascript", name: "javascript", value: 2.3 },
	{ id: "git", name: "git", value: 1.2 },
	{ id: "typescript", name: "typescript", value: 1 },
	{ id: "css", name: "css", value: -0.3 },
];

const storage: readonly LedgerEntry[] = [
	{ id: "gate", name: "gate reward", value: 26 },
	{ id: "IndexedDB", name: "IndexedDB", value: 32 },
	{ id: "UnitTests", name: "Unit Tests", value: 32 },
];

const outcomes: readonly CrumbVerdict[] = [
	"correct",
	"wrong",
	"correct",
	"correct",
	"correct",
];

const shared = {
	gateName: "Pallet",
	requiredCoverage: 3,
	track,
	coverage,
	storage,
	outcomes,
	detailShown: false,
	onToggleDetail: () => {},
	theme: "pallet",
};

const props: RewardScreenProps = {
	...shared,
	outcome: "cleared",
	clearedGate: 0,
	spendableKb: 102,
};

const held: RewardScreenProps = {
	...shared,
	outcome: "held",
	peelCount: 2,
};

describe("RewardScreen", () => {
	it("names the swatch and the gate that awarded it", () => {
		render(<RewardScreen {...props} />);

		expect(
			screen.getByRole("heading", { name: "Pallet Swatch" })
		).toBeInTheDocument();
		expect(
			screen.getByText("gate 0 cleared · yours across every run")
		).toBeInTheDocument();
	});

	it("counts the collection rather than pointing at a rung", () => {
		render(<RewardScreen {...props} />);

		expect(screen.getByText("1 of 13 collected")).toBeInTheDocument();
	});

	it("reads its headline figures off the ledgers below them", () => {
		render(<RewardScreen {...props} />);

		expect(screen.getByText("4.2%")).toBeInTheDocument();
		expect(screen.getByText("4 of 5 correct")).toBeInTheDocument();
		// Twice on purpose: the headline and the ledger it summarises print one
		// number, so the two cannot contradict each other.
		expect(screen.getAllByText("+90 KB")).toHaveLength(2);
	});

	it("greens the coverage figure when the demand is met", () => {
		render(<RewardScreen {...props} />);

		expect(screen.getByText("4.2%")).toHaveClass("text-celadon");
	});

	it("reddens the coverage figure when the clear fell short", () => {
		render(
			<RewardScreen
				{...shared}
				outcome="cleared"
				clearedGate={0}
				spendableKb={102}
				requiredCoverage={12}
			/>
		);

		expect(screen.getByText("4.2%")).toHaveClass("text-cinnabar");
	});

	it("states what the shop ahead has to spend", () => {
		render(<RewardScreen {...props} />);

		expect(screen.getByText("102 KB to spend")).toBeInTheDocument();
	});

	it("rests with the attribution hidden and the totals showing", () => {
		render(<RewardScreen {...props} />);

		expect(screen.queryByText("IndexedDB")).not.toBeInTheDocument();
		expect(screen.getByText("+4.2%")).toBeInTheDocument();
	});

	it("governs both columns from one control", async () => {
		const onToggleDetail = vi.fn();
		render(
			<RewardScreen
				{...shared}
				outcome="cleared"
				clearedGate={0}
				spendableKb={102}
				onToggleDetail={onToggleDetail}
			/>
		);

		const toggle = screen.getByRole("button", { name: "Expand details" });
		expect(toggle).toHaveAttribute("aria-expanded", "false");

		await userEvent.click(toggle);

		expect(onToggleDetail).toHaveBeenCalledOnce();
	});

	it("shows every column's attribution once the control is on", () => {
		render(
			<RewardScreen
				{...shared}
				outcome="cleared"
				clearedGate={0}
				spendableKb={102}
				detailShown
			/>
		);

		expect(screen.getByText("javascript")).toBeInTheDocument();
		expect(screen.getByText("IndexedDB")).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "Collapse details" })
		).toHaveAttribute("aria-expanded", "true");
	});

	it("offers no way forward until one is wired", () => {
		render(<RewardScreen {...props} />);

		expect(
			screen.queryByRole("button", { name: /Enter shop/ })
		).not.toBeInTheDocument();
		expect(
			screen.queryByRole("button", { name: "Review answers" })
		).not.toBeInTheDocument();
	});

	it("opens the shop and the answer review from the panel", async () => {
		const onContinue = vi.fn();
		const onReviewAnswers = vi.fn();
		render(
			<RewardScreen
				{...shared}
				outcome="cleared"
				clearedGate={0}
				spendableKb={102}
				onContinue={onContinue}
				onReviewAnswers={onReviewAnswers}
			/>
		);

		await userEvent.click(screen.getByRole("button", { name: /Enter shop/ }));
		await userEvent.click(
			screen.getByRole("button", { name: "Review answers" })
		);

		expect(onContinue).toHaveBeenCalledOnce();
		expect(onReviewAnswers).toHaveBeenCalledOnce();
	});

	it("holds the swatch back and says so when the gate was not cleared", () => {
		render(<RewardScreen {...held} />);

		expect(
			screen.getByRole("heading", { name: "Pallet Swatch" })
		).toBeInTheDocument();
		expect(screen.getByText("not earned · the gate holds")).toBeInTheDocument();
		expect(
			screen.queryByText(/yours across every run/)
		).not.toBeInTheDocument();
	});

	it("measures the shortfall against the demand, not against the column", () => {
		render(<RewardScreen {...held} requiredCoverage={12} detailShown />);

		expect(screen.getByText("short by")).toBeInTheDocument();
		expect(screen.getByText("7.8%")).toBeInTheDocument();
	});

	it("calls what is left kept rather than earned", () => {
		render(<RewardScreen {...held} detailShown />);

		expect(screen.getByText("kept")).toBeInTheDocument();
		expect(screen.queryByText("total")).not.toBeInTheDocument();
	});

	it("offers the peel rather than the shop, and names the price in configs", async () => {
		const onChoosePeel = vi.fn();
		render(<RewardScreen {...held} onChoosePeel={onChoosePeel} />);

		await userEvent.click(
			screen.getByRole("button", { name: "Choose 2 to peel →" })
		);

		expect(onChoosePeel).toHaveBeenCalledOnce();
		expect(
			screen.queryByRole("button", { name: /Enter shop/ })
		).not.toBeInTheDocument();
	});
});
