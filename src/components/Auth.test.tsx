import { describe, it, expect, vi } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import { Auth } from "./Auth";
import { renderWithProviders } from "../test/utils";

describe(Auth, () => {
	it("calls onSubmit when the form is submitted", () => {
		const mockSubmit = vi.fn();

		renderWithProviders(
			<Auth actionText="Submit" onSubmit={mockSubmit} status="idle" />
		);

		const form = screen
			.getByRole("button", { name: /submit/i })
			.closest("form");
		fireEvent.submit(form!);

		expect(mockSubmit).toHaveBeenCalledTimes(1);
	});

	it("displays loading state when status is pending", () => {
		const mockSubmit = vi.fn();

		renderWithProviders(
			<Auth actionText="Submit" onSubmit={mockSubmit} status="pending" />
		);

		const button = screen.getByRole("button");
		expect(button).toHaveTextContent("...");
		expect(button).toBeDisabled();
	});

	it("renders afterSubmit content when provided", () => {
		const mockSubmit = vi.fn();
		const afterSubmitText = "After submit content";

		renderWithProviders(
			<Auth
				actionText="Submit"
				onSubmit={mockSubmit}
				status="idle"
				afterSubmit={<div>{afterSubmitText}</div>}
			/>
		);

		expect(screen.getByText(afterSubmitText)).toBeInTheDocument();
	});
});
