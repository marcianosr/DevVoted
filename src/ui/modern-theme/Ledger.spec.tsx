import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Ledger, type LedgerEntry, ledgerTotal } from "./Ledger.ui";
import { Mark } from "./Mark.ui";

const COVERAGE: readonly LedgerEntry[] = [
	{
		id: "javascript",
		name: "javascript",
		lead: <Mark variant="pass" shape="box" />,
		notes: ["2 polls", ".js ×1.25"],
		value: 2.3,
	},
	{
		id: "git",
		name: "git",
		lead: <Mark variant="pass" shape="box" />,
		notes: ["1 poll"],
		value: 1.2,
	},
	{
		id: "typescript",
		name: "typescript",
		lead: <Mark variant="warn" shape="box" />,
		notes: ["1 poll", "partly right"],
		value: 1,
	},
	{
		id: "css",
		name: "css",
		lead: <Mark variant="fail" shape="box" />,
		notes: ["missed", "streak reset"],
		value: -0.3,
	},
	{
		id: "vue",
		name: "vue",
		lead: <Mark variant="blank" shape="box" />,
		notes: ["no polls"],
		value: 0,
	},
];

const STORAGE: readonly LedgerEntry[] = [
	{ id: "gate", name: "gate clear", notes: ["4 of 5", "32 × g1"], value: 26 },
	{
		id: "IndexedDB",
		name: "IndexedDB",
		lead: <Mark variant="pass" />,
		notes: ["4 correct"],
		value: 32,
	},
	{
		id: "UnitTests",
		name: "Unit Tests",
		lead: <Mark variant="pass" />,
		notes: ["on clear"],
		value: 32,
	},
];

describe("ledgerTotal", () => {
	it("rounds tenths that binary floating point cannot hold", () => {
		const drifting: readonly LedgerEntry[] = [
			{ id: "css", name: "css", value: 1.1 },
			{ id: "git", name: "git", value: 2.2 },
		];

		expect(drifting.reduce((sum, entry) => sum + entry.value, 0)).not.toBe(3.3);
		expect(ledgerTotal(drifting)).toBe(3.3);
	});

	it("adds the column up", () => {
		expect(ledgerTotal(COVERAGE)).toBe(4.2);
		expect(ledgerTotal(STORAGE)).toBe(90);
	});

	it("totals an empty column to nothing rather than NaN", () => {
		expect(ledgerTotal([])).toBe(0);
	});
});

describe("Ledger", () => {
	it("attributes each figure to what earned it", () => {
		render(<Ledger title="coverage" unit="%" entries={COVERAGE} showDetail />);

		expect(screen.getByText("javascript")).toBeInTheDocument();
		expect(screen.getByText("2 polls")).toBeInTheDocument();
		expect(screen.getByText(".js ×1.25")).toBeInTheDocument();
		expect(screen.getByText("+2.3")).toBeInTheDocument();
	});

	it("colours a loss against the gains around it", () => {
		render(<Ledger title="coverage" unit="%" entries={COVERAGE} showDetail />);

		expect(screen.getByText("+1.2")).toHaveClass("text-celadon");
		expect(screen.getByText("−0.3")).toHaveClass("text-cinnabar");
	});

	it("states the currency on every line of a storage column", () => {
		render(<Ledger title="storage" unit="KB" entries={STORAGE} showDetail />);

		expect(screen.getByText("+26 KB")).toBeInTheDocument();
		expect(screen.getByText("+90 KB")).toBeInTheDocument();
	});

	it("leaves a coverage line bare and units only its total", () => {
		render(<Ledger title="coverage" unit="%" entries={COVERAGE} showDetail />);

		expect(screen.getByText("+1.2")).toBeInTheDocument();
		expect(screen.queryByText("+1.2%")).not.toBeInTheDocument();
	});

	it("hides the attribution but still totals every entry behind it", () => {
		render(
			<Ledger title="storage" unit="KB" entries={STORAGE} showDetail={false} />
		);

		expect(screen.queryByText("IndexedDB")).not.toBeInTheDocument();
		expect(screen.queryByText("+32 KB")).not.toBeInTheDocument();
		expect(screen.getByText("+90 KB")).toBeInTheDocument();
	});

	it("suffixes a coverage total with a percent and no space", () => {
		render(<Ledger title="coverage" unit="%" entries={COVERAGE} showDetail />);

		expect(screen.getByText("+4.2%")).toBeInTheDocument();
	});

	it("computes the total instead of taking one it could contradict", () => {
		render(
			<Ledger
				title="storage"
				unit="KB"
				entries={STORAGE.slice(0, 2)}
				showDetail
			/>
		);

		expect(screen.getByText("+58 KB")).toBeInTheDocument();
	});

	it("names the column in lower case, the way the theme writes everything", () => {
		render(<Ledger title="coverage" unit="%" entries={COVERAGE} showDetail />);

		expect(
			screen.getByRole("heading", { name: "coverage" })
		).toBeInTheDocument();
	});

	it("marks each category with how its polls went", () => {
		render(<Ledger title="coverage" unit="%" entries={COVERAGE} showDetail />);

		expect(screen.getAllByRole("img", { name: "passing" })).toHaveLength(2);
		expect(screen.getAllByRole("img", { name: "warning" })).toHaveLength(1);
		expect(screen.getAllByRole("img", { name: "failing" })).toHaveLength(1);
	});

	it("leaves a category with no polls unmarked and silent", () => {
		render(<Ledger title="coverage" unit="%" entries={COVERAGE} showDetail />);

		// Five rows, four verdicts: the vue row has nothing to report, so it
		// announces nothing rather than announcing an absence.
		expect(screen.getByText("vue")).toBeInTheDocument();
		expect(screen.queryAllByRole("img")).toHaveLength(4);
	});

	it("dims a line that never fired without dropping it", () => {
		render(
			<Ledger
				title="storage"
				unit="KB"
				showDetail
				entries={[
					{
						id: "gate",
						name: "gate clear",
						notes: ["not paid"],
						value: 0,
						dimmed: true,
					},
				]}
			/>
		);

		expect(screen.getByText("gate clear").closest("li")).toHaveClass(
			"opacity-50"
		);
	});

	it("prints a footer that is not the sum when one is given", () => {
		render(
			<Ledger
				title="coverage"
				unit="%"
				entries={COVERAGE}
				showDetail
				footer={{ label: "short by", value: "7.8%", tone: "cinnabar" }}
			/>
		);

		expect(screen.getByText("short by")).toBeInTheDocument();
		expect(screen.getByText("7.8%")).toHaveClass("text-cinnabar");
		expect(screen.queryByText("+4.2%")).not.toBeInTheDocument();
	});
});
