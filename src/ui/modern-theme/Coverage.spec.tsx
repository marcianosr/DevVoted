import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Coverage } from "./Coverage.ui";

describe("Coverage", () => {
	it("puts held against required in the summary, so a shut fold still answers", () => {
		render(
			<Coverage
				held={38.6}
				projected={23.1}
				required={60}
				defaultOpen={false}
			/>
		);

		expect(screen.getByText("38.6% / 60%")).toBeInTheDocument();
	});

	it("names the projection as a gain and the demand as a floor", () => {
		render(<Coverage held={38.6} projected={23.1} required={60} />);

		expect(screen.getByText("+23.1% projected")).toBeInTheDocument();
		expect(screen.getByText("60% required")).toBeInTheDocument();
	});

	it("scales the bar against the demand, so a small goal still fills the track", () => {
		render(<Coverage held={0} projected={1} required={3} />);

		expect(screen.getByRole("progressbar")).toHaveAttribute(
			"aria-valuemax",
			"3"
		);
	});

	it("keeps its notes at the same size as every other fold body", () => {
		render(<Coverage held={38.6} projected={23.1} required={60} />);

		expect(screen.getByText("+23.1% projected")).toHaveClass("text-xs");
		expect(screen.getByText("60% required")).toHaveClass("text-xs");
	});
});
