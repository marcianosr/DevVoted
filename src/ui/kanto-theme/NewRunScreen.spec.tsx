import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";

import {
	NEW_RUN_EMPTY_LABEL,
	createKantoNewRunScreenProps,
	kantoNewRunAt,
	newRunBuildNote,
} from "~/test/kantoPoll.factory";

import { NewRunScreen } from "./NewRunScreen.ui";

const props = createKantoNewRunScreenProps();

describe("NewRunScreen", () => {
	it("stands the build beside the hand it is dealt from", () => {
		render(<NewRunScreen {...props} />);

		expect(screen.getByText("Build")).toBeInTheDocument();
		expect(screen.getByText("Dealt")).toBeInTheDocument();
	});

	it("deals the hand down one column and the build down the other", () => {
		const { container } = render(<NewRunScreen {...props} />);

		const [dealing, holding] = [
			...(container.querySelector("div.grid")?.children ?? []),
		] as HTMLElement[];

		expect(within(dealing).getByText("Dealt")).toBeInTheDocument();
		expect(within(dealing).queryByText("Build")).toBeNull();
		expect(within(holding).getByText("Build")).toBeInTheDocument();
		expect(within(holding).getByText(NEW_RUN_EMPTY_LABEL)).toBeInTheDocument();
	});

	it("deals the hand before the weight it would cost to hold it", () => {
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
			screen.getByText("0 weight · 0 covered · 0 billable")
		).toBeInTheDocument();
	});

	it("counts the room it has left without re-counting the chips beside it", () => {
		render(<NewRunScreen {...kantoNewRunAt(["js"])} />);

		expect(screen.queryByText(/^1 configs/)).toBeNull();
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

	it("leaves the swatch track to state the shape of the climb", () => {
		render(<NewRunScreen {...props} />);

		expect(screen.queryByText(/gates, one a day/)).toBeNull();
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
			screen.getByText("1 weight · 1 covered · 0 billable")
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

describe("what it leaves to prep", () => {
	it("prices no band at all, the stakes being prep's screen", () => {
		render(<NewRunScreen {...props} />);

		expect(
			screen.queryByRole("heading", { name: "Objectives and rewards" })
		).toBeNull();
		for (const band of ["PERFECT", "HEALTHY", "SHAKY", "DANGER"]) {
			expect(screen.queryByText(band)).toBeNull();
		}
	});

	it("sends you on to prep by the press alone, with no line about it", () => {
		render(<NewRunScreen {...props} />);

		expect(screen.queryByText(/^Prep shows what/)).toBeNull();
	});

	it("refuses the start while nothing is picked", () => {
		render(<NewRunScreen {...props} />);

		expect(
			screen.getByRole("button", { name: /Pallet gate prep/ })
		).toBeDisabled();
	});

	it("lets the refused start speak for itself, without a scolding line", () => {
		render(<NewRunScreen {...props} />);

		expect(screen.queryByText(/bare build/i)).toBeNull();
	});
});
