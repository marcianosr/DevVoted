import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SecondaryButton } from "./SecondaryButton.component";

describe("SecondaryButton", () => {
	it("renders children", () => {
		render(<SecondaryButton>Cancel</SecondaryButton>);
		expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
	});

	it("is disabled when disabled prop is set", () => {
		render(<SecondaryButton disabled>Cancel</SecondaryButton>);
		expect(screen.getByRole("button")).toBeDisabled();
	});

	it("is disabled when isLoading", () => {
		render(<SecondaryButton isLoading>Saving…</SecondaryButton>);
		expect(screen.getByRole("button")).toBeDisabled();
	});

	it("applies danger variant styles", () => {
		render(<SecondaryButton variant="danger">Delete</SecondaryButton>);
		expect(screen.getByRole("button")).toHaveClass("border-red-500");
	});
});
