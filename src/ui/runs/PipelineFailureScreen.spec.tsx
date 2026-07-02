import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { PipelineFailureScreen } from "./PipelineFailureScreen.ui";
import type { FailedSlotSummary } from "./PipelineFailureScreen.ui";

const failedSlots: FailedSlotSummary[] = [
	{
		label: "Category Mastery · critical",
		requirement: "all Banjo-Kazooie polls correct",
	},
];

const baseProps = {
	failedSlots,
	onStartNewRun: vi.fn(),
	onViewSummary: vi.fn(),
};

describe(PipelineFailureScreen.name, () => {
	it("announces the pipeline failure", () => {
		render(<PipelineFailureScreen {...baseProps} />);
		expect(
			screen.getByRole("heading", { name: /Pipeline failed/ })
		).toBeInTheDocument();
	});

	it("lists each failed requirement", () => {
		render(<PipelineFailureScreen {...baseProps} />);
		expect(
			screen.getByText(/all Banjo-Kazooie polls correct/)
		).toBeInTheDocument();
	});

	it("falls back to a message when no failing requirements are recorded", () => {
		render(<PipelineFailureScreen {...baseProps} failedSlots={[]} />);
		expect(
			screen.getByText("No failing requirements recorded.")
		).toBeInTheDocument();
	});

	it("starts a new run when the primary action is clicked", () => {
		const onStartNewRun = vi.fn();
		render(
			<PipelineFailureScreen {...baseProps} onStartNewRun={onStartNewRun} />
		);
		fireEvent.click(screen.getByRole("button", { name: /Start new run/ }));
		expect(onStartNewRun).toHaveBeenCalledOnce();
	});
});
