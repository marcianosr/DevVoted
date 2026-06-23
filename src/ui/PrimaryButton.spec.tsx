import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PrimaryButton } from "./PrimaryButton.component";

describe("PrimaryButton", () => {
	it("renders children", () => {
		render(<PrimaryButton>Start Run</PrimaryButton>);
		expect(
			screen.getByRole("button", { name: "Start Run" })
		).toBeInTheDocument();
	});

	it("is disabled when disabled prop is set", () => {
		render(<PrimaryButton disabled>Start Run</PrimaryButton>);
		expect(screen.getByRole("button")).toBeDisabled();
	});

	it("is disabled when isLoading", () => {
		render(<PrimaryButton isLoading>Saving…</PrimaryButton>);
		expect(screen.getByRole("button")).toBeDisabled();
	});

	it("applies small size class", () => {
		render(<PrimaryButton size="small">Click</PrimaryButton>);
		expect(screen.getByRole("button")).toHaveClass("text-sm");
	});
});
