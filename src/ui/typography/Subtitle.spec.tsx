import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Subtitle } from "./Subtitle.component";

describe("Subtitle", () => {
	it("renders its children", () => {
		render(<Subtitle>Lead text</Subtitle>);
		expect(screen.getByText("Lead text")).toBeInTheDocument();
	});

	it("uses the bold muted subtitle style", () => {
		render(<Subtitle>Lead</Subtitle>);
		expect(screen.getByText("Lead")).toHaveClass(
			"text-sm",
			"font-bold",
			"text-zinc-300"
		);
	});
});
