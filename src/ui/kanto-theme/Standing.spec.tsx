import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { kantoStanding } from "~/test/kantoCommunity.factory";

import { COPY, Standing } from "./Standing.ui";

describe("Standing", () => {
	it("names the gate the run stands at, apart from its number", () => {
		render(<Standing {...kantoStanding()} />);

		expect(screen.getByText("Thunder")).toBeVisible();
		expect(screen.getByText("gate 3")).toBeVisible();
	});

	it("reads the coverage held and its band beside the gate", () => {
		render(<Standing {...kantoStanding()} />);

		expect(screen.getByText("70% · HEALTHY")).toBeVisible();
	});

	it("points at the coverage on the bar rather than labelling its boundaries", () => {
		const { container } = render(<Standing {...kantoStanding()} />);

		expect(container.querySelector(".coverage-bar-pin")).toHaveTextContent("");
		expect(screen.queryByText("SHAKY")).not.toBeInTheDocument();
	});

	it("draws the coverage on the kit's bar", () => {
		render(<Standing {...kantoStanding()} />);

		expect(screen.getByRole("img", { name: /70%/ })).toBeInTheDocument();
	});

	it("heads the build and states the weight carried against the space rented", () => {
		render(<Standing {...kantoStanding()} />);

		expect(screen.getByText(COPY.build)).toBeVisible();
		expect(screen.getByText("9 / 12")).toBeVisible();
		expect(screen.getByText(COPY.weight)).toBeVisible();
	});

	it("draws a chip for every installed config", () => {
		render(<Standing {...kantoStanding()} />);

		expect(screen.getByText("Webpack")).toBeVisible();
		expect(screen.getByText("Sentry")).toBeVisible();
	});

	it("draws the weight left free as a free slot", () => {
		render(<Standing {...kantoStanding({ freeSlots: 3 })} />);

		expect(screen.getByText(COPY.free)).toBeVisible();
		expect(screen.getByText("3 weight free")).toBeInTheDocument();
	});

	it("draws no free slot for a full build", () => {
		render(<Standing {...kantoStanding({ freeSlots: 0 })} />);

		expect(screen.queryByText(COPY.free)).toBeNull();
	});

	it("says a build is empty rather than drawing nothing", () => {
		render(<Standing {...kantoStanding({ build: [] })} />);

		expect(screen.getByText(COPY.nothingInstalled)).toBeVisible();
	});

	it("draws a tile for every figure it was handed", () => {
		render(<Standing {...kantoStanding()} />);

		expect(screen.getByText(COPY.storage)).toBeVisible();
		expect(screen.getByText("896 KB")).toBeVisible();
		expect(screen.getByText("JavaScript")).toBeVisible();
	});

	it("badges each figure in the colour it was handed", () => {
		render(<Standing {...kantoStanding()} />);

		expect(screen.getByText("896 KB")).toHaveAttribute(
			"data-screen-theme",
			"saffron"
		);
	});
});
