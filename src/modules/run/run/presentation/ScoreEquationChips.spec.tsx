import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { ScoreEquationChips } from "./ScoreEquationChips.ui";

describe("ScoreEquationChips difficulty tooltip", () => {
	const baseProps = {
		isCorrect: true,
		baseCoverage: 1.5,
		bonuses: [{ label: "streak", value: 0.3 }],
		earnedCoverage: 1.8,
	};

	it("explains the boost on the correct chip for a harder-than-baseline poll", () => {
		render(
			<ScoreEquationChips
				{...baseProps}
				difficulty={{ multiplier: 1.6, optionCount: 4, isMultiple: true }}
			/>
		);
		const tooltip = screen.getByRole("tooltip");
		expect(tooltip).toHaveTextContent("4 options");
		expect(tooltip).toHaveTextContent("multiple-choice");
		expect(tooltip).toHaveTextContent("×1.6");
	});

	it("drops the multiple-choice note for a single-choice poll", () => {
		render(
			<ScoreEquationChips
				{...baseProps}
				difficulty={{ multiplier: 1.5, optionCount: 8, isMultiple: false }}
			/>
		);
		const tooltip = screen.getByRole("tooltip");
		expect(tooltip).toHaveTextContent("8 options");
		expect(tooltip).not.toHaveTextContent("multiple-choice");
	});

	it("shows no tooltip for a baseline poll (no difficulty)", () => {
		render(<ScoreEquationChips {...baseProps} />);
		expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
	});

	it("never explains difficulty on a miss (negative base)", () => {
		render(
			<ScoreEquationChips
				isCorrect={false}
				baseCoverage={-0.5}
				bonuses={[{ label: "streak", value: 0.3 }]}
				earnedCoverage={-0.2}
				difficulty={{ multiplier: 1.6, optionCount: 4, isMultiple: true }}
			/>
		);
		expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
	});
});
