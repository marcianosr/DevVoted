import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { PollSubmitBar } from "./PollSubmitBar.ui";

const baseProps = {
	canSubmit: true,
	isSubmitting: false,
	submitted: false,
	onSubmit: vi.fn(),
};

describe(PollSubmitBar.name, () => {
	it("disables the button until an option is selected", () => {
		render(
			<PollSubmitBar
				{...baseProps}
				canSubmit={false}
				hint="Pick an option to continue."
			/>
		);
		expect(screen.getByRole("button")).toBeDisabled();
		expect(screen.getByText("Pick an option to continue.")).toBeInTheDocument();
	});

	it("enables submitting once an option is selected", () => {
		const onSubmit = vi.fn();
		render(<PollSubmitBar {...baseProps} onSubmit={onSubmit} />);
		const button = screen.getByRole("button");
		expect(button).toBeEnabled();
		fireEvent.click(button);
		expect(onSubmit).toHaveBeenCalledOnce();
	});

	it("shows a submitting label and blocks resubmission while pending", () => {
		render(<PollSubmitBar {...baseProps} isSubmitting={true} />);
		expect(screen.getByText("Submitting…")).toBeInTheDocument();
		expect(screen.getByRole("button")).toBeDisabled();
	});

	it("confirms submission once complete", () => {
		render(<PollSubmitBar {...baseProps} submitted={true} />);
		expect(screen.getByText("Submitted!")).toBeInTheDocument();
		expect(screen.getByRole("button")).toBeDisabled();
	});

	it("renders a submission error", () => {
		render(
			<PollSubmitBar {...baseProps} error="Please select at least one answer" />
		);
		expect(
			screen.getByText("Please select at least one answer")
		).toBeInTheDocument();
	});
});
