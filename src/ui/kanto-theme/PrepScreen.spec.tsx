import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";

import {
	BAND_OUTCOMES_NOTE,
	BAND_OUTCOMES_TITLE,
	PREP_COMMUNITY_LABEL,
	PREP_LOCK_NOTE,
	PREP_POLLS_TITLE,
	KANTO_PREP_GATE,
	KANTO_PREP_SUMMIT_GATE,
	kantoPrepCalibration,
	kantoPrepChampion,
	kantoPrepFatal,
	kantoPrepLadder,
	kantoPrepPrefetched,
	kantoPrepSealed,
	kantoPrepSpent,
} from "~/test/kantoPoll.factory";

import { PrepScreen } from "./PrepScreen.ui";

const props = kantoPrepSealed();
const ladder = kantoPrepLadder(KANTO_PREP_GATE);

const sectionOf = (name: string) =>
	screen.getByRole("heading", { name }).closest("section") as HTMLElement;

const BAND_BADGE = ".badge-theme";

const bandBadgeFor = (band: string) =>
	within(sectionOf(BAND_OUTCOMES_TITLE)).getByText(band, {
		selector: BAND_BADGE,
	});

const outcomeRowFor = (band: string) =>
	bandBadgeFor(band).closest("div") as HTMLElement;

describe("PrepScreen", () => {
	it("opens on the stakes rather than on the build", () => {
		render(<PrepScreen {...props} />);

		expect(
			screen.getByRole("heading", { name: BAND_OUTCOMES_TITLE })
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

	it("reads as two columns, the outcomes beside the window they price", () => {
		const { container } = render(<PrepScreen {...props} />);

		const columns = container.querySelector(".md\\:grid-cols-2") as HTMLElement;
		const [left, right] = [...columns.children];

		expect(left).toContainElement(sectionOf(BAND_OUTCOMES_TITLE));
		expect(right).toContainElement(sectionOf(PREP_POLLS_TITLE));
		expect(right).toContainElement(sectionOf("Audits"));
	});

	it("no longer prices a single answer, the table pricing the landing", () => {
		render(<PrepScreen {...props} />);

		expect(screen.queryByText("What it takes")).not.toBeInTheDocument();
		expect(screen.queryByText("Each right answer")).not.toBeInTheDocument();
	});

	describe("the coverage bar over the outcomes", () => {
		it("starts empty on the gate's own line", () => {
			render(<PrepScreen {...props} />);

			expect(
				screen.getByRole("img", {
					name: new RegExp(`0% of ${ladder.healthy}% needed`),
				})
			).toBeInTheDocument();
		});

		it("stands inside the outcomes panel rather than across the header", () => {
			const { container } = render(<PrepScreen {...props} />);

			const bar = container.querySelector(".coverage-bar") as HTMLElement;

			expect(sectionOf(BAND_OUTCOMES_TITLE)).toContainElement(bar);
			expect(container.querySelector("header")).not.toContainElement(bar);
		});

		it("numbers the rungs rather than naming the bands", () => {
			const { container } = render(<PrepScreen {...props} />);

			const marks = container.querySelector(".coverage-bar")?.textContent;

			for (const rung of [0, ladder.floor, ladder.ok, ladder.healthy, 100]) {
				expect(marks).toContain(`${rung}`);
			}
			expect(marks).not.toContain("SHAKY");
			expect(marks).not.toContain("survive");
		});
	});

	describe("where you finish", () => {
		it("lays out all five bands, best outcome first and worst last", () => {
			render(<PrepScreen {...props} />);

			const badges = ["PERFECT", "HEALTHY", "OK", "SHAKY", "DANGER"].map(
				bandBadgeFor
			);

			for (const badge of badges) {
				expect(badge).toBeInTheDocument();
			}

			for (const [index, badge] of badges.slice(1).entries()) {
				expect(
					badges[index].compareDocumentPosition(badge) &
						Node.DOCUMENT_POSITION_FOLLOWING
				).toBeTruthy();
			}
		});

		it("cuts the ranges on the gate's own ladder", () => {
			render(<PrepScreen {...props} />);

			expect(
				within(outcomeRowFor("PERFECT")).getByText("100%")
			).toBeInTheDocument();
			expect(screen.getByText(`${ladder.healthy} – 99%`)).toBeInTheDocument();
			expect(
				screen.getByText(`${ladder.ok} – ${ladder.healthy - 1}%`)
			).toBeInTheDocument();
			expect(
				screen.getByText(`${ladder.floor} – ${ladder.ok - 1}%`)
			).toBeInTheDocument();
			expect(screen.getByText(`under ${ladder.floor}%`)).toBeInTheDocument();
		});

		it("leaves the table three columns, the prose having come out of it", () => {
			render(<PrepScreen {...props} />);

			const table = sectionOf(BAND_OUTCOMES_TITLE);

			for (const heading of ["band", "coverage", "pays"]) {
				expect(within(table).getByText(heading)).toBeInTheDocument();
			}
			expect(within(table).queryByText("outcome")).not.toBeInTheDocument();
		});

		it("says in one line which bands win the swatch and which cost", () => {
			render(<PrepScreen {...props} />);

			expect(
				screen.getByText(/Finish at OK or better and Lavender is yours/)
			).toBeInTheDocument();
			expect(
				screen.getByText(/The two bands under it cost instead of paying/)
			).toBeInTheDocument();
		});

		it("footnotes where a pay lands and what a peel is settled in", () => {
			render(<PrepScreen {...props} />);

			expect(screen.getByText(BAND_OUTCOMES_NOTE)).toBeInTheDocument();
		});

		it("bills the holding band a peel instead of paying it", () => {
			render(<PrepScreen {...props} />);

			expect(
				within(outcomeRowFor("SHAKY")).getByText(/peel$/)
			).toHaveTextContent(/^−\d/);
		});

		it("ends the run under the floor rather than quoting a figure", () => {
			render(<PrepScreen {...props} />);

			expect(
				within(outcomeRowFor("DANGER")).getByText("the run ends")
			).toBeInTheDocument();
		});

		it("never pays a lower landing more than a higher one", () => {
			render(<PrepScreen {...props} />);

			const kbOf = (band: string) =>
				Number(
					within(outcomeRowFor(band))
						.getByText(/KB/)
						.textContent?.match(/(\d+)/)?.[1]
				);

			expect(kbOf("PERFECT")).toBeGreaterThanOrEqual(kbOf("HEALTHY"));
			expect(kbOf("HEALTHY")).toBeGreaterThanOrEqual(kbOf("OK"));
			expect(kbOf("PERFECT")).toBeGreaterThan(kbOf("OK"));
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

		it("lists the window without a line explaining what it is worth", () => {
			render(<PrepScreen {...props} />);

			expect(screen.queryByText(/a matching config pays/)).toBeNull();
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
			screen.getByRole("img", {
				name: new RegExp(
					`62% of ${kantoPrepLadder(KANTO_PREP_SUMMIT_GATE).healthy}% needed · DANGER`
				),
			})
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
