import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { LedgerRows } from "./LedgerRows.ui";

describe("LedgerRows", () => {
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
