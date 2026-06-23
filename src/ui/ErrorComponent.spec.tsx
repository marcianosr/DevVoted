import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ErrorComponent } from "./ErrorComponent.component";

describe("ErrorComponent", () => {
	it("renders the error text", () => {
		render(<ErrorComponent text="Something went wrong." />);
		expect(screen.getByText("Something went wrong.")).toBeInTheDocument();
	});

	it("renders a heading", () => {
		render(<ErrorComponent text="Poll not found." />);
		expect(
			screen.getByRole("heading", { name: "Poll not found." })
		).toBeInTheDocument();
	});
});
