import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PipelineFailureScreen } from "./PipelineFailureScreen.ui";

const baseProps = {
	pipelineSlot: <div>CI Pipelines layout</div>,
	runSummary: {
		pollsAnswered: 18,
		pollsCorrect: 13,
		totalCoverage: 42,
		bestStreak: 5,
		shopRebuilds: 3,
	},
	categoryCoverage: [
		{
			categoryCode: "js",
			categoryName: "JavaScript",
			coverage: 44,
			bestStreak: 5,
			pollsCorrect: 6,
			pollsAnswered: 8,
		},
		{
			categoryCode: "css",
			categoryName: "Banjo-Kazooie",
			coverage: 30,
			bestStreak: 3,
			pollsCorrect: 4,
			pollsAnswered: 6,
		},
	],
};

describe(PipelineFailureScreen.name, () => {
	it("announces the pipeline failure", () => {
		render(<PipelineFailureScreen {...baseProps} />);
		expect(
			screen.getByRole("heading", { name: /Pipeline failed/ })
		).toBeInTheDocument();
	});

	it("renders the pipeline layout passed in", () => {
		render(<PipelineFailureScreen {...baseProps} />);
		expect(screen.getByText("CI Pipelines layout")).toBeInTheDocument();
	});

	it("shows the run summary", () => {
		render(<PipelineFailureScreen {...baseProps} />);
		expect(screen.getByText("Polls answered")).toBeInTheDocument();
		expect(screen.getByText("18")).toBeInTheDocument();
		expect(screen.getByText("42%")).toBeInTheDocument();
	});

	it("shows coverage per category", () => {
		render(<PipelineFailureScreen {...baseProps} />);
		expect(screen.getByText("JavaScript")).toBeInTheDocument();
		expect(screen.getByText("Banjo-Kazooie")).toBeInTheDocument();
	});
});
