import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { trackFor } from "~/test/swatchTrack.factory";

import {
	COPY,
	ProfileRecord,
	type ProfileRecordProps,
} from "./ProfileRecord.ui";

const props = (
	overrides: Partial<ProfileRecordProps> = {}
): ProfileRecordProps => ({
	figures: [
		{ label: "deepest gate", figure: "9 of 13", yours: "you 6 of 13" },
		{ label: "swatches", figure: "5 of 13", yours: "you 3 of 13" },
		{ label: "runs finished", figure: "24" },
	],
	swatches: trackFor([0, 1, 2, 3, 5]),
	seats: [{ category: "CSS", figure: "21 in a row" }],
	meta: "reached gate 9",
	note: "Where they have been.",
	...overrides,
});

describe("ProfileRecord", () => {
	it("names the panel and states how deep the player reached", () => {
		render(<ProfileRecord {...props()} />);

		expect(screen.getByRole("heading", { name: COPY.label })).toBeVisible();
		expect(screen.getByText("reached gate 9")).toBeVisible();
	});

	it("states every figure it was handed", () => {
		render(<ProfileRecord {...props()} />);

		expect(screen.getByText("deepest gate")).toBeVisible();
		expect(screen.getByText("9 of 13")).toBeVisible();
		expect(screen.getByText("24")).toBeVisible();
	});

	it("puts the viewer's own figure beside the one it compares to", () => {
		render(<ProfileRecord {...props()} />);

		expect(screen.getByText("you 6 of 13")).toBeVisible();
		expect(screen.getByText("you 3 of 13")).toBeVisible();
	});

	it("draws no comparison for a figure that carries none", () => {
		render(<ProfileRecord {...props()} />);

		expect(screen.queryByText(/^you 24/)).not.toBeInTheDocument();
	});

	it("draws the whole gate ladder, filled only where a swatch was won", () => {
		render(<ProfileRecord {...props()} />);

		expect(
			screen.getByLabelText("5 of 13 swatches discovered")
		).toBeInTheDocument();
	});

	it("names each seat held and the streak holding it", () => {
		render(<ProfileRecord {...props()} />);

		expect(screen.getByText("CSS")).toBeVisible();
		expect(screen.getByText("21 in a row")).toBeVisible();
	});

	it("says a player holds no seat rather than drawing an empty row", () => {
		render(<ProfileRecord {...props({ seats: [] })} />);

		expect(screen.getByText(COPY.noSeats)).toBeVisible();
	});
});
