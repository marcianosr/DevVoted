import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { LedgerRows } from "./LedgerRows.ui";

describe("LedgerRows", () => {
	it("states the units a row added and tags the form it was sold in", () => {
		render(
			<LedgerRows
				rows={[
					{
						label: ".js",
						tags: [{ label: "×1.25" }],
						detail: "matches JavaScript",
						figures: [{ label: "+0.25", tone: "quiet" }],
					},
				]}
			/>
		);

		expect(screen.getByText("+0.25")).toBeInTheDocument();
		expect(screen.getByText("×1.25")).toBeInTheDocument();
		expect(screen.getByText("matches JavaScript")).toBeInTheDocument();
	});

	it("rules between every row by default, so a ledger reads as a list", () => {
		const { container } = render(
			<LedgerRows
				rows={[
					{ label: "right answer", figures: [{ label: "1.00" }] },
					{ label: ".js", figures: [{ label: "+0.25" }] },
					{ label: "paid", figures: [{ label: "1.25" }], total: true },
				]}
			/>
		);

		expect(container.querySelectorAll(".border-t")).toHaveLength(2);
	});

	it("rules only above the total when asked, so a receipt reads as a sum", () => {
		const { container } = render(
			<LedgerRows
				rules="total"
				rows={[
					{ label: "right answer", figures: [{ label: "1.00" }] },
					{ label: ".js", figures: [{ label: "+0.25" }] },
					{ label: "paid", figures: [{ label: "1.25" }], total: true },
				]}
			/>
		);

		expect(container.querySelectorAll(".border-t")).toHaveLength(1);
	});

	it("states a row's verdict beside what it paid", () => {
		render(
			<LedgerRows
				rows={[
					{
						verdict: "correct",
						detail: "Which of these are React hooks?",
						figures: [{ label: "+8.0", color: "viridian" }],
					},
				]}
			/>
		);

		expect(screen.getByText("PASS")).toBeInTheDocument();
		expect(screen.getByText("+8.0")).toBeInTheDocument();
	});

	it("names the rung a partial earned, so a part-marked row says how part", () => {
		render(
			<LedgerRows
				rows={[{ verdict: "partial", share: 0.75, detail: "Pick every hook" }]}
			/>
		);

		expect(screen.getByText("PART ¾")).toBeInTheDocument();
	});

	it("leaves a row without a verdict unmarked, the ledger carrying payouts too", () => {
		render(
			<LedgerRows rows={[{ label: "gate cleared", detail: "+208 KB" }]} />
		);

		expect(screen.queryByText("PASS")).not.toBeInTheDocument();
		expect(screen.queryByText("FAIL")).not.toBeInTheDocument();
	});

	it("renders one row per entry, in the order the gate asked them", () => {
		render(
			<LedgerRows
				rows={[
					{ verdict: "correct", detail: "first" },
					{ verdict: "partial", share: 0.5, detail: "second" },
					{ verdict: "wrong", detail: "third" },
				]}
			/>
		);

		expect(screen.getByText("PASS")).toBeInTheDocument();
		expect(screen.getByText("PART ½")).toBeInTheDocument();
		expect(screen.getByText("FAIL")).toBeInTheDocument();
	});
});
