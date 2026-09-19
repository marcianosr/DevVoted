import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
	GATE_REVIEW_LABEL,
	GATE_SHOP_LABEL,
	NEW_RUN_LABEL,
	PEEL_REFUSAL,
	SHAKY_ANSWERS,
	kantoGateDanger,
	kantoGateWon,
	kantoGateHealthy,
	kantoGateOk,
	kantoGateOutcomeAt,
	kantoGateOutcomeBuild,
	kantoGateOutcomeOpen,
	kantoGatePerfect,
	kantoGateShaky,
	kantoGateShakyFunded,
	kantoGateShakyPicking,
	kantoGateZero,
	kantoGateHealthyLine,
} from "~/test/kantoGate.factory";

import { COVERAGE_BAND_COLOR } from "./CoverageBar.ui";
import { GateOutcomeScreen } from "./GateOutcomeScreen.ui";

const headingOf = (name: string | RegExp) =>
	screen.getByRole("heading", { name });

const foldOf = (title: string) => headingOf(title).closest("details");

const heroOf = (container: HTMLElement) => container.querySelector(".size-10");

const figureOf = () =>
	headingOf(/Lavender|Pallet|Run over/)
		.closest("header")!
		.querySelector("[data-screen-theme]");

const bodyOrderOf = (container: HTMLElement) =>
	[...container.querySelector("section > div")!.children].map((child) =>
		child.tagName.toLowerCase()
	);

