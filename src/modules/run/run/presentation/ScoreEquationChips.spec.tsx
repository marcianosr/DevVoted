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

	it("explains the correct chip on a multiple-choice poll, in both rates", () => {
		render(
			<ScoreEquationChips {...baseProps} difficulty={{ gain: 8, base: 5 }} />
		);
		const tooltip = screen.getByRole("tooltip");
		expect(tooltip).toHaveTextContent("Multiple-choice");
		expect(tooltip).toHaveTextContent("8%");
		expect(tooltip).toHaveTextContent("5%");
	});

	it("shows no tooltip for a single-choice poll (no difficulty)", () => {
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
				difficulty={{ gain: 8, base: 5 }}
			/>
		);
		expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
	});
});
