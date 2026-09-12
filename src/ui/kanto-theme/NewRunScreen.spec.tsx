import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";

import {
	NEW_RUN_EMPTY_LABEL,
	NEW_RUN_OUTCOMES_TITLE,
	createKantoNewRunScreenProps,
	kantoNewRunAt,
	newRunBuildNote,
} from "~/test/kantoPoll.factory";

import { NewRunScreen } from "./NewRunScreen.ui";

const props = createKantoNewRunScreenProps();

const objectives = () =>
	screen
		.getByRole("heading", { name: NEW_RUN_OUTCOMES_TITLE })
		.closest("section") as HTMLElement;

describe("NewRunScreen", () => {
	it("stands the build beside the hand it is dealt from", () => {
		render(<NewRunScreen {...props} />);

		expect(screen.getByText("Build")).toBeInTheDocument();
		expect(screen.getByText("Dealt")).toBeInTheDocument();
	});

	it("deals the hand and the readout down one column, never full width", () => {
		const { container } = render(<NewRunScreen {...props} />);

		const [dealing, holding] = [
			...(container.querySelector("div.grid")?.children ?? []),
		] as HTMLElement[];

		expect(within(dealing).getByText("Dealt")).toBeInTheDocument();
		expect(within(dealing).getByText("Build")).toBeInTheDocument();
		expect(within(holding).getByText(NEW_RUN_EMPTY_LABEL)).toBeInTheDocument();
		expect(within(holding).queryByText("Dealt")).toBeNull();
	});

	it("deals the hand above the weight it would cost to hold it", () => {
		render(<NewRunScreen {...props} />);

		const dealt = screen.getByText("Dealt");

		expect(
			dealt.compareDocumentPosition(screen.getByText("Build")) &
				Node.DOCUMENT_POSITION_FOLLOWING
		).toBeTruthy();
	});

	it("leaves the room for sale under the readout it would widen", () => {
		render(<NewRunScreen {...props} />);

		const offer = screen.getByRole("button", {
			name: /^carry 8 free weight/,
		});

		expect(
			screen.getByText("Build").compareDocumentPosition(offer) &
				Node.DOCUMENT_POSITION_FOLLOWING
		).toBeTruthy();
	});

	it("opens on a build that weighs nothing and bills nothing", () => {
		render(<NewRunScreen {...props} />);

		expect(
			screen.getByText("0 configs · 0 weight · 0 covered · 0 billable")
		).toBeInTheDocument();
	});

	it("speaks for the empty list without pretending a slot stands open", () => {
		render(<NewRunScreen {...props} />);

		expect(screen.getByText(NEW_RUN_EMPTY_LABEL)).toBeInTheDocument();
		expect(screen.queryByText("empty slot")).not.toBeInTheDocument();
	});

	it("sells free weight rather than a numbered slot", () => {
		render(<NewRunScreen {...props} />);

		expect(
			screen.getByRole("button", { name: /^carry 8 free weight/ })
		).toBeInTheDocument();
		expect(screen.queryByRole("button", { name: /^open slot/ })).toBeNull();
	});

	it("prices the offer in the purse the header names, there being two", () => {
		render(<NewRunScreen {...props} />);

		expect(screen.getByText("256 KB archive")).toBeInTheDocument();
	});

	it("reads the archive as the purse the header holds", () => {
		render(<NewRunScreen {...props} />);

		expect(screen.getByText("512 KB")).toBeInTheDocument();
		expect(screen.getByText("archive")).toBeInTheDocument();
	});

	it("titles itself the new run, under the gate it is about to run", () => {
		render(<NewRunScreen {...props} />);

		expect(screen.getByText("New run")).toBeInTheDocument();
		expect(screen.getByText("gate 0 · Pallet")).toBeInTheDocument();
	});

	it("names the shape of the climb beside the swatch track", () => {
		render(<NewRunScreen {...props} />);

		expect(
			screen.getByText(
				"thirteen gates, one a day — today's five polls are waiting"
			)
		).toBeInTheDocument();
	});

	it("wears the gate it is about to run", () => {
		const { container } = render(<NewRunScreen {...props} />);

		expect(container.firstElementChild).toHaveAttribute(
			"data-gate-theme",
			"pallet"
		);
		expect(container.firstElementChild).not.toHaveAttribute(
			"data-screen-theme"
		);
	});

	it("states what the build's own weight costs, under the build", () => {
		render(<NewRunScreen {...props} />);

		expect(screen.getByText(newRunBuildNote())).toBeInTheDocument();
	});

	it("opens the run on one pick, in the build and in the hand alike", () => {
		render(<NewRunScreen {...kantoNewRunAt(["js"])} />);

		expect(
			screen.getByText("1 configs · 1 weight · 1 covered · 0 billable")
		).toBeInTheDocument();
		expect(screen.getByText("4 left in the hand")).toBeInTheDocument();
		expect(screen.queryByText(NEW_RUN_EMPTY_LABEL)).not.toBeInTheDocument();
	});

	it("opens the free line higher once the archive has bought one", () => {
		render(<NewRunScreen {...kantoNewRunAt(["js"], 1, 1024)} />);

		expect(
			screen.getByRole("button", { name: /^carry 12 free weight/ })
		).toBeInTheDocument();
	});

	it("refuses an offer the archive cannot pay for, with the shortfall", () => {
		render(<NewRunScreen {...kantoNewRunAt([], 0, 32)} />);

		const stub = screen.getByRole("button", { name: /^carry 8 free weight/ });

		expect(stub).toBeDisabled();
		expect(screen.getByText("224 KB short")).toBeInTheDocument();
	});
});

