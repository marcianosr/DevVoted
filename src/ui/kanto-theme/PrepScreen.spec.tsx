import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";

import {
	PREP_COMMUNITY_LABEL,
	PREP_LOCK_NOTE,
	PREP_OUTCOMES_TITLE,
	PREP_POLLS_TITLE,
	PREP_TAKES_TITLE,
	kantoPrepCalibration,
	kantoPrepChampion,
	kantoPrepFatal,
	kantoPrepPrefetched,
	kantoPrepSealed,
	kantoPrepSpent,
} from "~/test/kantoPoll.factory";

import { PrepScreen } from "./PrepScreen.ui";

const props = kantoPrepSealed();

const sectionOf = (name: string) =>
	screen.getByRole("heading", { name }).closest("section") as HTMLElement;

const outcomeRowFor = (band: string) =>
	within(sectionOf(PREP_OUTCOMES_TITLE))
		.getByText(band)
		.closest("div[class*='border-t'], div[class*='py-3']") as HTMLElement;

describe("PrepScreen", () => {
	it("opens on the stakes rather than on the build", () => {
		render(<PrepScreen {...props} />);

		expect(
			screen.getByRole("heading", { name: PREP_OUTCOMES_TITLE })
		).toBeInTheDocument();
		expect(screen.queryByText("Build")).not.toBeInTheDocument();
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

	describe("the coverage bar across the top", () => {
		it("starts empty and says why", () => {
			render(<PrepScreen {...props} />);

			expect(
				screen.getByRole("img", { name: /0% of 40% needed/ })
			).toBeInTheDocument();
			expect(screen.getByText(/Coverage starts at zero/)).toBeInTheDocument();
		});

		it("names the bands rather than the boundaries between them", () => {
			const { container } = render(<PrepScreen {...props} />);

			const marks = container.querySelector(".coverage-bar")?.textContent;

			expect(marks).toContain("SHAKY");
			expect(marks).not.toContain("survive");
		});
	});

	describe("where you finish", () => {
		it("lays out all five bands, best outcome first and worst last", () => {
			render(<PrepScreen {...props} />);

			const table = sectionOf(PREP_OUTCOMES_TITLE);
			const at = (band: string) => table.textContent?.indexOf(band) ?? -1;

			for (const band of ["PERFECT", "HEALTHY", "OK", "SHAKY", "DANGER"]) {
				expect(within(table).getByText(band)).toBeInTheDocument();
			}

			expect(at("PERFECT")).toBeLessThan(at("HEALTHY"));
			expect(at("HEALTHY")).toBeLessThan(at("DANGER"));
		});

		it("cuts the ranges on the gate's own ladder", () => {
			render(<PrepScreen {...props} />);

			expect(
				within(outcomeRowFor("PERFECT")).getByText("100%")
			).toBeInTheDocument();
			expect(screen.getByText("40 – 99%")).toBeInTheDocument();
			expect(screen.getByText("25 – 39%")).toBeInTheDocument();
			expect(screen.getByText("15 – 24%")).toBeInTheDocument();
			expect(screen.getByText("under 15%")).toBeInTheDocument();
		});

		it("says a clear takes the swatch and opens the next gate", () => {
			render(<PrepScreen {...props} />);

			expect(
				within(outcomeRowFor("HEALTHY")).getByText(
					/The Lavender swatch is yours and gate 5 opens/
				)
			).toBeInTheDocument();
		});

		it("says OK gets paid but leaves the gate shut", () => {
			render(<PrepScreen {...props} />);

			expect(
				screen.getByText(/You survive and get paid, but the gate stays shut/)
			).toBeInTheDocument();
		});

		it("pays every band that survives, and nothing at all below the floor", () => {
			render(<PrepScreen {...props} />);

			expect(
				within(outcomeRowFor("DANGER")).getByText("Nothing")
			).toBeInTheDocument();
			expect(within(outcomeRowFor("HEALTHY")).getByText(/KB/)).toBeVisible();
		});

		it("pays a clear more than a scrape", () => {
			render(<PrepScreen {...props} />);

			const kbOf = (band: string) =>
				Number(
					within(outcomeRowFor(band))
						.getByText(/KB/)
						.textContent?.match(/(\d+)/)?.[1]
				);

			expect(kbOf("HEALTHY")).toBeGreaterThan(kbOf("SHAKY"));
		});

		it("pays a full bar a bonus over the best a clear can do", () => {
			render(<PrepScreen {...props} />);

			const kbIn = (band: string) =>
				within(outcomeRowFor(band))
					.getByText(/KB/)
					.textContent?.match(/\d+/g)
					?.map(Number) ?? [];

			expect(Math.min(...kbIn("PERFECT"))).toBeGreaterThan(
				Math.max(...kbIn("HEALTHY"))
			);
		});

		it("names the run's end without a payout to soften it", () => {
			render(<PrepScreen {...props} />);

			expect(
				screen.getByText(/The run ends the moment the gate shuts/)
			).toBeInTheDocument();
		});
	});

	describe("what it takes", () => {
		it("spans the gain, since the answer types are still sealed", () => {
			render(<PrepScreen {...props} />);

			const takes = sectionOf(PREP_TAKES_TITLE);

			expect(within(takes).getByText("Each right answer")).toBeInTheDocument();
			expect(within(takes).getByText(/^\+\d/)).toBeInTheDocument();
			expect(within(takes).getByText(/^−\d/)).toBeInTheDocument();
		});

		it("shows the build multiplying a base it did not choose", () => {
			render(<PrepScreen {...props} />);

			expect(screen.getByText("5–8 base × 3 build")).toBeInTheDocument();
		});

		it("no longer counts rights toward a line", () => {
			render(<PrepScreen {...props} />);

			expect(screen.queryByText(/Rights to survive/)).not.toBeInTheDocument();
		});
	});

	describe("the five polls", () => {
		it("withholds the window while nothing reveals it", () => {
			render(<PrepScreen {...props} />);

			expect(screen.getAllByText("???")).toHaveLength(2);
			expect(screen.getAllByText("?")).toHaveLength(5);
		});

		it("names no next gate at all while the window is sealed", () => {
			render(<PrepScreen {...props} />);

			expect(screen.queryByText("next gate")).not.toBeInTheDocument();
		});

		it("says why the categories matter more than usual", () => {
			render(<PrepScreen {...props} />);

			expect(
				screen.getByText(/a matching config pays ×1.25 on top of your build/)
			).toBeInTheDocument();
		});

		it("opens the whole window at once when Prefetch is in the build", () => {
			render(<PrepScreen {...kantoPrepPrefetched()} />);

			const polls = sectionOf(PREP_POLLS_TITLE);

			expect(within(polls).getByText("Prefetch")).toHaveClass("badge-theme");
			expect(screen.getByText("1 single")).toBeInTheDocument();
			expect(screen.getByText("4 multiple")).toBeInTheDocument();
			expect(screen.getByText("typescript 3")).toBeInTheDocument();
			expect(screen.getByText("git 5")).toBeInTheDocument();
			expect(screen.queryByText("???")).not.toBeInTheDocument();
		});
	});

	describe("the audits it deals", () => {
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

		it("bills nothing at a gate with no plan and no subscription", () => {
			render(<PrepScreen {...kantoPrepCalibration()} />);

			expect(screen.queryByText("bills")).not.toBeInTheDocument();
		});

		it("draws no audit panel at a gate that deals none", () => {
			render(<PrepScreen {...kantoPrepCalibration()} />);

			expect(screen.getByText("none this gate")).toBeInTheDocument();
			expect(screen.queryByText("audits")).not.toBeInTheDocument();
		});
	});

	describe("the footer", () => {
		it("says what starting costs, without pricing a peel", () => {
			render(<PrepScreen {...props} />);

			expect(screen.getByText(PREP_LOCK_NOTE)).toBeInTheDocument();
			expect(screen.queryByText(/peels/)).not.toBeInTheDocument();
		});

		it("offers the community board without leaving the gate", () => {
			render(<PrepScreen {...props} />);

			expect(
				screen.getByRole("button", { name: PREP_COMMUNITY_LABEL })
			).toBeInTheDocument();
		});

		it("locks the start behind the countdown once today's polls are spent", () => {
			render(<PrepScreen {...kantoPrepSpent()} />);

			expect(
				screen.getByRole("button", { name: "Start Lavender" })
			).toBeDisabled();
			expect(
				screen.getByText("Tomorrow's polls open in 7h 14m.")
			).toBeInTheDocument();
		});
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

		it("promises the run rather than a gate after the last one", () => {
			render(<PrepScreen {...champion} />);

			expect(
				within(outcomeRowFor("HEALTHY")).getByText(/the run is won/)
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
	});

	it("reads a build already under the floor as the run ending", () => {
		render(<PrepScreen {...kantoPrepFatal()} />);

		expect(
			screen.getByRole("img", { name: /62% of 95% needed · DANGER/ })
		).toBeInTheDocument();
	});

	describe("signing its presses", () => {
		it("gives every way out of the screen an icon rather than an arrow", () => {
			render(<PrepScreen {...props} />);

			for (const name of ["Start Lavender", PREP_COMMUNITY_LABEL]) {
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
