import { describe, expect, it, vi } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
	BRIBE_LABEL,
	GATE_REVIEW_LABEL,
	GATE_SHOP_LABEL,
	NEW_RUN_LABEL,
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
	kantoGateShakyCollected,
	kantoGateShakyCollecting,
	kantoGateShakyFunded,
	kantoGateZero,
	kantoGateHealthyLine,
	kantoGateHeldUnscored,
} from "~/test/kantoGate.factory";

import { navRunOf, renderWithNavRun } from "~/test/navRun.harness";
import { STORAGE_BALANCE } from "~/shared/lib/copy";
import { kbLabel, signedKbLabel } from "~/shared/lib/storage";

import { COVERAGE_BAND_COLOR } from "./CoverageBar.ui";
import {
	GateOutcomeScreen,
	type GateOutcomeScreenProps,
} from "./GateOutcomeScreen.ui";

const headingOf = (name: string | RegExp) =>
	screen.getByRole("heading", { name });

const foldOf = (title: string) => headingOf(title).closest("details");

const figureOf = () =>
	within(navRunOf(document.body)!).getByText(STORAGE_BALANCE).parentElement;

const balanceKbOf = (props: GateOutcomeScreenProps) =>
	props.header.funds?.kb ?? 0;

const bodyOrderOf = (container: HTMLElement) =>
	[...container.querySelector("section > div")!.children].map((child) =>
		child.tagName.toLowerCase()
	);

