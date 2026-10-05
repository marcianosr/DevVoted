import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";

import {
	BAND_OUTCOMES_NOTE,
	BAND_OUTCOMES_TITLE,
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

import { PrepScreen, type PrepScreenProps } from "./PrepScreen.ui";
import { SCORING_TITLE } from "./Scoring.ui";
import { renderWithNavRun } from "~/test/navRun.harness";

const props = kantoPrepSealed();
const ladder = kantoPrepLadder(KANTO_PREP_GATE);

const sectionOf = (name: string) =>
	screen.getByRole("heading", { name }).closest("section") as HTMLElement;

const scoringPanel = () => sectionOf(SCORING_TITLE);

const startPress = () =>
	screen.getByRole("button", { name: /^Start Lavender/ });

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

const CLEAR_LEAD = "Finish at";
const SWATCH_LEAD = "Reach";
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

		expect(pin).toBeInTheDocument();
		expect(pin).toHaveTextContent(/%/);
		expect(pin?.getAttribute("data-screen-theme")).toBe(
			ringedRowOf().getAttribute("data-screen-theme")
		);
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

		expect(screen.getByText("Lavender Gate")).toBeInTheDocument();
		expect(screen.getByText("1 audit")).toBeInTheDocument();
	});

	it("wears the gate it is about to run", () => {
		const { container } = render(<PrepScreen {...props} />);

		expect(container.firstElementChild).toHaveAttribute(
			"data-gate-theme",
			"gate-lavender"
		);
	});

	it("reads as two columns, the outcomes beside the window they price", () => {
		const { container } = render(<PrepScreen {...props} />);

		const columns = container.querySelector(".md\\:grid-cols-2") as HTMLElement;
		const [left, right] = [...columns.children];

		expect(left).toContainElement(sectionOf(BAND_OUTCOMES_TITLE));
		expect(right.firstElementChild).toBe(scoringPanel());
		expect(right).toContainElement(sectionOf(PREP_POLLS_TITLE));
		expect(right).toContainElement(sectionOf("Audits"));
	});

	it("closes the right column on the start press, under the polls and the audits", () => {
		const { container } = render(<PrepScreen {...props} />);

		const columns = container.querySelector(".md\\:grid-cols-2") as HTMLElement;
		const right = columns.children[1];

		expect(right.lastElementChild).toContainElement(startPress());
		expect(
			sectionOf("Audits").compareDocumentPosition(startPress()) &
				Node.DOCUMENT_POSITION_FOLLOWING
		).toBeTruthy();
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
			expect(scoringPanel()).not.toContainElement(ladderOf());
			expect(container.querySelector("header")).not.toContainElement(
				ladderOf()
			);
			expect(container.querySelectorAll(".coverage-bar")).toHaveLength(1);
			expect(ladderOf()).toContainElement(
				container.querySelector(".coverage-bar")
			);
		});

		it("states each band by the line it starts at", () => {
			render(<PrepScreen {...props} />);

			expect(
				within(rowOf("SHAKY")).getByText(`${ladder.floor}%+`)
			).toBeInTheDocument();
			expect(
				within(rowOf("HEALTHY")).getByText(`${ladder.healthy}%+`)
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

			const panel = within(ladderOf().parentElement as HTMLElement);

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
				expect(block.getByText("advance to the next gate")).toBeInTheDocument();
				expect(block.queryByText("to clear the gate")).not.toBeInTheDocument();
				expect(block.queryByText(/of the 5 right/)).not.toBeInTheDocument();
			});

			it("earns the swatch on a full bar, not on a band or a count of right", () => {
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

			it("asks for a full bar with the figure badged in PERFECT's colour", () => {
				render(<PrepScreen {...props} />);

				const block = objectiveBlockFor(SWATCH_LEAD);

				expect(block).toHaveTextContent("Reach 100% coverage");
				expect(within(block).getByText("100%")).toHaveAttribute(
					"data-screen-theme",
					"cerulean"
				);
			});

			it("never names the gate's codebase anywhere in At stake", () => {
				render(<PrepScreen {...props} />);

				expect(sectionOf(BAND_OUTCOMES_TITLE)).not.toHaveTextContent(
					/\bchanges?\b/i
				);
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

		it("states neither the gate's answers nor a standing line", () => {
			render(<PrepScreen {...props} />);

			expect(screen.queryByLabelText(/^Lavender —/)).toBeNull();
			expect(screen.queryByText(/polls left/)).toBeNull();
		});

		it("footnotes where a pay lands and what a peel is settled in", () => {
			render(<PrepScreen {...props} />);

			expect(screen.getByText(BAND_OUTCOMES_NOTE)).toBeInTheDocument();
		});

		it("bills the holding band a peel instead of paying it", () => {
			render(<PrepScreen {...props} />);

			expect(
				within(rowOf("SHAKY")).getByText(/^gate held · −\d+ KB peel$/)
			).toBeInTheDocument();
			expect(paysOf(props, "shaky")).toMatch(/^gate held · −\d+ KB peel$/);
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
		it("states the gate's gains and the accuracy bonus, and no table", () => {
			render(<PrepScreen {...props} />);

			const scoring = within(scoringPanel());

			expect(scoring.getByText("Single choice")).toBeInTheDocument();
			expect(scoring.getAllByText("+14.3%").length).toBeGreaterThan(0);
			expect(scoring.getByText("Multiple choice up to")).toBeInTheDocument();
			expect(scoring.getByText("+28.6%")).toBeInTheDocument();
			expect(scoring.getByText("Accuracy Bonus")).toBeInTheDocument();
			expect(scoring.getByText("up to ×1.08")).toBeInTheDocument();
			expect(scoring.queryByText("Pallet")).toBeNull();
			expect(scoring.queryByText("???")).toBeNull();
		});
	});

	describe("the five polls", () => {
		it("seals five tiles while nothing reveals them, and says so", () => {
			render(<PrepScreen {...props} />);

			const polls = within(sectionOf(PREP_POLLS_TITLE));

			expect(polls.getAllByText("?")).toHaveLength(5);
			expect(polls.getAllByText("Sealed poll")).toHaveLength(5);
			expect(polls.getByText("sealed")).toHaveClass("badge-theme");
			expect(polls.queryByText("next gate")).toBeNull();
		});

		it("staggers the tiles' wiggle, one step per tile", () => {
			const { container } = render(<PrepScreen {...props} />);

			const tiles = [...container.querySelectorAll(".seal-wiggle")];

			expect(
				tiles.map((tile) =>
					(tile as HTMLElement).style.getPropertyValue("--tile-index")
				)
			).toEqual(["0", "1", "2", "3", "4"]);
		});

		it("names each poll on its tile when Prefetch is in the build, and the next gate under them", () => {
			render(<PrepScreen {...kantoPrepPrefetched()} />);

			const polls = within(sectionOf(PREP_POLLS_TITLE));

			expect(polls.getByText("revealed by Prefetch")).toHaveClass(
				"badge-theme"
			);
			expect(polls.getAllByText("TypeScript")).toHaveLength(3);
			expect(polls.getByText("single · 4 options")).toBeInTheDocument();
			expect(polls.getByText("next gate")).toBeInTheDocument();
			expect(polls.getByText("Git ×5")).toBeInTheDocument();
			expect(polls.queryByText("?")).toBeNull();
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

		it("draws no audits panel before the first audited gate", () => {
			render(<PrepScreen {...kantoPrepCalibration()} />);

			expect(screen.queryByText("Audits")).not.toBeInTheDocument();
			expect(screen.queryByText("gate 3")).not.toBeInTheDocument();
		});
	});

	describe("the footer", () => {
		it("prices no peel beside the start", () => {
			render(<PrepScreen {...props} />);

			expect(screen.queryByText(/peels/)).not.toBeInTheDocument();
		});

		it("offers no community board from the gate", () => {
			render(<PrepScreen {...props} />);

			expect(screen.queryByRole("button", { name: /Community/ })).toBeNull();
		});

		it("glints on the start while it can be pressed", () => {
			render(<PrepScreen {...props} />);

			expect(startPress()).toHaveClass("press-sheen");
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

		it("hands the nav the balance it holds", () => {
			renderWithNavRun(<PrepScreen {...champion} />);

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
		it("marks the start with the gate it starts", () => {
			render(<PrepScreen {...props} />);

			expect(
				startPress().querySelector("[data-swatch-theme='gate-lavender']")
			).not.toBeNull();
		});

		it("starts the gate in the gate's own colour, not a stock green", () => {
			render(<PrepScreen {...props} />);

			const start = screen.getByRole("button", { name: /^Start Lavender/ });

			expect(start).not.toHaveAttribute("data-screen-theme");
			expect(start).toHaveClass("segment-theme");
		});
	});
});