describe("what the new run is climbing towards", () => {
	it("holds the objectives beside the build rather than under everything", () => {
		const { container } = render(<NewRunScreen {...props} />);

		const holding = container.querySelector("div.grid")
			?.lastElementChild as HTMLElement;

		expect(
			within(holding).getByRole("heading", {
				name: NEW_RUN_OUTCOMES_TITLE,
			})
		).toBeInTheDocument();
	});

	it("stacks the outcome rows, the column being too narrow to line them up", () => {
		render(<NewRunScreen {...props} />);

		expect(
			within(objectives()).getByText(
				"Gate cleared. The Pallet swatch is yours and gate 1 opens tomorrow."
			)
		).not.toHaveClass("flex-1");
	});

	it("reads the objectives after what is installed, the build coming first", () => {
		render(<NewRunScreen {...props} />);

		const empty = screen.getByText(NEW_RUN_EMPTY_LABEL);
		const table = screen.getByRole("heading", {
			name: NEW_RUN_OUTCOMES_TITLE,
		});

		expect(
			empty.compareDocumentPosition(table) & Node.DOCUMENT_POSITION_FOLLOWING
		).toBeTruthy();
	});

	it("cuts the opening gate's bands, dropping the ones with no room", () => {
		render(<NewRunScreen {...props} />);

		const table = objectives();

		expect(within(table).getByText("PERFECT")).toBeInTheDocument();
		expect(within(table).getByText("HEALTHY")).toBeInTheDocument();
		expect(within(table).getByText("OK")).toBeInTheDocument();
		expect(within(table).queryByText("SHAKY")).toBeNull();
		expect(within(table).queryByText("DANGER")).toBeNull();
	});

	it("reads the gate's own line on the bar above the table", () => {
		render(<NewRunScreen {...props} />);

		expect(
			within(objectives()).getByRole("img", { name: /0% of 5% needed/ })
		).toBeInTheDocument();
	});

	it("counts the right answers that reach the line, off the build it has", () => {
		render(<NewRunScreen {...props} />);

		expect(
			screen.getByText("One correct poll reaches the line.")
		).toBeInTheDocument();
	});

	it("refuses the start while nothing is picked", () => {
		render(<NewRunScreen {...props} />);

		expect(screen.getByRole("button", { name: "start gate 0" })).toBeDisabled();
	});

	it("states the gate's demand once, in the table rather than the footer", () => {
		render(<NewRunScreen {...props} />);

		expect(screen.queryByText("gate 0 asks")).toBeNull();
		expect(screen.queryByText(/on a clear/)).toBeNull();
		expect(within(objectives()).getByText("5 – 99%")).toBeInTheDocument();
	});

	it("lets the refused start speak for itself, without a scolding line", () => {
		render(<NewRunScreen {...props} />);

		expect(screen.queryByText(/bare build/i)).toBeNull();
	});

	it("arms the start as soon as the build holds anything", () => {
		render(<NewRunScreen {...kantoNewRunAt(["js"])} />);

		expect(
			screen.getByRole("button", { name: "start gate 0" })
		).not.toBeDisabled();
	});
});
