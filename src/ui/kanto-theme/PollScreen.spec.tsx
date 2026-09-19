import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import {
	createKantoBuildFooterProps,
	createKantoBuildProps,
	createKantoCoverageBarProps,
	createKantoHeaderProps,
	createKantoPollScreenProps,
	createKantoQuestionProps,
	kantoAudits,
} from "~/test/kantoPoll.factory";
import { gateSwatchAt } from "~/test/swatchTrack.factory";

import { PollScreen } from "./PollScreen.ui";

const props = createKantoPollScreenProps();

describe("PollScreen", () => {
	it("takes its colour from the gate it is running, not from a prop", () => {
		const { container } = render(<PollScreen {...props} />);

		expect(container.firstChild).toHaveAttribute("data-gate-theme", "volcano");
		expect(container.firstChild).not.toHaveAttribute("data-screen-theme");
	});

	it("follows the gate when the gate changes", () => {
		const { container } = render(
			<PollScreen
				{...props}
				header={{ ...props.header, swatch: gateSwatchAt(11) }}
			/>
		);

		expect(container.firstChild).toHaveAttribute("data-gate-theme", "elite");
	});

	it("leads with the gate, its track and the run's balance", () => {
		render(<PollScreen {...props} />);

		expect(screen.getByText("Gate 9 · Volcano")).toBeInTheDocument();
		expect(screen.getByText("1.8 MB")).toBeInTheDocument();
	});

	it("posts every audit the gate is running", () => {
		render(<PollScreen {...props} />);

		expect(screen.getByText(kantoAudits[0].name)).toBeInTheDocument();
		expect(screen.getByText(kantoAudits[1].name)).toBeInTheDocument();
	});

	it("posts no audit strip on a clean gate", () => {
		render(<PollScreen {...props} audits={[]} />);

		expect(screen.queryByText(kantoAudits[0].name)).not.toBeInTheDocument();
	});

	it("keeps the build in a footer that folds shut under the poll", () => {
		const { container } = render(
			<PollScreen
				{...props}
				buildFooter={createKantoBuildFooterProps({ open: false })}
			/>
		);

		expect(screen.getByText("Build")).toBeInTheDocument();
		expect(container.querySelector("footer details")).not.toHaveAttribute(
			"open"
		);
	});

	it("opens the build footer when the run asks for it", () => {
		const { container } = render(
			<PollScreen
				{...props}
				buildFooter={createKantoBuildFooterProps({ open: true })}
			/>
		);

		expect(container.querySelector("footer details")).toHaveAttribute("open");
	});

	it("opens the skipped fold inside the footer when the run asks for it", () => {
		const { container } = render(
			<PollScreen
				{...props}
				buildFooter={createKantoBuildFooterProps({
					build: createKantoBuildProps({ skippedOpen: true }),
					open: true,
				})}
			/>
		);

		const folds = container.querySelectorAll("footer details");
		expect(folds).toHaveLength(2);
		expect(folds[1]).toHaveAttribute("open");
	});

	it("prices a wrong answer beside the poll's own facts", () => {
		render(<PollScreen {...props} />);

		expect(screen.getByText("wrong costs")).toBeInTheDocument();
		expect(screen.getByText("0.77")).toBeInTheDocument();
	});

	it("says nothing about the cost of a miss when there is none to name", () => {
		render(<PollScreen {...props} wrongCost={undefined} />);

		expect(screen.queryByText("wrong costs")).not.toBeInTheDocument();
	});

	it("badges the category the poll was drawn from, up in the panel head", () => {
		render(<PollScreen {...props} />);

		expect(screen.getByText("TypeScript")).toHaveClass("badge-theme");
	});

	it("lets the category badge take a colour of its own", () => {
		render(<PollScreen {...props} />);

		expect(screen.getByText("TypeScript")).toHaveAttribute(
			"data-screen-theme",
			"cinnabar"
		);
	});

	it("counts the options and names a single-answer poll", () => {
		render(<PollScreen {...props} />);

		expect(screen.getByText("3 options · single answer")).toBeInTheDocument();
	});

	it("names a multiple-answer poll in the plural", () => {
		render(
			<PollScreen
				{...props}
				question={createKantoQuestionProps({ answerType: "multiple" })}
			/>
		);

		expect(
			screen.getByText("3 options · multiple answers")
		).toBeInTheDocument();
	});

	it("prices a wrong answer beside the poll's own facts", () => {
		render(<PollScreen {...props} />);

		expect(screen.getByText("wrong costs")).toBeInTheDocument();
		expect(screen.getByText("0.77")).toHaveAttribute(
			"data-screen-theme",
			"cinnabar"
		);
	});

	it("names the poll by its step through the gate", () => {
		render(<PollScreen {...props} />);

		expect(
			screen.getByRole("heading", { name: "Poll 4 out of 5" })
		).toBeInTheDocument();
	});

	it("counts the audits that are firing", () => {
		render(<PollScreen {...props} />);

		expect(screen.getByText("2 firing")).toBeInTheDocument();
	});

	it("asks the poll's question and offers its answers", () => {
		render(<PollScreen {...props} />);

		expect(
			screen.getByRole("heading", {
				name: "Which utility type makes every property optional?",
			})
		).toBeInTheDocument();
		expect(screen.getByText("Partial<T>")).toBeInTheDocument();
	});

	it("closes on the controls hint", () => {
		render(<PollScreen {...props} />);

		expect(
			screen.getByText("tap any config to open it · press A, B or C to answer")
		).toBeInTheDocument();
	});

	it("drops the hint line when none is given", () => {
		render(<PollScreen {...props} hint={undefined} />);

		expect(screen.queryByText(/press A, B or C/)).not.toBeInTheDocument();
	});

	it("credits the poll's author only when one is known", () => {
		const { rerender } = render(<PollScreen {...props} />);
		expect(screen.queryByText(/Created by/)).not.toBeInTheDocument();

		rerender(<PollScreen {...props} author={{ handle: "marciano" }} />);
		expect(screen.getByText(/Created by @marciano/)).toBeInTheDocument();
	});

	it("closes the poll panel on one footer: the credit beside the hint", () => {
		render(<PollScreen {...props} author={{ handle: "marciano" }} />);

		const footer = screen.getByText(/Created by @marciano/).closest("footer");

		expect(footer).toHaveTextContent("press A, B or C to answer");
		expect(footer?.closest("section")).toHaveTextContent(
			"Which utility type makes every property optional?"
		);
	});

	it("runs the screen as one column: header, coverage, audits, poll, build", () => {
		const { container } = render(<PollScreen {...props} />);

		const body = container.querySelector("section > div");
		const order = Array.from(body?.children ?? []).map((child) =>
			child.tagName.toLowerCase()
		);

		expect(order).toEqual([
			"header",
			"section",
			"section",
			"section",
			"footer",
		]);
	});

	it("reads coverage in a panel of its own rather than inside the header", () => {
		const { container } = render(<PollScreen {...props} />);

		const bar = screen.getByRole("img", { name: /needed/ });

		expect(container.querySelector("header")).not.toContainElement(bar);
		expect(bar.closest("section")).toHaveTextContent("Coverage");
	});

	it("heads the coverage panel with the band it is standing in", () => {
		render(<PollScreen {...props} />);

		expect(screen.getByText("70% SHAKY")).toBeInTheDocument();
	});

	it("explains what a correct answer is worth, for a reader and on hover", () => {
		render(<PollScreen {...props} />);

		expect(
			screen.getByRole("button", { name: "How a correct answer is counted" })
		).toHaveTextContent("what a poll pays");
	});

	it("says what the run has scored and what the gate scores it out of", () => {
		render(<PollScreen {...props} />);

		expect(
			screen.getByText(
				(_, node) =>
					node?.textContent ===
					"You have scored 35 units across 50 slots, which is 70.0% coverage."
			)
		).toBeInTheDocument();
	});

	it("shows what this gate's polls paid, and no earlier gate's", () => {
		render(<PollScreen {...props} />);

		expect(screen.getByText("what each poll paid")).toBeInTheDocument();
		expect(screen.queryByLabelText(/^Pallet/)).toBeNull();
	});

	it("leaves the explainer out when a call site has nothing to explain", () => {
		render(<PollScreen {...props} coverage={{ bar: props.coverage.bar }} />);

		expect(screen.queryByText("what each poll paid")).toBeNull();
		expect(screen.queryByText(/You have scored/)).toBeNull();
	});

	it("accounts for the answer just submitted, row by row", () => {
		render(
			<PollScreen
				{...props}
				coverage={{
					...props.coverage,
					breakdown: [
						{
							label: "right answer",
							detail: "base",
							figures: [{ label: "1" }],
						},
						{
							label: ".js",
							detail: "matches JavaScript",
							figures: [{ label: "×1.25" }],
						},
						{ label: "paid", figures: [{ label: "1.25" }], total: true },
					],
				}}
			/>
		);

		expect(screen.getByText("what this answer paid")).toBeInTheDocument();
		expect(screen.getByText("matches JavaScript")).toBeInTheDocument();
		expect(screen.getByText("right answer")).toBeInTheDocument();
		expect(screen.getByText("paid")).toBeInTheDocument();
	});

	it("keeps the receipt off the screen until an answer has landed", () => {
		render(<PollScreen {...props} />);

		expect(screen.queryByText("what this answer paid")).toBeNull();
	});

	it("states coverage exactly once, so no row says it again", () => {
		render(<PollScreen {...props} />);

		expect(screen.getAllByRole("img", { name: /needed/ })).toHaveLength(1);
	});

	it("carries no footer action until the poll asks for one", () => {
		render(<PollScreen {...props} />);

		expect(
			screen.queryByRole("button", { name: /Submit/ })
		).not.toBeInTheDocument();
	});

	it("submits a multi-answer poll from the footer once a pick exists", () => {
		render(
			<PollScreen
				{...props}
				question={createKantoQuestionProps({
					answerType: "multiple",
					pickedIds: ["option-1"],
				})}
				footer={{ action: { label: "Submit answer", onPress: () => {} } }}
			/>
		);

		expect(screen.getByRole("button", { name: /Submit answer/ })).toBeEnabled();
	});

	it("refuses the submit while nothing is picked", () => {
		render(
			<PollScreen
				{...props}
				question={createKantoQuestionProps({
					answerType: "multiple",
					pickedIds: [],
				})}
				footer={{
					action: { label: "Submit answer" },
					refusal: "pick an answer first",
				}}
			/>
		);

		expect(
			screen.getByRole("button", { name: /Submit answer/ })
		).toBeDisabled();
		expect(screen.getByText("pick an answer first")).toBeInTheDocument();
	});

	it("stands the footer above the build, under the poll", () => {
		const { container } = render(
			<PollScreen
				{...props}
				footer={{ action: { label: "Next poll", onPress: () => {} } }}
			/>
		);

		const body = container.querySelector("section > div");
		const order = Array.from(body?.children ?? []).map((child) =>
			child.tagName.toLowerCase()
		);

		expect(order).toEqual([
			"header",
			"section",
			"section",
			"section",
			"section",
			"footer",
		]);
	});

	it("pins the coverage bar where the answer landed", () => {
		const { container } = render(
			<PollScreen
				{...props}
				header={createKantoHeaderProps({
					bar: createKantoCoverageBarProps({ pin: true }),
				})}
			/>
		);

		expect(container.querySelector(".coverage-bar-pin")).toBeInTheDocument();
	});
});
