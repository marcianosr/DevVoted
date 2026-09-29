import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";

import {
	BAND_OUTCOMES_NOTE,
	BAND_OUTCOMES_TITLE,
	PREP_COMMUNITY_LABEL,
	PREP_POLLS_TITLE,
	KANTO_PREP_GATE,
	KANTO_PREP_SUMMIT_GATE,
	kantoPrepCalibration,
	kantoPrepCascadeThin,
	kantoPrepChampion,
	kantoPrepFatal,
	kantoPrepLadder,
	kantoPrepPrefetched,
	kantoPrepSealed,
	kantoPrepSpent,
} from "~/test/kantoPoll.factory";

import { GATE_STRICTNESS_TITLE } from "./GateStrictness.ui";
import { POLL_PAYS_TITLE } from "./PollPays.ui";
import { PrepScreen } from "./PrepScreen.ui";

const props = kantoPrepSealed();
const ladder = kantoPrepLadder(KANTO_PREP_GATE);

const sectionOf = (name: string) =>
	screen.getByRole("heading", { name }).closest("section") as HTMLElement;

const BAND_BADGE = ".badge-theme";

const outcomeTable = () =>
	within(sectionOf(BAND_OUTCOMES_TITLE)).getByText("band").closest("div")
		?.nextElementSibling as HTMLElement;

const bandBadgeFor = (band: string) =>
	within(outcomeTable()).getByText(band, { selector: BAND_BADGE });

const outcomeRowFor = (band: string) =>
	bandBadgeFor(band).closest("div") as HTMLElement;

const CLEAR_LEAD = "Finish at";
const SWATCH_LEAD = "Answer all 5 right";
const SWATCH_REWARD = "Lavender swatch";

const objectiveBlockFor = (statement: string): HTMLElement => {
	const block = screen.getByText(statement).closest("div");
	if (block === null) throw new Error(`no objective block for "${statement}"`);
	return block;
};

const requiredBlock = () => objectiveBlockFor(CLEAR_LEAD);

