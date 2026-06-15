import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TextButton } from "./TextButton.component";

describe("TextButton", () => {
	it("renders children wrapped in brackets", () => {
		render(<TextButton>View details</TextButton>);
		expect(
			screen.getByRole("button", { name: "[ View details ]" })
		).toBeInTheDocument();
	});

	it("is disabled when disabled prop is set", () => {
		render(<TextButton disabled>Locked</TextButton>);
		expect(screen.getByRole("button")).toBeDisabled();
	});

	it("applies success variant styles by default", () => {
		render(<TextButton>Action</TextButton>);
		expect(screen.getByRole("button")).toHaveClass("text-green-500");
	});

	it("applies danger variant styles", () => {
		render(<TextButton variant="danger">Remove</TextButton>);
		expect(screen.getByRole("button")).toHaveClass("text-red-500");
	});
});
