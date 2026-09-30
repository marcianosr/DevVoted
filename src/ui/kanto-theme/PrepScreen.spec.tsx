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

import { PrepScreen, type PrepScreenProps } from "./PrepScreen.ui";
import { SCORING_TITLE } from "./Scoring.ui";

const props = kantoPrepSealed();
const ladder = kantoPrepLadder(KANTO_PREP_GATE);

const sectionOf = (name: string) =>
	screen.getByRole("heading", { name }).closest("section") as HTMLElement;

const scoringFold = () =>
	screen
		.getByRole("heading", { name: SCORING_TITLE })
		.closest("details") as HTMLDetailsElement;

const ladderOf = () =>
	sectionOf(BAND_OUTCOMES_TITLE).querySelector(".band-ladder") as HTMLElement;

const ringedRowOf = () =>
	ladderOf().querySelector(".band-ladder-row.ring-2") as HTMLElement;

const rowThemesOf = () =>
	[...ladderOf().querySelectorAll(".band-ladder-row")].map((row) =>
		row.getAttribute("data-screen-theme")
	);

const rowOf = (word: string) =>
	within(ladderOf()).getByText(word).closest("li") as HTMLElement;

const paysOf = (screenProps: PrepScreenProps, band: string) =>
	screenProps.outcomes.ladder.rungs.find((rung) => rung.band === band)?.pays;

const standingLineOf = () =>
	within(sectionOf(BAND_OUTCOMES_TITLE))
		.getByText(/polls left/)
		.closest("p") as HTMLElement;

