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

	it("themes the heading in a category's color", () => {
		render(<Title category="js">JavaScript</Title>);
		const heading = screen.getByRole("heading", { name: "JavaScript" });
		expect(heading).toHaveAttribute("data-category-theme", "js");
		expect(heading).toHaveClass("text-theme");
	});

	it("is zinc-100 when no category is given", () => {
		render(<Title>Plain</Title>);
		expect(screen.getByRole("heading", { name: "Plain" })).toHaveClass(
			"text-zinc-100"
		);
	});

	it("renders the gradient tone", () => {
		render(<Title tone="gradient">Gate #3 cleared!</Title>);
		expect(
			screen.getByRole("heading", { name: "Gate #3 cleared!" })
		).toHaveClass("text-gradient-green");
	});

	it("lets a category win over the gradient tone", () => {
		render(
			<Title category="js" tone="gradient">
				JavaScript
			</Title>
		);
		const heading = screen.getByRole("heading", { name: "JavaScript" });
		expect(heading).toHaveClass("text-theme");
		expect(heading).not.toHaveClass("text-gradient-green");
	});
});