describe("GateOutcomeScreen", () => {
	describe("the skeleton every band shares", () => {
		it("draws the band bar once, between the header and the folds", () => {
			const { container } = renderWithNavRun(
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
			const { container } = renderWithNavRun(
				<GateOutcomeScreen {...kantoGateHealthy()} />
			);

			expect(container.querySelector(".coverage-bar-pin")).toHaveTextContent(
				"83%"
			);
		});

		it("drops the chip that only repeats what the bar already reads", () => {
			renderWithNavRun(<GateOutcomeScreen {...kantoGateHealthy()} />);

			const header = headingOf("Lavender cleared").closest("header")!;

			expect(within(header).queryByText(/needed/)).not.toBeInTheDocument();
			expect(
				screen.getByRole("img", {
					name: `83% of ${kantoGateHealthyLine(4)}% needed · HEALTHY`,
				})
			).toBeInTheDocument();
		});

		it("opens coverage and every fold with news, the ledgers folded to their strips", () => {
			renderWithNavRun(<GateOutcomeScreen {...kantoGateHealthy()} />);

			expect(foldOf("Coverage")).toHaveAttribute("open");
			expect(foldOf("Earned")).toHaveAttribute("open");
			expect(foldOf("Build changes")).toHaveAttribute("open");
			expect(foldOf("By category")).not.toHaveAttribute("open");
			expect(foldOf("Payout")).not.toHaveAttribute("open");
			expect(foldOf("The five answers")).not.toHaveAttribute("open");
		});

		it("stands the score beside the takings, the answers across the foot", () => {
			const { container } = renderWithNavRun(
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
			const { container } = renderWithNavRun(
				<GateOutcomeScreen {...kantoGateHealthy()} />
			);

			const answers = screen.getByText("The five answers").closest("details");

			expect(answers?.closest("div.grid")).toBeNull();
			expect(container.querySelector("div.grid")).not.toBeNull();
		});

		it("opens every fold when the frame asks for it", () => {
			const { container } = renderWithNavRun(
				<GateOutcomeScreen {...kantoGateOutcomeOpen()} />
			);

			for (const fold of container.querySelectorAll("details")) {
				expect(fold).toHaveAttribute("open");
			}
		});
	});

	describe("a perfect close", () => {
		it("names the band in the title and the swatch it won under it", () => {
			renderWithNavRun(<GateOutcomeScreen {...kantoGatePerfect()} />);

			expect(headingOf("Lavender perfect")).toBeInTheDocument();
			expect(
				within(foldOf("Earned")!).getByText("Lavender swatch earned")
			).toBeInTheDocument();
		});

		it("never calls perfect 'every poll landed', which is a different rule", () => {
			const { container } = renderWithNavRun(
				<GateOutcomeScreen {...kantoGatePerfect()} />
			);

			expect(container.textContent).not.toContain("every poll landed");
		});

		it("counts right answers on the header and coverage held on the swatch row", () => {
			renderWithNavRun(<GateOutcomeScreen {...kantoGatePerfect()} />);

			expect(screen.getByText("5 of 5 right")).toBeInTheDocument();
			expect(within(foldOf("Earned")!).getByText("100%")).toBeInTheDocument();
			expect(
				within(foldOf("Earned")!).getByText("needs 100% coverage")
			).toBeInTheDocument();
		});

		it("leads with coverage, and prices the perfect bonus inside it", () => {
			const { container } = renderWithNavRun(
				<GateOutcomeScreen {...kantoGatePerfect()} />
			);
			const folds = [...container.querySelectorAll("details")];

			expect(folds[0]).toHaveTextContent("Coverage");
			expect(folds[0]).toHaveTextContent("See an overview of your results.");
			expect(folds[0]).not.toHaveTextContent("the bar filled");
		});

		it("keeps the bonus off every other band", () => {
			renderWithNavRun(<GateOutcomeScreen {...kantoGateHealthy()} />);

			expect(
				screen.queryByRole("heading", { name: "Perfect bonus" })
			).not.toBeInTheDocument();
		});
	});

	describe("a healthy close", () => {
		it("clears the gate and says the swatch went unclaimed", () => {
			renderWithNavRun(<GateOutcomeScreen {...kantoGateHealthy()} />);

			expect(headingOf("Lavender cleared")).toBeInTheDocument();
			expect(
				within(foldOf("Earned")!).getByText("Lavender swatch missed")
			).toBeInTheDocument();
			expect(screen.queryByText(/didn't earn/)).not.toBeInTheDocument();
		});

		it("leaves the swatch behind, since a change went uncovered", () => {
			renderWithNavRun(<GateOutcomeScreen {...kantoGateHealthy()} />);

			expect(
				screen.queryByText("Lavender swatch earned")
			).not.toBeInTheDocument();
		});

		it("leaves the streak to the receipt rather than a header chip", () => {
			renderWithNavRun(<GateOutcomeScreen {...kantoGateHealthy()} />);

			expect(screen.queryByText("streak 3")).not.toBeInTheDocument();
		});

		it("wears the gate's own colour, and paints the figure with the band", () => {
			const { container } = renderWithNavRun(
				<GateOutcomeScreen {...kantoGateHealthy()} />
			);

			expect(container.firstElementChild).toHaveAttribute(
				"data-gate-theme",
				"gate-lavender"
			);
			expect(figureOf()).toHaveAttribute(
				"data-screen-theme",
				COVERAGE_BAND_COLOR.healthy
			);
		});

		it("sends the player on to the shop", () => {
			renderWithNavRun(<GateOutcomeScreen {...kantoGateHealthy()} />);

			expect(
				screen.getByRole("button", { name: /^To the shop/ })
			).toBeEnabled();
		});
	});

	describe("an ok close", () => {
		it("clears the gate on its own band and says the payout was cut", () => {
			renderWithNavRun(<GateOutcomeScreen {...kantoGateOk()} />);

			expect(headingOf("Lavender cleared, thin")).toBeInTheDocument();
			expect(
				screen.getByText(/cleared on the OK band · the payout is cut/)
			).toBeInTheDocument();
		});

		it("keeps the swatch out of reach, since the clear is not the prize", () => {
			renderWithNavRun(<GateOutcomeScreen {...kantoGateOk()} />);

			expect(screen.queryByText("swatch earned")).not.toBeInTheDocument();
		});

		it("pays less than the same build cleared healthy", () => {
			const thin = balanceKbOf(kantoGateOk());
			const full = balanceKbOf(kantoGateHealthy());

			expect(thin).not.toBe(full);
		});
	});

	describe("a shaky close", () => {
		it("holds a window under the minimum while the bar still reads HEALTHY", () => {
			renderWithNavRun(<GateOutcomeScreen {...kantoGateHeldUnscored()} />);

			expect(headingOf("Lavender holds")).toBeInTheDocument();
			expect(
				screen.getByLabelText("75% of 73% needed \u00b7 HEALTHY")
			).toBeInTheDocument();
			expect(
				screen.getByText(
					/the window came up short · 5 fresh polls on the retry/
				)
			).toBeInTheDocument();
			expect(headingOf(/to retry/)).toBeInTheDocument();
		});

		it("holds the gate rather than earning it", () => {
			renderWithNavRun(<GateOutcomeScreen {...kantoGateShaky()} />);

			expect(headingOf("Lavender holds")).toBeInTheDocument();
		});

		it("offers both exits in one panel, rather than only the retry", () => {
			renderWithNavRun(<GateOutcomeScreen {...kantoGateShaky()} />);

			const choice = within(headingOf(/to retry/).closest("section")!);

			expect(
				choice.getByRole("button", { name: /^Pick a config/ })
			).toBeInTheDocument();
			expect(choice.getByRole("button", { name: "End the run" })).toBeEnabled();
		});

		it("leads with the settlement and shuts the recap beneath it", () => {
			renderWithNavRun(<GateOutcomeScreen {...kantoGateShaky()} />);

			expect(headingOf("What happened")).toBeInTheDocument();
			expect(foldOf("Coverage")?.open).toBe(false);
			expect(foldOf("The five answers")?.open).toBe(false);
		});

		it("lets the player walk away even while the peel is unpaid", () => {
			renderWithNavRun(<GateOutcomeScreen {...kantoGateShaky()} />);

			expect(screen.getByRole("button", { name: "End the run" })).toBeEnabled();
		});

		it("offers no storage move while the balance falls short", () => {
			renderWithNavRun(<GateOutcomeScreen {...kantoGateShaky()} />);

			expect(
				screen.queryByRole("radio", { name: BRIBE_LABEL })
			).not.toBeInTheDocument();
		});

		it("offers the whole bill from storage once the archive covers it", () => {
			renderWithNavRun(<GateOutcomeScreen {...kantoGateShakyFunded()} />);

			expect(screen.getByRole("radio", { name: BRIBE_LABEL })).toBeChecked();
		});

		it("holds the gate shut until a move is picked, with the retry inside the choice", () => {
			renderWithNavRun(<GateOutcomeScreen {...kantoGateShaky()} />);

			const choice = within(headingOf(/to retry/).closest("section")!);

			expect(
				choice.getByRole("button", { name: /^Pick a config/ })
			).toBeDisabled();
			expect(
				screen.queryByRole("button", { name: /^Retry gate 4/ })
			).not.toBeInTheDocument();
		});

		it("names a drop refund in a pill, rather than swapping the balance in silence", () => {
			const { rerender } = renderWithNavRun(
				<GateOutcomeScreen {...kantoGateShakyCollecting()} />
			);

			rerender(<GateOutcomeScreen {...kantoGateShakyCollected()} />);

			const refunded =
				balanceKbOf(kantoGateShakyCollected()) -
				balanceKbOf(kantoGateShakyCollecting());

			expect(refunded).toBeGreaterThan(0);
			expect(screen.getByRole("status")).toHaveTextContent(
				signedKbLabel(refunded)
			);
		});

		it("picks a config through the handler it was given", async () => {
			const onPick = vi.fn();

			renderWithNavRun(
				<GateOutcomeScreen
					{...kantoGateOutcomeAt({
						gate: 4,
						answers: SHAKY_ANSWERS,
						balanceBeforeKb: 12,
						configs: kantoGateOutcomeBuild,
						onPick,
					})}
				/>
			);

			await userEvent.click(screen.getByRole("radio", { name: "Drop Cache" }));

			expect(onPick).toHaveBeenCalledWith(["cache"], false);
		});

		it("offers the answers for review from the footer, not inside the fold", () => {
			renderWithNavRun(<GateOutcomeScreen {...kantoGateShaky()} />);

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
			renderWithNavRun(<GateOutcomeScreen {...kantoGateWon()} />);

			expect(headingOf("The climb is done")).toBeInTheDocument();
			expect(
				screen.queryByRole("button", { name: /^Retry gate/ })
			).not.toBeInTheDocument();
		});

		it("keeps the summit's own colour, since the run was not lost", () => {
			const { container } = renderWithNavRun(
				<GateOutcomeScreen {...kantoGateWon()} />
			);

			expect(container.firstElementChild).toHaveAttribute("data-gate-theme");
			expect(container.firstElementChild).not.toHaveAttribute(
				"data-screen-theme",
				COVERAGE_BAND_COLOR.danger
			);
		});

		it("offers a new run rather than a shop that has nothing left to sell", () => {
			renderWithNavRun(<GateOutcomeScreen {...kantoGateWon()} />);

			expect(
				screen.getByRole("button", { name: new RegExp(`^${NEW_RUN_LABEL}`) })
			).toBeEnabled();
			expect(
				screen.queryByRole("button", {
					name: new RegExp(`^${GATE_SHOP_LABEL}`),
				})
			).not.toBeInTheDocument();
		});
	});

	describe("a danger close", () => {
		it("ends the run instead of naming a gate that was earned", () => {
			renderWithNavRun(<GateOutcomeScreen {...kantoGateDanger()} />);

			expect(headingOf("Run over")).toBeInTheDocument();
			expect(screen.getByText(/no retry, no peel/)).toBeInTheDocument();
			expect(headingOf("The run ends here")).toBeInTheDocument();
		});

		it("leads with the storage it still holds, leaving the coverage it reached to the bar", () => {
			renderWithNavRun(<GateOutcomeScreen {...kantoGateDanger()} />);

			expect(figureOf()).toContainElement(
				screen.getByRole("img", {
					name: kbLabel(balanceKbOf(kantoGateDanger())),
				})
			);
			expect(screen.getByLabelText(/^52% of/)).toBeInTheDocument();
		});

		it("wears the ending's colour rather than the gate's, since no gate follows", () => {
			const { container } = renderWithNavRun(
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
			renderWithNavRun(<GateOutcomeScreen {...kantoGateDanger()} />);

			expect(
				screen.queryByRole("heading", { name: "Build changes" })
			).not.toBeInTheDocument();
		});

		it("counts the gates held rather than the streak it just lost", () => {
			renderWithNavRun(<GateOutcomeScreen {...kantoGateDanger()} />);

			expect(screen.getByText("4 gates held")).toBeInTheDocument();
			expect(screen.queryByText("streak broken")).not.toBeInTheDocument();
		});

		it("offers a new run and no retry", () => {
			renderWithNavRun(<GateOutcomeScreen {...kantoGateDanger()} />);

			expect(
				screen.getByRole("button", { name: new RegExp(`^${NEW_RUN_LABEL}`) })
			).toBeEnabled();
			expect(
				screen.queryByRole("button", { name: /^Retry gate/ })
			).not.toBeInTheDocument();
		});
	});

	describe("the opening gate, which has no floor to fall through", () => {
		it("draws the ladder it actually has rather than assuming five bands", () => {
			renderWithNavRun(<GateOutcomeScreen {...kantoGateZero()} />);

			expect(screen.queryByText("SHAKY")).not.toBeInTheDocument();
			expect(screen.getByText("HEALTHY")).toBeInTheDocument();
			expect(
				screen.getByText(`${kantoGateHealthyLine(0)}%`)
			).toBeInTheDocument();
		});

		it("still reads perfect at a full bar", () => {
			renderWithNavRun(<GateOutcomeScreen {...kantoGateZero()} />);

			expect(headingOf("Pallet perfect")).toBeInTheDocument();
		});

		it("folds an unmoved build to one line that says nothing moved", () => {
			renderWithNavRun(<GateOutcomeScreen {...kantoGateZero()} />);

			const changes = foldOf("Build changes");

			expect(changes).not.toHaveAttribute("open");
			expect(within(changes!).getByText("nothing moved")).toBeInTheDocument();
		});

		it("folds a quiet Earned panel to the coverage the swatch read", () => {
			renderWithNavRun(<GateOutcomeScreen {...kantoGateZero()} />);

			expect(foldOf("Earned")).not.toHaveAttribute("open");
			expect(
				within(foldOf("Earned")!).getByText("nothing new · swatch 100%")
			).toBeInTheDocument();
		});
	});
});

describe("GateOutcomeScreen's payout history", () => {
	it("lists what every gate the run has opened paid, inside Coverage", () => {
		renderWithNavRun(<GateOutcomeScreen {...kantoGatePerfect()} />);

		expect(screen.getByText("Score")).toBeInTheDocument();
		expect(screen.getByLabelText(/^Pallet/)).toBeInTheDocument();
	});

	it("sets the score apart in a section of its own, ruled off from the bar", () => {
		const { container } = renderWithNavRun(
			<GateOutcomeScreen {...kantoGatePerfect()} />
		);

		const section = screen.getByText("Score").parentElement;
		expect(section).toHaveClass("border-t");
		expect(container.querySelector(".coverage-bar")).not.toBeNull();
		expect(section?.querySelector(".coverage-bar")).toBeNull();
	});

	it("heads the score as accuracy is headed, each in a section of its own", () => {
		renderWithNavRun(
			<GateOutcomeScreen
				{...kantoGatePerfect()}
				accuracy={{ label: "Accuracy", figure: "×1.08", sure: 1, best: 1 }}
			/>
		);

		const score = screen.getByRole("heading", { level: 3, name: "Score" });
		const accuracy = screen.getByRole("heading", {
			level: 3,
			name: "Accuracy",
		});

		expect(score.className).toBe(accuracy.className);
		expect(accuracy.closest(".border-t")).not.toBeNull();
		expect(accuracy.closest(".border-t")).not.toContainElement(score);
	});

	it("leaves the table out for a call site that passes no history", () => {
		renderWithNavRun(
			<GateOutcomeScreen {...kantoGatePerfect()} payouts={undefined} />
		);

		expect(screen.queryByText("Score")).toBeNull();
	});
});