const CLEAR_LEAD = "Finish at";
const SWATCH_LEAD = "Answer all";
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
		expect(pin?.getAttribute("data-screen-theme")).toBe(
			ringedRowOf().getAttribute("data-screen-theme")
		);
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
		expect(right.firstElementChild).toBe(scoringFold());
		expect(right).toContainElement(sectionOf(PREP_POLLS_TITLE));
		expect(right).toContainElement(sectionOf("Audits"));
	});

	describe("the ladder in At stake", () => {
		it("starts empty on the gate's own line", () => {
			render(<PrepScreen {...props} />);

			expect(
				screen.getByRole("img", {
					name: new RegExp(`0% of ${ladder.healthy}% needed`),
				})
			).toBeInTheDocument();
		});

		it("stands inside At stake, in neither the Scoring fold nor the header", () => {
			const { container } = render(<PrepScreen {...props} />);

			expect(container.querySelectorAll(".band-ladder")).toHaveLength(1);
			expect(scoringFold()).not.toContainElement(ladderOf());
			expect(container.querySelector("header")).not.toContainElement(
				ladderOf()
			);
			expect(container.querySelectorAll(".coverage-bar")).toHaveLength(1);
			expect(ladderOf()).toContainElement(
				container.querySelector(".coverage-bar")
			);
		});

		it("writes each band's range beside it, so the room between lines reads as numbers", () => {
			render(<PrepScreen {...props} />);

			expect(
				within(rowOf("SHAKY")).getByText(`${ladder.floor} – ${ladder.ok}`)
			).toBeInTheDocument();
			expect(
				within(rowOf("HEALTHY")).getByText(`${ladder.healthy} – 100`)
			).toBeInTheDocument();
		});
	});

	describe("where you finish", () => {
		it("lists all five bands as rows, worst first, the full bar last", () => {
			render(<PrepScreen {...props} />);

			expect(rowThemesOf()).toEqual([
				"cinnabar",
				"vermillion",
				"saffron",
				"viridian",
				"cerulean",
			]);
			for (const band of ["DANGER", "SHAKY", "OK", "HEALTHY", "PERFECT"]) {
				expect(within(ladderOf()).getByText(band)).toBeInTheDocument();
			}
		});

		it("draws no band table, the ladder having taken its rows", () => {
			render(<PrepScreen {...props} />);

			const panel = within(sectionOf(BAND_OUTCOMES_TITLE));

			for (const heading of ["band", "coverage", "pays"]) {
				expect(panel.queryByText(heading)).not.toBeInTheDocument();
			}
		});

		it("heads the panel with the gate it prices, the number badged", () => {
			render(<PrepScreen {...props} />);

			const header = sectionOf(BAND_OUTCOMES_TITLE).querySelector(
				"header"
			) as HTMLElement;

			expect(header).toHaveTextContent("Lavender · gate 4");
			expect(within(header).getByText("4")).toHaveClass("badge-theme");
		});

		it("states the units to the next band up and the polls left, every figure badged", () => {
			render(<PrepScreen {...props} />);

			expect(standingLineOf()).toHaveTextContent(
				"+12 units to SHAKY · 5 polls left"
			);
			expect(within(standingLineOf()).getByText("+12")).toHaveAttribute(
				"data-screen-theme",
				"vermillion"
			);
			expect(within(standingLineOf()).getByText("5")).toHaveClass(
				"badge-theme"
			);
		});

		it("aims the standing line at HEALTHY from inside OK", () => {
			render(<PrepScreen {...kantoPrepCascadeThin()} />);

			expect(standingLineOf()).toHaveTextContent(
				"+1 unit to HEALTHY · 5 polls left"
			);
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

			it("badges OK at the calibration gate and draws it no DANGER zone", () => {
				render(<PrepScreen {...kantoPrepCalibration()} />);

				expect(within(requiredBlock()).getByText("OK")).toBeInTheDocument();
				expect(
					within(ladderOf()).queryByText("DANGER")
				).not.toBeInTheDocument();
			});

			it("asks for all five with the count badged", () => {
				render(<PrepScreen {...props} />);

				const block = objectiveBlockFor(SWATCH_LEAD);

				expect(block).toHaveTextContent("Answer all 5 right");
				expect(within(block).getByText("5")).toHaveClass("badge-theme");
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

		it("rings the row the pin is standing on, so the two cannot disagree", () => {
			const { container } = render(<PrepScreen {...props} />);

			const pinned = container
				.querySelector(".coverage-bar-pin")
				?.getAttribute("data-screen-theme");

			expect(pinned).not.toBeNull();
			expect(ladderOf().querySelectorAll(".ring-2")).toHaveLength(1);
			expect(ringedRowOf()).toHaveAttribute("data-screen-theme", pinned);
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

		it("shows only today's gate's answers, inside the panel that asks for them", () => {
			render(<PrepScreen {...props} />);

			const outcomes = sectionOf(BAND_OUTCOMES_TITLE);
			const scores = screen.getByLabelText(/^Lavender —/);

			expect(screen.getAllByLabelText(/— \d of 5 correct$/)).toHaveLength(1);
			expect(outcomes).toContainElement(scores);
		});

		it("stands the window's answers between the objectives and the ladder", () => {
			render(<PrepScreen {...props} />);

			const scores = screen.getByLabelText(/^Lavender —/);
			const swatchObjective = screen.getByText(SWATCH_LEAD);
			const bandRow = ladderOf();

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
				within(rowOf("SHAKY")).getByText(/^−\d+ KB peel$/)
			).toBeInTheDocument();
			expect(paysOf(props, "shaky")).toMatch(/^−\d+ KB peel$/);
		});

		it("ends the run under the floor rather than quoting a figure", () => {
			render(<PrepScreen {...props} />);

			expect(
				within(rowOf("DANGER")).getByText("the run ends")
			).toBeInTheDocument();
		});

		it("never pays a lower landing more than a higher one", () => {
			const kbOf = (band: string) =>
				Number(paysOf(props, band)?.match(/(\d+)/)?.[1]);

			expect(kbOf("perfect")).toBeGreaterThanOrEqual(kbOf("healthy"));
			expect(kbOf("healthy")).toBeGreaterThanOrEqual(kbOf("ok"));
			expect(kbOf("perfect")).toBeGreaterThan(kbOf("ok"));
		});
	});

	describe("scoring", () => {
		it("folds the scoring shut at the top of the right column, the codebase and a unit's worth on the strip", () => {
			render(<PrepScreen {...props} />);

			expect(scoringFold()).not.toHaveAttribute("open");
			expect(scoringFold().querySelector("summary")).toHaveTextContent(
				"25 slots 1 unit +4%"
			);
		});

		it("seals the figures of the gates ahead but keeps their names", () => {
			render(<PrepScreen {...props} />);

			const fold = within(scoringFold());

			for (const reached of ["Pallet", "Boulder", "Cascade", "Thunder"]) {
				expect(fold.getByText(reached)).toBeInTheDocument();
			}
			expect(fold.getByText("Rainbow")).toBeInTheDocument();
			expect(fold.getByText("Champion")).toBeInTheDocument();
			expect(fold.getAllByText("???")).toHaveLength(6);
			expect(fold.getAllByText("⋮")).toHaveLength(1);
		});

		it("seals nothing at the summit, where every gate has been reached", () => {
			render(<PrepScreen {...kantoPrepChampion()} />);

			const fold = within(scoringFold());

			expect(fold.queryByText("???")).toBeNull();
			expect(fold.queryByText("⋮")).toBeNull();
			expect(fold.getByText("Champion")).toBeInTheDocument();
		});
	});

	describe("the five polls", () => {
		it("withholds the window while nothing reveals it", () => {
			render(<PrepScreen {...props} />);

			const polls = within(sectionOf(PREP_POLLS_TITLE));

			expect(polls.getAllByText("???")).toHaveLength(3);
			expect(polls.getAllByText("?")).toHaveLength(5);
		});

		it("seals the next gate's row too while the window is sealed", () => {
			render(<PrepScreen {...props} />);

			const polls = within(sectionOf(PREP_POLLS_TITLE));

			expect(polls.getByText("next gate")).toBeInTheDocument();
			expect(polls.getAllByText("???")).toHaveLength(3);
		});

		it("counts nothing revealed and says what would reveal it", () => {
			render(<PrepScreen {...props} />);

			const polls = within(sectionOf(PREP_POLLS_TITLE));

			expect(polls.getByText("0 of 4")).toHaveClass("badge-theme");
			expect(polls.getByText("revealed")).toBeInTheDocument();
			expect(
				polls.getByText("Some configs reveal these before you answer.")
			).toBeInTheDocument();
		});

		it("opens the whole window at once when Prefetch is in the build, counted and credited", () => {
			render(<PrepScreen {...kantoPrepPrefetched()} />);

			const polls = sectionOf(PREP_POLLS_TITLE);

			expect(within(polls).getByText("Prefetch")).toHaveClass("badge-theme");
			expect(within(polls).getByText("4 of 4")).toHaveClass("badge-theme");
			expect(polls.querySelector("header")).toHaveTextContent(
				"4 of 4 revealed by Prefetch"
			);
			expect(screen.getByText("1 single")).toBeInTheDocument();
			expect(screen.getByText("4 multiple")).toBeInTheDocument();
			expect(screen.getByText("TypeScript ×3")).toBeInTheDocument();
			expect(screen.getByText("Git ×5")).toBeInTheDocument();
			expect(within(polls).queryByText("???")).not.toBeInTheDocument();
			expect(
				within(polls).queryByText(/Some configs reveal/)
			).not.toBeInTheDocument();
		});
	});

	describe("the incidents locked onto it", () => {
		it("names the incident a rival locked onto this gate, and counts it", () => {
			render(<PrepScreen {...props} />);

			expect(screen.getByText("404")).toBeInTheDocument();
			expect(screen.getByText("Not Found")).toBeInTheDocument();
			expect(screen.getByText("1 firing this gate")).toBeInTheDocument();
		});

		it("leaves the bill to the subscriptions panel that owns it", () => {
			render(<PrepScreen {...props} />);

			expect(screen.queryByText("bills")).not.toBeInTheDocument();
			expect(screen.getAllByText("−32 KB")).not.toHaveLength(0);
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
