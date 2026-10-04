import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";

import userEvent from "@testing-library/user-event";

import {
	SCORING_TITLE,
	Scoring,
	type ScoringProps,
	type ScoringTone,
} from "./Scoring.ui";

const step = (figure: string, coverage: string, tone: ScoringTone) => ({
	figure,
	coverage,
	tone,
});

const props: ScoringProps = {
	gains: [
		{
			label: "Single choice",
			steps: [step("0", "+0%", "none"), step("1", "+20%", "full")],
		},
		{
			label: "Multiple choice up to",
			steps: [
				step("0", "+0%", "none"),
				step("0.5", "+10%", "partial"),
				step("1", "+20%", "partial"),
				step("1.5", "+30%", "partial"),
				step("2", "+40%", "full"),
			],
		},
	],
	accuracy: { label: "Accuracy Bonus", figure: "up to ×1.08" },
};

const BADGE = ".badge-theme";

const rowOf = (label: string) =>
	within(screen.getByText(label).parentElement as HTMLElement);

const stepsOf = (label: string): HTMLElement[] => [
	...(screen
		.getByText(label)
		.parentElement?.querySelectorAll<HTMLElement>(BADGE) ?? []),
];

const pressOf = (label: string) => rowOf(label).getByRole("button");

describe("Scoring", () => {
	it("draws the accuracy track under the rows when prep hands it one", () => {
		render(
			<Scoring
				{...props}
				track={{
					label: "Accuracy ×1, up to ×1.08",
					figure: "×1 · up to ×1.08",
					sure: 0,
					best: 0.08,
				}}
			/>
		);

		expect(
			screen.getByRole("img", { name: "Accuracy ×1, up to ×1.08" })
		).toBeInTheDocument();
	});

	it("draws no accuracy track without one", () => {
		render(<Scoring {...props} />);

		expect(screen.queryByRole("img")).not.toBeInTheDocument();
	});

	it("heads an open panel with its own name, no fold to press", () => {
		const { container } = render(<Scoring {...props} />);

		expect(
			screen.getByRole("heading", { name: SCORING_TITLE })
		).toBeInTheDocument();
		expect(container.querySelector("details")).toBeNull();
	});

	it("states each step in units while the row rests", () => {
		render(<Scoring {...props} />);

		expect(rowOf("Single choice").getByText("1")).not.toHaveClass("hidden");
		expect(rowOf("Single choice").getByText("+20%")).toHaveClass("hidden");
	});

	it("reads every step of a row as coverage on hover", () => {
		render(<Scoring {...props} />);

		expect(rowOf("Multiple choice up to").getByText("2")).toHaveClass(
			"group-hover/steps:hidden"
		);
		expect(rowOf("Multiple choice up to").getByText("+40%")).toHaveClass(
			"group-hover/steps:inline"
		);
	});

	it("holds the coverage on a tap and returns to units on the next", async () => {
		render(<Scoring {...props} />);

		await userEvent.click(pressOf("Single choice"));

		expect(pressOf("Single choice")).toHaveAttribute("aria-pressed", "true");
		expect(rowOf("Single choice").getByText("+20%")).not.toHaveClass("hidden");
		expect(rowOf("Single choice").getByText("1")).toHaveClass("hidden");

		await userEvent.click(pressOf("Single choice"));

		expect(rowOf("Single choice").getByText("1")).not.toHaveClass("hidden");
	});

	it("steps a single, nothing or a unit, red then green", () => {
		render(<Scoring {...props} />);

		const steps = stepsOf("Single choice");

		expect(steps).toHaveLength(2);
		expect(steps[0]).toHaveAttribute("data-screen-theme", "cinnabar");
		expect(steps[1]).toHaveAttribute("data-screen-theme", "viridian");
	});

	it("steps a multiple by share, the partial steps in saffron", () => {
		render(<Scoring {...props} />);

		const steps = stepsOf("Multiple choice up to");

		expect(steps).toHaveLength(5);
		expect(steps[2]).toHaveAttribute("data-screen-theme", "saffron");
		expect(steps[4]).toHaveAttribute("data-screen-theme", "viridian");
	});

	it("states no separate answer-price rows", () => {
		render(<Scoring {...props} />);

		expect(screen.queryByText("single answer")).toBeNull();
		expect(screen.queryByText("multiple answers")).toBeNull();
	});

	it("closes on the accuracy bonus, with no steps of its own", () => {
		render(<Scoring {...props} />);

		const accuracy = rowOf("Accuracy Bonus");

		expect(accuracy.getByText("up to ×1.08")).toHaveClass("badge-theme");
		expect(accuracy.getAllByText(/./, { selector: BADGE })).toHaveLength(1);
	});
});
