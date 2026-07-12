import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { BuildSummary } from "./BuildSummary.ui";

describe("BuildSummary", () => {
	it("lists each demand", () => {
		render(
			<BuildSummary
				demands={["1 correct answer", "2 fast answers"]}
				rewardMultiplier={1}
			/>
		);
		expect(screen.getByText("• 1 correct answer")).toBeInTheDocument();
		expect(screen.getByText("• 2 fast answers")).toBeInTheDocument();
	});

	it("shows the reward multiplier only when it beats 1×", () => {
		const { rerender } = render(
			<BuildSummary demands={["1 correct answer"]} rewardMultiplier={2} />
		);
		expect(screen.getByText(/×2 storage/)).toBeInTheDocument();
		rerender(
			<BuildSummary demands={["1 correct answer"]} rewardMultiplier={1} />
		);
		expect(screen.queryByText(/storage/)).not.toBeInTheDocument();
	});
});
