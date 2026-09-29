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

	it("pins the coverage held above the bar, for good", () => {
		const { container } = render(<Standing {...kantoStanding()} />);

		const pin = container.querySelector(".coverage-bar-pin");
		expect(pin).toHaveAttribute("data-shown", "true");
		expect(pin).toHaveTextContent("70%");
	});

	it("leaves the gate unnamed when the surface names it elsewhere", () => {
		render(<Standing {...kantoStanding()} namesGate={false} />);

		expect(screen.queryByText("gate 3")).not.toBeInTheDocument();
	});

	it("draws the coverage on the kit's bar", () => {
		render(<Standing {...kantoStanding()} />);

		expect(screen.getByRole("img", { name: /70%/ })).toBeInTheDocument();
	});

	it("heads the build and states the weight carried against the space rented", () => {
		render(<Standing {...kantoStanding()} />);

		expect(screen.getByText(COPY.build)).toBeVisible();
		expect(screen.getByText("9 of 12 weight")).toBeVisible();
	});

	it("draws a chip for every installed config", () => {
		render(<Standing {...kantoStanding()} />);

		expect(screen.getByText("Webpack")).toBeVisible();
		expect(screen.getByText("Sentry")).toBeVisible();
	});

	it("draws the weight left free as an empty slot", () => {
		render(<Standing {...kantoStanding({ freeSlots: 3 })} />);

		expect(screen.getByText("empty")).toBeVisible();
		expect(screen.getByText("3 weight free")).toBeInTheDocument();
	});

	it("draws no empty slot for a full build", () => {
		render(<Standing {...kantoStanding({ freeSlots: 0 })} />);

		expect(screen.queryByText("empty")).toBeNull();
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
});
