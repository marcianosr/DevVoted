import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { PolldexEntry } from "~/modules/collection/dex/domain/polldex.model";
import { PollsView } from "~/modules/collection/dex/presentation/PollsView.component";

const seen = (overrides: Partial<PolldexEntry> = {}): PolldexEntry => ({
	id: 1,
	pollNumber: 1,
	categoryCode: "css",
	seen: true,
	question: "What does the box model describe?",
	timesSeen: 3,
	answeredCount: 3,
	accuracy: 100,
	...overrides,
});

const unmet = (overrides: Partial<PolldexEntry> = {}): PolldexEntry =>
	seen({
		seen: false,
		question: null,
		timesSeen: 0,
		answeredCount: 0,
		accuracy: null,
		...overrides,
	});

const ROSTER: PolldexEntry[] = [
	seen({ id: 1, pollNumber: 1, accuracy: 100 }),
	seen({
		id: 2,
		pollNumber: 2,
		categoryCode: "js",
		question: "Which array method returns a shallow copy?",
		accuracy: 20,
	}),
	unmet({ id: 3, pollNumber: 3 }),
];

const band = (name: string) => screen.getByRole("button", { name });

describe("PollsView", () => {
	it("opens on the polls you have met, leaving the rest out of the table", () => {
		render(<PollsView entries={ROSTER} />);

		expect(
			screen.getByText("What does the box model describe?")
		).toBeInTheDocument();
		expect(screen.queryByText("???")).not.toBeInTheDocument();
	});

	it("tallies every band on its own pill", () => {
		render(<PollsView entries={ROSTER} />);

		expect(band("seen · 2")).toBeInTheDocument();
		expect(band("mastered · 1")).toBeInTheDocument();
		expect(band("fumbled · 1")).toBeInTheDocument();
		expect(band("all · 3")).toBeInTheDocument();
	});

	it("redacts a poll it has never served rather than naming it", async () => {
		render(<PollsView entries={ROSTER} />);

		await userEvent.click(band("all · 3"));

		// Four cells of ???: question, category, times seen and accuracy.
		expect(screen.getAllByText("???")).toHaveLength(4);
	});

	it("offers the reveal only where there are unmet rows to draw", async () => {
		render(<PollsView entries={ROSTER} />);

		expect(
			screen.queryByRole("button", { name: /hide them/ })
		).not.toBeInTheDocument();

		await userEvent.click(band("all · 3"));

		expect(
			screen.getByRole("button", { name: "hide them" })
		).toBeInTheDocument();
	});

	it("collapses the unmet rows when the reveal is turned off", async () => {
		render(<PollsView entries={ROSTER} />);

		await userEvent.click(band("all · 3"));
		await userEvent.click(screen.getByRole("button", { name: "hide them" }));

		expect(screen.queryByText("???")).not.toBeInTheDocument();
		expect(screen.getByText("1 polls you haven't met yet")).toBeInTheDocument();
	});

	it("narrows the pills to the chosen category, not just the table", async () => {
		render(<PollsView entries={ROSTER} />);

		await userEvent.selectOptions(
			screen.getByRole("combobox", { name: "Category" }),
			"js"
		);

		expect(band("seen · 1")).toBeInTheDocument();
		expect(band("mastered · 0")).toBeInTheDocument();
		expect(
			screen.queryByText("What does the box model describe?")
		).not.toBeInTheDocument();
	});

	it("keeps a poll served but never answered out of both accuracy bands", async () => {
		render(<PollsView entries={[seen({ id: 9, accuracy: null })]} />);

		expect(band("seen · 1")).toBeInTheDocument();
		expect(band("mastered · 0")).toBeInTheDocument();
		expect(band("fumbled · 0")).toBeInTheDocument();
	});
});