describe("PrepScreen", () => {
	it("floats the band it stands in above the bar, and never takes it away", () => {
		const { container } = render(<PrepScreen {...props} />);

		const pin = container.querySelector(".coverage-bar-pin");

		expect(pin).toHaveAttribute("data-shown", "true");
		expect(pin).toHaveTextContent(/%/);
		expect(pin).toHaveTextContent(/DANGER|SHAKY|OK|HEALTHY|PERFECT/);
	});

	it("pins its header, so the balance stays with what it buys back", () => {
		const { container } = render(<PrepScreen {...props} />);

		expect(container.querySelector("header")).toHaveClass("md:sticky");
	});

	it("opens on the stakes rather than on the build", () => {
		render(<PrepScreen {...props} />);

		expect(
			screen.getByRole("heading", { name: BAND_OUTCOMES_TITLE })
		).toBeInTheDocument();
		expect(screen.queryByText("Build")).not.toBeInTheDocument();
	});

	it("reads as the gate about to be run, with what it carries", () => {
		render(<PrepScreen {...props} />);

		expect(screen.getByText("#4 - Lavender Gate")).toBeInTheDocument();
		expect(screen.getByText("1 audit")).toBeInTheDocument();
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

	it("prices a single, a focus and a multiple answer in units and as a share of the codebase", () => {
		render(<PrepScreen {...kantoPrepCascadeThin()} />);

		const pays = sectionOf(POLL_PAYS_TITLE);

		expect(within(pays).getAllByText("single answer")).toHaveLength(2);
		expect(within(pays).getByText(".ts ×1.25")).toBeInTheDocument();
		expect(within(pays).getByText("multiple answers")).toBeInTheDocument();
		expect(within(pays).getByText("1.25 units")).toHaveClass("badge-theme");
		expect(within(pays).getByText("+6.67%")).toHaveClass("badge-theme");
		expect(within(pays).getByText("+13.33%")).toBeInTheDocument();
	});

	describe("the coverage bar in What a poll pays", () => {
		it("starts empty on the gate's own line", () => {
			render(<PrepScreen {...props} />);

			expect(
				screen.getByRole("img", {
					name: new RegExp(`0% of ${ladder.healthy}% needed`),
				})
			).toBeInTheDocument();
		});

		it("stands inside What a poll pays, in neither At stake nor the header", () => {
			const { container } = render(<PrepScreen {...props} />);

			const bar = container.querySelector(".coverage-bar") as HTMLElement;

			expect(sectionOf(POLL_PAYS_TITLE)).toContainElement(bar);
			expect(sectionOf(BAND_OUTCOMES_TITLE)).not.toContainElement(bar);
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

		describe("the objectives", () => {
			it("states two objectives and puts no section label over either", () => {
				render(<PrepScreen {...props} />);

				expect(
					within(requiredBlock()).getByText(CLEAR_LEAD)
				).toBeInTheDocument();
				expect(screen.getByText(SWATCH_LEAD)).toBeInTheDocument();
				expect(screen.queryByText("Main objective")).not.toBeInTheDocument();
				expect(screen.queryByText("Extra objectives")).not.toBeInTheDocument();
			});

			it("names what clearing pays rather than restating the objective", () => {
				render(<PrepScreen {...props} />);

				const block = within(requiredBlock());

				expect(block.getByText("OK")).toBeInTheDocument();
				expect(block.getByText("advance to Rainbow")).toBeInTheDocument();
				expect(block.queryByText("to clear the gate")).not.toBeInTheDocument();
				expect(block.queryByText(/of the 5 right/)).not.toBeInTheDocument();
			});

			it("earns the swatch on a flawless window, not on a coverage band", () => {
				const block = (() => {
					render(<PrepScreen {...props} />);
					return within(objectiveBlockFor(SWATCH_LEAD));
				})();

				expect(block.getByText(SWATCH_REWARD)).toBeInTheDocument();
				expect(block.queryByText("PERFECT")).not.toBeInTheDocument();
				expect(block.queryByText("5 of 5")).not.toBeInTheDocument();
			});

			it("marks neither objective as met or out of reach", () => {
				render(<PrepScreen {...props} />);

				expect(within(requiredBlock()).queryByRole("img")).toBeNull();
				expect(
					within(objectiveBlockFor(SWATCH_LEAD)).queryByRole("img")
				).toBeNull();
			});

			it("badges OK at the calibration gate and draws it no DANGER row", () => {
				render(<PrepScreen {...kantoPrepCalibration()} />);

				expect(within(requiredBlock()).getByText("OK")).toBeInTheDocument();
				expect(
					within(outcomeTable()).queryByText("DANGER", { selector: BAND_BADGE })
				).not.toBeInTheDocument();
			});

			it("promises no next gate at the summit, where there is not one", () => {
				render(<PrepScreen {...kantoPrepChampion()} />);

				expect(
					within(requiredBlock()).queryByText(/advance to/)
				).not.toBeInTheDocument();
			});

			it("states no audit, whichever gate is being prepped", () => {
				render(<PrepScreen {...props} />);

				const panel = sectionOf(BAND_OUTCOMES_TITLE);

				expect(within(panel).queryByText(/audit/)).not.toBeInTheDocument();
			});
		});

		it("edges the band row the pin is standing on, so the two cannot disagree", () => {
			const { container } = render(<PrepScreen {...props} />);

			const pinned = container
				.querySelector(".coverage-bar-pin")
				?.getAttribute("data-screen-theme");

			const edged = [...outcomeTable().children]
				.filter((row) => row.classList.contains("border-l-2"))
				.map((row) => row.getAttribute("data-screen-theme"));

			expect(pinned).not.toBeNull();
			expect(edged).toContain(pinned);
		});

		it("opens on the line it requires, not on a list of three chores", () => {
			render(<PrepScreen {...props} />);

			const panel = sectionOf(BAND_OUTCOMES_TITLE);

			expect(within(panel).getByText(CLEAR_LEAD)).toBeInTheDocument();
			expect(
				within(panel).queryByText(/are won separately/)
			).not.toBeInTheDocument();
			expect(
				within(panel).queryByText(/Main objective/)
			).not.toBeInTheDocument();
		});

		it("breaks the standing down gate by gate, inside the panel that asks for it", () => {
			render(<PrepScreen {...props} />);

			const outcomes = sectionOf(BAND_OUTCOMES_TITLE);
			const scores = screen.getByLabelText(/^Lavender —/);

			expect(screen.getAllByLabelText(/— \d of 5 correct$/)).toHaveLength(
				KANTO_PREP_GATE + 1
			);
			expect(outcomes).toContainElement(scores);
		});

		it("stands the window's answers between the objectives and the band table", () => {
			render(<PrepScreen {...props} />);

			const scores = screen.getByLabelText(/^Lavender —/);
			const swatchObjective = screen.getByText(SWATCH_LEAD);
			const bandRow = bandBadgeFor("PERFECT");

			expect(
				swatchObjective.compareDocumentPosition(scores) &
					Node.DOCUMENT_POSITION_FOLLOWING
			).toBeTruthy();
			expect(
				scores.compareDocumentPosition(bandRow) &
					Node.DOCUMENT_POSITION_FOLLOWING
			).toBeTruthy();
		});

		it("marks the gate being prepped by its swatch, not by a word", () => {
			render(<PrepScreen {...props} />);

			expect(screen.queryByText("this gate")).toBeNull();
			expect(screen.getByLabelText(/^Lavender —/)).toBeInTheDocument();
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

	describe("what a poll pays", () => {
		it("counts the open slots on the panel", () => {
			render(<PrepScreen {...props} />);

			expect(
				within(sectionOf(POLL_PAYS_TITLE)).getByText("25 slots open")
			).toHaveClass("badge-theme");
		});

		it("draws one square per slot the run has opened", () => {
			render(<PrepScreen {...props} />);

			expect(
				screen.getByRole("img", { name: "0 of 25 slots covered" })
			).toBeInTheDocument();
		});

		it("states the standing in units across slots, with yesterday's percent, from the second gate on", () => {
			render(<PrepScreen {...kantoPrepCascadeThin()} />);

			expect(
				screen.getByText(/Nothing was lost\./).closest("p")
			).toHaveTextContent(
				"The codebase grew from 10 to 15 slots. The same 8 units read 80.0% at Boulder and 53.3% here. Nothing was lost."
			);
		});

		it("reads the plain standing at the calibration gate, where nothing has moved yet", () => {
			render(<PrepScreen {...kantoPrepCalibration()} />);

			expect(screen.getByText(/which is/).closest("p")).toHaveTextContent(
				"You have scored 0 units across 5 slots, which is 0.0% coverage."
			);
			expect(screen.queryByText(/Nothing was lost/)).toBeNull();
		});

		it("folds the strictness table shut under the column, summarising today's gate", () => {
			render(<PrepScreen {...props} />);

			const fold = screen
				.getByRole("heading", { name: GATE_STRICTNESS_TITLE })
				.closest("details") as HTMLDetailsElement;

			expect(fold).not.toHaveAttribute("open");
			expect(fold).toHaveTextContent("Lavender · 25 slots · one unit is +4%");
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

	describe("the incidents locked onto it", () => {
		it("names the incident a rival locked onto this gate, and counts it", () => {
			render(<PrepScreen {...props} />);

			expect(screen.getByText("404")).toBeInTheDocument();
			expect(screen.getByText("Not Found")).toBeInTheDocument();
			expect(screen.getByText("1 firing this gate")).toBeInTheDocument();
		});

		it("bills the clear on the audits heading", () => {
			render(<PrepScreen {...props} />);

			expect(screen.getByText("bills")).toBeInTheDocument();
			expect(screen.getAllByText("−32 KB")).not.toHaveLength(0);
			expect(screen.getByText("on a clear")).toBeInTheDocument();
		});

		it("breaks that total into the lines that make it up", () => {
			render(<PrepScreen {...props} />);

			const panel = within(sectionOf("Subscriptions"));

			expect(panel.getByText("Every gate")).toBeInTheDocument();
			expect(panel.getAllByText("−32 KB")).not.toHaveLength(0);
		});

		it("leaves the shortfall warning to the heading that already states it", () => {
			render(<PrepScreen {...props} />);

			expect(
				within(sectionOf("Subscriptions")).queryByText(/lapses/)
			).not.toBeInTheDocument();
		});

		it("bills nothing at a gate with no plan and no subscription", () => {
			render(<PrepScreen {...kantoPrepCalibration()} />);

			expect(screen.queryByText("bills")).not.toBeInTheDocument();
		});

		it("states the lock once, on the Audits panel alone", () => {
			render(<PrepScreen {...kantoPrepCalibration()} />);

			expect(
				screen.getByText("Audits are unlocked at gate 3")
			).toBeInTheDocument();
			expect(screen.getAllByText("gate 3")).toHaveLength(1);
			expect(screen.queryByText("Your audit")).not.toBeInTheDocument();
		});
	});

	describe("the footer", () => {
		it("prices no peel beside the start", () => {
			render(<PrepScreen {...props} />);

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
				screen.getByRole("button", { name: /^Start Lavender/ })
			).toBeDisabled();
			expect(
				screen.getByText("Tomorrow's polls open in 7h 14m.")
			).toBeInTheDocument();
		});
	});

	describe("at the summit", () => {
		const champion = kantoPrepChampion();

		it("names every incident rivals locked onto the summit", () => {
			render(<PrepScreen {...champion} />);

			for (const code of ["408", "410", "413"]) {
				expect(screen.getByText(code)).toBeInTheDocument();
			}
		});

		it("reads the balance at whatever unit it has rolled to", () => {
			render(<PrepScreen {...champion} />);

			expect(screen.getByRole("img", { name: "1.9 MB" })).toBeInTheDocument();
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
		it("marks the start with the gate it starts, and the way out with an icon", () => {
			const { container } = render(<PrepScreen {...props} />);

			expect(
				screen
					.getByRole("button", { name: /^Start Lavender/ })
					.querySelector("[data-swatch-theme='lavender']")
			).not.toBeNull();
			expect(
				screen
					.getByRole("button", { name: PREP_COMMUNITY_LABEL })
					.querySelector("svg")
			).not.toBeNull();
			expect(container).toBeInTheDocument();
		});

		it("starts the gate in the gate's own colour, not a stock green", () => {
			render(<PrepScreen {...props} />);

			const start = screen.getByRole("button", { name: /^Start Lavender/ });

			expect(start).not.toHaveAttribute("data-screen-theme");
			expect(start).toHaveClass("segment-theme");
		});
	});
});