describe("GateOutcomeScreen", () => {
	describe("the skeleton every band shares", () => {
		it("draws the band bar once, between the header and the folds", () => {
			const { container } = render(
				<GateOutcomeScreen {...kantoGateHealthy()} />
			);

			expect(container.querySelectorAll(".coverage-bar")).toHaveLength(1);
			expect(bodyOrderOf(container).slice(0, 3)).toEqual([
				"header",
				"div",
				"div",
			]);
		});

		it("pins the bar where the meter stopped, since the gate is closed", () => {
			const { container } = render(
				<GateOutcomeScreen {...kantoGateHealthy()} />
			);

			expect(container.querySelector(".coverage-bar-pin")).toHaveTextContent(
				"72%"
			);
		});

		it("drops the chip that only repeats what the bar already reads", () => {
			render(<GateOutcomeScreen {...kantoGateHealthy()} />);

			const header = headingOf("Lavender cleared").closest("header")!;

			expect(within(header).queryByText(/needed/)).not.toBeInTheDocument();
			expect(
				screen.getByRole("img", {
					name: `72% of ${kantoGateHealthyLine(4)}% needed · HEALTHY`,
				})
			).toBeInTheDocument();
		});

		it("opens on coverage alone, the rest of the strips carrying the reading", () => {
			const { container } = render(
				<GateOutcomeScreen {...kantoGateHealthy()} />
			);

			const [coverage, ...rest] = [...container.querySelectorAll("details")];

			expect(coverage).toHaveTextContent("Coverage");
			expect(coverage).toHaveAttribute("open");
			for (const fold of rest) {
				expect(fold).not.toHaveAttribute("open");
			}
		});

		it("stands the score beside the takings, the answers across the foot", () => {
			const { container } = render(
				<GateOutcomeScreen {...kantoGateHealthy()} />
			);

			const [score, takings] = [
				...container.querySelectorAll<HTMLElement>("div.grid > div"),
			];

			expect(within(score).getByText("Coverage")).toBeInTheDocument();
			expect(within(score).getByText("By category")).toBeInTheDocument();
			expect(within(takings).getByText("Payout")).toBeInTheDocument();
			expect(within(takings).getByText("Build changes")).toBeInTheDocument();
			expect(within(score).queryByText("The five answers")).toBeNull();
			expect(within(takings).queryByText("The five answers")).toBeNull();
		});

		it("leaves the answers the full width their questions need", () => {
			const { container } = render(
				<GateOutcomeScreen {...kantoGateHealthy()} />
			);

			const answers = screen.getByText("The five answers").closest("details");

			expect(answers?.closest("div.grid")).toBeNull();
			expect(container.querySelector("div.grid")).not.toBeNull();
		});

		it("opens every fold when the frame asks for it", () => {
			const { container } = render(
				<GateOutcomeScreen {...kantoGateOutcomeOpen()} />
			);

			for (const fold of container.querySelectorAll("details")) {
				expect(fold).toHaveAttribute("open");
			}
		});
	});

	describe("a perfect close", () => {
		it("names the band in the title and says what filled the bar", () => {
			render(<GateOutcomeScreen {...kantoGatePerfect()} />);

			expect(headingOf("Lavender perfect")).toBeInTheDocument();
			expect(
				screen.getByText(/the bar filled · next up Rainbow/)
			).toBeInTheDocument();
		});

		it("never calls perfect 'every poll landed', which is a different rule", () => {
			const { container } = render(
				<GateOutcomeScreen {...kantoGatePerfect()} />
			);

			expect(container.textContent).not.toContain("every poll landed");
		});

		it("marks the swatch it won without trading away the gate's colour", () => {
			const { container } = render(
				<GateOutcomeScreen {...kantoGatePerfect()} />
			);

			expect(heroOf(container)).toHaveClass("bg-theme", "legendary-ring");
			expect(heroOf(container)).toHaveAttribute(
				"data-swatch-theme",
				"lavender"
			);
		});

		it("names the swatch on a chip, since the title only reports the clear", () => {
			render(<GateOutcomeScreen {...kantoGatePerfect()} />);

			expect(screen.getByText("swatch earned")).toBeInTheDocument();
			expect(screen.getByText("5 of 5 right")).toBeInTheDocument();
		});

		it("leads with coverage, and prices the perfect bonus inside it", () => {
			const { container } = render(
				<GateOutcomeScreen {...kantoGatePerfect()} />
			);
			const folds = [...container.querySelectorAll("details")];

			expect(folds[0]).toHaveTextContent("Coverage");
			expect(within(folds[0]!).getByText("the bar filled")).toBeInTheDocument();
		});

		it("keeps the bonus off every other band", () => {
			render(<GateOutcomeScreen {...kantoGateHealthy()} />);

			expect(
				screen.queryByRole("heading", { name: "Perfect bonus" })
			).not.toBeInTheDocument();
		});
	});

	describe("a healthy close", () => {
		it("clears the gate and points at the next one", () => {
			render(<GateOutcomeScreen {...kantoGateHealthy()} />);

			expect(headingOf("Lavender cleared")).toBeInTheDocument();
			expect(screen.getByText(/next up Rainbow/)).toBeInTheDocument();
		});

		it("leaves the swatch behind, since a partial broke the window", () => {
			const { container } = render(
				<GateOutcomeScreen {...kantoGateHealthy()} />
			);

			expect(heroOf(container)).toHaveClass("border-dashed");
			expect(heroOf(container)).not.toHaveClass("bg-theme");
			expect(screen.queryByText("swatch earned")).not.toBeInTheDocument();
		});

		it("keeps the streak it arrived with", () => {
			render(<GateOutcomeScreen {...kantoGateHealthy()} />);

			expect(screen.getByText("streak 3")).toBeInTheDocument();
			expect(screen.queryByText("streak broken")).not.toBeInTheDocument();
		});

		it("wears the gate's own colour, and paints the figure with the band", () => {
			const { container } = render(
				<GateOutcomeScreen {...kantoGateHealthy()} />
			);

			expect(container.firstElementChild).toHaveAttribute(
				"data-gate-theme",
				"lavender"
			);
			expect(figureOf()).toHaveAttribute(
				"data-screen-theme",
				COVERAGE_BAND_COLOR.healthy
			);
		});

		it("sends the player on to the shop", () => {
			render(<GateOutcomeScreen {...kantoGateHealthy()} />);

			expect(screen.getByRole("button", { name: "To the shop" })).toBeEnabled();
		});
	});

	describe("an ok close", () => {
		it("clears the gate on its own band and says the payout was cut", () => {
			render(<GateOutcomeScreen {...kantoGateOk()} />);

			expect(headingOf("Lavender cleared, thin")).toBeInTheDocument();
			expect(
				screen.getByText(/cleared on the OK band · the payout is cut/)
			).toBeInTheDocument();
		});

		it("keeps the swatch out of reach, since the clear is not the prize", () => {
			const { container } = render(<GateOutcomeScreen {...kantoGateOk()} />);

			expect(heroOf(container)).toHaveClass("border-dashed");
			expect(screen.queryByText("swatch earned")).not.toBeInTheDocument();
		});

		it("breaks the streak, which is what separates it from healthy", () => {
			render(<GateOutcomeScreen {...kantoGateOk()} />);

			expect(screen.getByText("streak broken")).toBeInTheDocument();
		});

		it("pays less than the same build cleared healthy", () => {
			const thin = kantoGateOk().header.figure.amount;
			const full = kantoGateHealthy().header.figure.amount;

			expect(thin).not.toBe(full);
		});
	});

	describe("a shaky close", () => {
		it("holds the gate rather than earning it", () => {
			const { container } = render(<GateOutcomeScreen {...kantoGateShaky()} />);

			expect(headingOf("Lavender holds")).toBeInTheDocument();
			expect(heroOf(container)).toHaveClass("border-dashed");
			expect(heroOf(container)).not.toHaveClass("bg-theme");
		});

		it("offers both exits, priced, rather than only the retry", () => {
			render(<GateOutcomeScreen {...kantoGateShaky()} />);

			expect(headingOf("How this gate ends")).toBeInTheDocument();
			expect(headingOf("Retry gate 4")).toBeInTheDocument();
			expect(headingOf("End the run here")).toBeInTheDocument();
		});

		it("lets the player walk away even while the peel is unpaid", () => {
			render(<GateOutcomeScreen {...kantoGateShaky()} />);

			expect(screen.getByRole("button", { name: "End the run" })).toBeEnabled();
		});

		it("refuses the bribe it cannot afford, naming the shortfall", () => {
			render(<GateOutcomeScreen {...kantoGateShaky()} />);

			expect(
				screen.getByRole("button", {
					name: "Bribe from the archive · short 20 KB",
				})
			).toBeDisabled();
		});

		it("takes the bribe once the archive covers the bill", () => {
			render(<GateOutcomeScreen {...kantoGateShakyFunded()} />);

			expect(
				screen.getByRole("button", { name: "Bribe from the archive" })
			).toBeEnabled();
		});

		it("holds the gate shut until the peel is settled", () => {
			render(<GateOutcomeScreen {...kantoGateShaky()} />);

			expect(
				screen.getByRole("button", { name: "Retry gate 4" })
			).toBeDisabled();
			expect(screen.getByText(PEEL_REFUSAL)).toBeInTheDocument();
		});

		it("counts a part payment down rather than restating the bill", () => {
			render(<GateOutcomeScreen {...kantoGateShakyPicking()} />);

			expect(
				screen.getByText("16 KB still owed · 32 KB chosen")
			).toBeInTheDocument();
		});

		it("strikes a config through once it is chosen to go", () => {
			render(<GateOutcomeScreen {...kantoGateShakyPicking()} />);

			const drop = within(headingOf("How this gate ends").closest("section")!);

			expect(drop.getByText("IndexedDB")).toHaveClass("line-through");
			expect(drop.getByText("Cache")).not.toHaveClass("line-through");
		});

		it("toggles a config through the handler it was given", async () => {
			const onToggle = vi.fn();

			render(
				<GateOutcomeScreen
					{...kantoGateOutcomeAt({
						gate: 4,
						answers: SHAKY_ANSWERS,
						balanceBeforeKb: 12,
						configs: kantoGateOutcomeBuild,
						onToggle,
					})}
				/>
			);

			await userEvent.click(screen.getByRole("button", { name: "Drop Cache" }));

			expect(onToggle).toHaveBeenCalledWith("cache");
		});

		it("offers the answers for review from the footer, not inside the fold", () => {
			render(<GateOutcomeScreen {...kantoGateShaky()} />);

			expect(
				within(foldOf("The five answers")!).queryByRole("button", {
					name: GATE_REVIEW_LABEL,
				})
			).not.toBeInTheDocument();
			expect(
				screen.getByRole("button", { name: GATE_REVIEW_LABEL })
			).toBeEnabled();
		});
	});

	describe("a won run", () => {
		it("closes the climb instead of pointing at a gate that never comes", () => {
			render(<GateOutcomeScreen {...kantoGateWon()} />);

			expect(headingOf("The climb is done")).toBeInTheDocument();
			expect(
				screen.queryByRole("button", { name: /^Retry gate/ })
			).not.toBeInTheDocument();
		});

		it("keeps the summit's own colour, since the run was not lost", () => {
			const { container } = render(<GateOutcomeScreen {...kantoGateWon()} />);

			expect(container.firstElementChild).toHaveAttribute("data-gate-theme");
			expect(container.firstElementChild).not.toHaveAttribute(
				"data-screen-theme",
				COVERAGE_BAND_COLOR.danger
			);
		});

		it("offers a new run rather than a shop that has nothing left to sell", () => {
			render(<GateOutcomeScreen {...kantoGateWon()} />);

			expect(screen.getByRole("button", { name: NEW_RUN_LABEL })).toBeEnabled();
			expect(
				screen.queryByRole("button", { name: GATE_SHOP_LABEL })
			).not.toBeInTheDocument();
		});
	});

	describe("a danger close", () => {
		it("ends the run instead of naming a gate that was earned", () => {
			render(<GateOutcomeScreen {...kantoGateDanger()} />);

			expect(headingOf("Run over")).toBeInTheDocument();
			expect(screen.getByText(/no retry, no peel/)).toBeInTheDocument();
			expect(headingOf("The run ends here")).toBeInTheDocument();
		});

		it("leads with the coverage it reached, not with a payout it never got", () => {
			render(<GateOutcomeScreen {...kantoGateDanger()} />);

			expect(figureOf()).toHaveTextContent("20%");
		});

		it("wears the ending's colour rather than the gate's, since no gate follows", () => {
			const { container } = render(
				<GateOutcomeScreen {...kantoGateDanger()} />
			);

			expect(container.firstElementChild).toHaveAttribute(
				"data-screen-theme",
				COVERAGE_BAND_COLOR.danger
			);
			expect(container.firstElementChild).not.toHaveAttribute(
				"data-gate-theme"
			);
		});

		it("drops the build-changes fold, which has nothing left to change", () => {
			render(<GateOutcomeScreen {...kantoGateDanger()} />);

			expect(
				screen.queryByRole("heading", { name: "Build changes" })
			).not.toBeInTheDocument();
		});

		it("counts the gates held rather than the streak it just lost", () => {
			render(<GateOutcomeScreen {...kantoGateDanger()} />);

			expect(screen.getByText("4 gates held")).toBeInTheDocument();
			expect(screen.queryByText("streak broken")).not.toBeInTheDocument();
		});

		it("offers a new run and no retry", () => {
			render(<GateOutcomeScreen {...kantoGateDanger()} />);

			expect(screen.getByRole("button", { name: NEW_RUN_LABEL })).toBeEnabled();
			expect(
				screen.queryByRole("button", { name: /^Retry gate/ })
			).not.toBeInTheDocument();
		});
	});

	describe("the opening gate, which has no floor to fall through", () => {
		it("draws the ladder it actually has rather than assuming five bands", () => {
			render(<GateOutcomeScreen {...kantoGateZero()} />);

			expect(screen.queryByText("survive")).not.toBeInTheDocument();
			expect(
				screen.getByText(`HEALTHY ${kantoGateHealthyLine(0)}%`)
			).toBeInTheDocument();
		});

		it("still reads perfect at a full bar", () => {
			render(<GateOutcomeScreen {...kantoGateZero()} />);

			expect(headingOf("Pallet perfect")).toBeInTheDocument();
		});

		it("answers for an unmoved build instead of opening on a blank fold", () => {
			render(<GateOutcomeScreen {...kantoGateZero()} />);

			const changes = foldOf("Build changes");

			expect(changes).not.toBeNull();
			expect(within(changes!).getByText("none")).toBeInTheDocument();
		});
	});
});

describe("GateOutcomeScreen's payout history", () => {
	it("lists what every gate the run has opened paid, inside Coverage", () => {
		render(<GateOutcomeScreen {...kantoGatePerfect()} />);

		expect(screen.getByText("what each poll paid")).toBeInTheDocument();
		expect(screen.getByLabelText(/^Pallet/)).toBeInTheDocument();
	});

	it("leaves the table out for a call site that passes no history", () => {
		render(<GateOutcomeScreen {...kantoGatePerfect()} payouts={undefined} />);

		expect(screen.queryByText("what each poll paid")).toBeNull();
	});
});
