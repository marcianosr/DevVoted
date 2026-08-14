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

	it("sizes each level a step apart, so the level announced matches the one seen", () => {
		render(
			<>
				<Title as="h1">Screen</Title>
				<Title as="h2">Section</Title>
				<Title as="h3">Group</Title>
			</>
		);
		expect(screen.getByRole("heading", { name: "Screen" })).toHaveClass(
			"text-lg"
		);
		expect(screen.getByRole("heading", { name: "Section" })).toHaveClass(
			"text-base"
		);
		expect(screen.getByRole("heading", { name: "Group" })).toHaveClass(
			"text-sm"
		);
	});

	it("shares Paragraph's default foreground rather than a gray of its own", () => {
		render(<Title>Plain</Title>);
		expect(screen.getByRole("heading", { name: "Plain" })).toHaveClass(
			"text-zinc-100",
			"font-semibold",
			"tracking-tight"
		);
	});

	it("colours the heading from the shared tone vocabulary", () => {
		render(<Title tone="cinnabar">Build broke!</Title>);
		expect(screen.getByRole("heading", { name: "Build broke!" })).toHaveClass(
			"text-cinnabar"
		);
	});

	it("appends caller classes to the base style", () => {
		render(<Title className="tracking-[0.3em]">Spaced</Title>);
		const heading = screen.getByRole("heading", { name: "Spaced" });
		expect(heading).toHaveClass("tracking-[0.3em]");
		expect(heading).toHaveClass("text-lg");
	});
});
