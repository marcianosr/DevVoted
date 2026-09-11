import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import {
	NEW_RUN_BUILD_NOTE,
	NEW_RUN_EMPTY_LABEL,
	NEW_RUN_RESTING,
	baseSlots,
	createKantoNewRunScreenProps,
	kantoNewRunAt,
} from "~/test/kantoPoll.factory";

import { NewRunScreen } from "./NewRunScreen.ui";

const props = createKantoNewRunScreenProps();

describe("NewRunScreen", () => {
	it("stands the build beside the hand it is dealt from", () => {
		render(<NewRunScreen {...props} />);

		expect(screen.getByText("Build")).toBeInTheDocument();
		expect(screen.getByText("Dealt")).toBeInTheDocument();
	});

	it("opens on the free four slots with nothing installed", () => {
		render(<NewRunScreen {...props} />);

		expect(
			screen.getByText(`0 configs · 0 of ${baseSlots} slots · 4 free`)
		).toBeInTheDocument();
	});

	it("names the floor where the track would name a config's room", () => {
		render(<NewRunScreen {...props} />);

		expect(screen.getByText(NEW_RUN_RESTING)).toBeInTheDocument();
	});

	it("speaks for the empty list without spending a slot on it", () => {
		render(<NewRunScreen {...props} />);

		expect(screen.getByText(NEW_RUN_EMPTY_LABEL)).toBeInTheDocument();
		expect(screen.getAllByText("empty slot")).toHaveLength(baseSlots);
	});

	it("offers the fifth slot from the archive, priced in the archive's name", () => {
		render(<NewRunScreen {...props} />);

		expect(
			screen.getByRole("button", { name: "open slot 5 · 64 KB archive" })
		).toBeInTheDocument();
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

	it("states what the build's own room costs, under the build", () => {
		render(<NewRunScreen {...props} />);

		expect(screen.getByText(NEW_RUN_BUILD_NOTE)).toBeInTheDocument();
	});

	it("closes on the stake, with the start refused while nothing is picked", () => {
		render(<NewRunScreen {...props} />);

		expect(screen.getByText("gate 0 asks")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "start gate 0" })).toBeDisabled();
	});

	it("opens the run on one pick, in the build and in the hand alike", () => {
		render(<NewRunScreen {...kantoNewRunAt(["js"])} />);

		expect(
			screen.getByText(`1 configs · 1 of ${baseSlots} slots · 3 free`)
		).toBeInTheDocument();
		expect(screen.getByText("4 left in the hand")).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "start gate 0" })
		).not.toBeDisabled();
		expect(screen.queryByText(NEW_RUN_EMPTY_LABEL)).not.toBeInTheDocument();
	});

	it("hands a bought slot back at cost, and offers the next one up", () => {
		render(<NewRunScreen {...kantoNewRunAt(["js"], 1)} />);

		expect(
			screen.getByRole("button", {
				name: "cash this slot back · +64 KB archive",
			})
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "open slot 6 · 80 KB archive" })
		).toBeInTheDocument();
	});

	it("refuses a slot the archive cannot pay for, with the shortfall", () => {
		render(<NewRunScreen {...kantoNewRunAt([], 0, 32)} />);

		const stub = screen.getByRole("button", {
			name: "open slot 5 · 64 KB archive · 32 KB short",
		});

		expect(stub).toBeDisabled();
		expect(screen.getByText("32 KB short")).toBeInTheDocument();
	});
});
