import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Subtitle } from "./Subtitle.component";

describe("Subtitle", () => {
	it("renders its children as a level-2 heading by default", () => {
		render(<Subtitle>Lead text</Subtitle>);
		expect(
			screen.getByRole("heading", { level: 2, name: "Lead text" })
		).toBeInTheDocument();
	});

	it("renders a plain paragraph when asked", () => {
		render(<Subtitle as="p">Label</Subtitle>);
		expect(screen.queryByRole("heading")).not.toBeInTheDocument();
		expect(screen.getByText("Label")).toBeInTheDocument();
	});

	it("uses the muted subtitle style", () => {
		render(<Subtitle>Lead</Subtitle>);
		expect(screen.getByText("Lead")).toHaveClass(
			"text-xs",
			"text-pewter",
			"font-medium",
			"tracking-tight"
		);
	});

	it("takes a tone from the shared vocabulary when the caption carries meaning", () => {
		render(<Subtitle tone="cinnabar">Build broke</Subtitle>);
		expect(screen.getByText("Build broke")).toHaveClass("text-cinnabar");
	});
});
