import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Title } from "./Title.component";

describe("Title", () => {
	it("renders its children as a level-1 heading by default", () => {
		render(<Title>Gate 3</Title>);
		expect(
			screen.getByRole("heading", { level: 1, name: "Gate 3" })
		).toBeInTheDocument();
	});

	it("renders the requested heading level", () => {
		render(<Title as="h2">Section</Title>);
		expect(
			screen.getByRole("heading", { level: 2, name: "Section" })
		).toBeInTheDocument();
	});

	it("uses the single flat title style", () => {
		render(<Title>Plain</Title>);
		expect(screen.getByRole("heading", { name: "Plain" })).toHaveClass(
			"text-md",
			"text-zinc-200",
			"tracking-tight"
		);
	});

	it("themes the heading in a category's color", () => {
		render(<Title category="js">JavaScript</Title>);
		const heading = screen.getByRole("heading", { name: "JavaScript" });
		expect(heading).toHaveAttribute("data-category-theme", "js");
		expect(heading).toHaveClass("text-theme");
		expect(heading).not.toHaveClass("text-zinc-200");
	});

	it("appends caller classes to the base style", () => {
		render(<Title className="text-cinnabar">Build broke!</Title>);
		const heading = screen.getByRole("heading", { name: "Build broke!" });
		expect(heading).toHaveClass("text-cinnabar");
		expect(heading).toHaveClass("tracking-tight");
	});
});
