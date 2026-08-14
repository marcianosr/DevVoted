import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DataTable } from "~/ui/DataTable.ui";

import type { PolldexEntry } from "~/modules/collection/dex/domain/polldex.model";
import { polldexColumns } from "~/modules/collection/dex/presentation/polldexColumns.ui";

const seen = (overrides: Partial<PolldexEntry> = {}): PolldexEntry => ({
	id: 7,
	pollNumber: 7,
	categoryCode: "css",
	seen: true,
	question: "What does the box model describe?",
	timesSeen: 7,
	answeredCount: 7,
	accuracy: 86,
	...overrides,
});

const unseen: PolldexEntry = {
	id: 17,
	pollNumber: 17,
	categoryCode: "css",
	seen: false,
	question: null,
	timesSeen: 0,
	answeredCount: 0,
	accuracy: null,
};

const renderTable = (entries: PolldexEntry[]) =>
	render(<DataTable columns={polldexColumns} data={entries} />);

describe("polldexColumns", () => {
	it("renders dex number, question, category, seen count and accuracy for a seen poll", () => {
		renderTable([seen()]);

		expect(screen.getByText("#007")).toBeInTheDocument();
		expect(
			screen.getByText("What does the box model describe?")
		).toBeInTheDocument();
		expect(screen.getByText("CSS")).toBeInTheDocument();
		expect(screen.getByText("×7")).toBeInTheDocument();
		expect(screen.getByText("86%")).toBeInTheDocument();
	});

	it("colors accuracy green/yellow/red by threshold", () => {
		renderTable([
			seen({ id: 1, pollNumber: 1, accuracy: 86 }),
			seen({ id: 2, pollNumber: 2, accuracy: 50 }),
			seen({ id: 3, pollNumber: 3, accuracy: 20 }),
		]);
		expect(screen.getByText("86%")).toHaveClass("text-viridian");
		expect(screen.getByText("50%")).toHaveClass("text-saffron");
		expect(screen.getByText("20%")).toHaveClass("text-cinnabar");
	});

	it("redacts question and category to ??? and dashes stats for an unseen poll", () => {
		renderTable([unseen]);

		expect(screen.getByText("#017")).toBeInTheDocument();
		expect(screen.getAllByText("???")).toHaveLength(2);
		expect(screen.getAllByText("—")).toHaveLength(2);
		expect(screen.queryByText("CSS")).not.toBeInTheDocument();
	});

	it("sorts unanswered polls last by accuracy in both directions", () => {
		renderTable([
			seen({ id: 1, pollNumber: 1, accuracy: 50 }),
			unseen,
			seen({ id: 3, pollNumber: 3, accuracy: 90 }),
		]);

		const accuracyHeader = screen.getByRole("button", { name: "Accuracy" });
		const dexColumn = () =>
			screen
				.getAllByRole("row")
				.slice(1)
				.map((row) => within(row).getAllByRole("cell")[0].textContent);

		fireEvent.click(accuracyHeader); // ascending
		expect(dexColumn()).toEqual(["#001", "#003", "#017"]);

		fireEvent.click(accuracyHeader); // descending — null still last
		expect(dexColumn()).toEqual(["#003", "#001", "#017"]);
	});
});
