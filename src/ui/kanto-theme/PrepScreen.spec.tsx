import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";

import {
	PREP_COMMUNITY_LABEL,
	PREP_SHOP_LABEL,
	kantoPrepCalibration,
	kantoPrepChampion,
	kantoPrepFatal,
	kantoPrepPrefetched,
	kantoPrepSealed,
	kantoPrepSpent,
} from "~/test/kantoPoll.factory";

import { PrepScreen } from "./PrepScreen.ui";

const props = kantoPrepSealed();

describe("PrepScreen", () => {
	it("stands the build beside what the gate will do to it", () => {
		render(<PrepScreen {...props} />);

		expect(screen.getByText("Build")).toBeInTheDocument();
		expect(
			screen.getByRole("heading", { name: "Lavender gate" })
		).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Audits" })).toBeInTheDocument();
	});

	it("reads as the gate about to be run, with what it carries", () => {
		render(<PrepScreen {...props} />);

		expect(screen.getByText("Gate 4 · Lavender")).toBeInTheDocument();
		expect(screen.getByText("1 audit")).toBeInTheDocument();
		expect(screen.getByText("today's 5 polls are ready")).toBeInTheDocument();
	});

	it("wears the gate it is about to run", () => {
		const { container } = render(<PrepScreen {...props} />);

		expect(container.firstElementChild).toHaveAttribute(
			"data-gate-theme",
			"lavender"
		);
	});

	it("names the coverage the gate asks and what is held against it", () => {
		render(<PrepScreen {...props} />);

		expect(screen.getByText("0.0")).toBeInTheDocument();
		expect(screen.getByText("60%")).toBeInTheDocument();
	});

	it("draws the build as occupancy, with no config to hover", () => {
		render(<PrepScreen {...props} />);

		expect(
			screen.getByText("4 configs · 7 of 8 slots · 1 free")
		).toBeInTheDocument();
		expect(
			screen.queryByText("hover a config to find its room on the track")
		).not.toBeInTheDocument();
	});

	it("sends a build the player wants changed back to the shop", () => {
		render(<PrepScreen {...props} />);

		expect(
			screen.getByRole("button", { name: PREP_SHOP_LABEL })
		).toBeInTheDocument();
	});

	it("withholds the window while nothing reveals it", () => {
		render(<PrepScreen {...props} />);

		expect(screen.getAllByText("???")).toHaveLength(2);
		expect(screen.getAllByText("?")).toHaveLength(5);
	});

	it("names no next gate at all while the window is sealed", () => {
		render(<PrepScreen {...props} />);

		expect(screen.queryByText("next gate")).not.toBeInTheDocument();
	});

	it("opens the whole window at once when Prefetch is in the build", () => {
		render(<PrepScreen {...kantoPrepPrefetched()} />);

		const polls = screen
			.getByRole("heading", { name: "Lavender gate" })
			.closest("section");
		expect(within(polls as HTMLElement).getByText("Prefetch")).toHaveClass(
			"badge-theme"
		);
		expect(screen.getByText("1 single")).toBeInTheDocument();
		expect(screen.getByText("4 multiple")).toBeInTheDocument();
		expect(screen.getByText("typescript 3")).toBeInTheDocument();
		expect(screen.getByText("javascript 2")).toBeInTheDocument();
		expect(screen.getByText("git 5")).toBeInTheDocument();
		expect(screen.queryByText("???")).not.toBeInTheDocument();
	});

	it("draws the audit its own gate deals, and counts it", () => {
		render(<PrepScreen {...props} />);

		expect(screen.getByText("429")).toBeInTheDocument();
		expect(screen.getByText("Too Many Requests")).toBeInTheDocument();
		expect(screen.getByText("1 this gate")).toBeInTheDocument();
	});

	it("bills the clear on the audits heading", () => {
		render(<PrepScreen {...props} />);

		expect(screen.getByText("bills")).toBeInTheDocument();
		expect(screen.getByText("−32 KB")).toBeInTheDocument();
		expect(screen.getByText("on a clear")).toBeInTheDocument();
	});

	it("prices the clear and the miss beside the press that starts the gate", () => {
		render(<PrepScreen {...props} />);

		expect(screen.getByText("+160 KB")).toBeInTheDocument();
		expect(screen.getByText("Lavender swatch")).toBeInTheDocument();
		expect(screen.getByText("peels 1 or 2 configs")).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "Start Lavender" })
		).toBeInTheDocument();
	});

	it("offers the community board without leaving the gate", () => {
		render(<PrepScreen {...props} />);

		expect(
			screen.getByRole("button", { name: PREP_COMMUNITY_LABEL })
		).toBeInTheDocument();
	});

	it("keeps the footer to one line while a peel has no news", () => {
		render(<PrepScreen {...props} />);

		expect(screen.queryByText(/occupied slots/)).not.toBeInTheDocument();
	});

	it("bills nothing at a gate with no plan and no subscription", () => {
		render(<PrepScreen {...kantoPrepCalibration()} />);

		expect(screen.queryByText("bills")).not.toBeInTheDocument();
	});

	it("draws no audit panel at a gate that deals none", () => {
		render(<PrepScreen {...kantoPrepCalibration()} />);

		expect(screen.getByText("none this gate")).toBeInTheDocument();
		expect(screen.queryByText("audits")).not.toBeInTheDocument();
	});

	it("says a miss costs nothing at the calibration gate", () => {
		render(<PrepScreen {...kantoPrepCalibration()} />);

		expect(screen.getByText("costs nothing")).toBeInTheDocument();
		expect(screen.queryByText(/occupied slots/)).not.toBeInTheDocument();
	});

	describe("at the summit", () => {
		const champion = kantoPrepChampion();

		it("draws all three audits gate 12 always deals", () => {
			render(<PrepScreen {...champion} />);

			for (const code of ["408", "410", "413"]) {
				expect(screen.getByText(code)).toBeInTheDocument();
			}
		});

		it("reads the balance at whatever unit it has rolled to", () => {
			render(<PrepScreen {...champion} />);

			expect(screen.getByText("1.9 MB")).toBeInTheDocument();
		});

		it("names no gate after the last one", () => {
			render(<PrepScreen {...champion} />);

			expect(
				screen.getByText("the summit — nothing after this")
			).toBeInTheDocument();
		});

		it("keeps the per-poll leak out of the bill and on its audit", () => {
			render(<PrepScreen {...champion} />);

			expect(screen.queryByText("413 leak")).not.toBeInTheDocument();
			expect(
				screen.getByText(
					"Payload over 12 slots: 8KB a poll for each one past it."
				)
			).toBeInTheDocument();
		});

		it("warns when a bill has outgrown the balance", () => {
			render(<PrepScreen {...champion} />);

			expect(
				screen.getByText(/short — what you cannot pay lapses\./)
			).toBeInTheDocument();
		});

		it("credits the audit that deepened the peel", () => {
			render(<PrepScreen {...champion} />);

			expect(screen.getByText(/deepened by 410 Gone/)).toBeInTheDocument();
			expect(
				screen.getByText(/12 of your 24 occupied slots/)
			).toBeInTheDocument();
		});
	});

	it("locks the start behind the countdown once today's polls are spent", () => {
		render(<PrepScreen {...kantoPrepSpent()} />);

		expect(
			screen.getByRole("button", { name: "Start Lavender" })
		).toBeDisabled();
		expect(
			screen.getByText("Tomorrow's polls open in 7h 14m.")
		).toBeInTheDocument();
		expect(screen.getByRole("button", { name: PREP_SHOP_LABEL })).toBeEnabled();
	});

	it("says a peel that empties the build ends the run", () => {
		render(<PrepScreen {...kantoPrepFatal()} />);

		expect(screen.getByText("ends the run")).toBeInTheDocument();
		expect(
			screen.getByText(/A peel this deep can end the run\./)
		).toBeInTheDocument();
	});

	describe("signing its presses", () => {
		it("gives every way out of the screen an icon rather than an arrow", () => {
			render(<PrepScreen {...props} />);

			for (const name of [
				"Start Lavender",
				"Community",
				"change it in the shop",
			]) {
				expect(
					screen.getByRole("button", { name }).querySelector("svg")
				).not.toBeNull();
			}
		});

		it("starts the gate in the gate's own colour, not a stock green", () => {
			render(<PrepScreen {...props} />);

			const start = screen.getByRole("button", { name: "Start Lavender" });

			expect(start).not.toHaveAttribute("data-screen-theme");
			expect(start).toHaveClass("press-theme");
		});
	});
});
