import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect } from "vitest";
import userEvent from "@testing-library/user-event";

import { Shop } from "./Shop";
describe(Shop, () => {
	it("renders the shop", () => {
		const mockOnSubmit = vi.fn();

		render(<Shop onSubmit={mockOnSubmit} />);

		expect(screen.getByText("Config Shop")).toBeInTheDocument();
	});

	it("calls on close when clicking on cancel", async () => {
		const mockOnClose = vi.fn();

		render(<Shop onCancel={mockOnClose} onSubmit={vi.fn()} />);

		await userEvent.click(screen.getByText("Cancel"));

		expect(mockOnClose).toBeCalled();
	});
});
