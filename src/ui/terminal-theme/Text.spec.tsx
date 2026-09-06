import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Text } from "./Text.ui";

const classesOf = (label: string) =>
	Array.from(screen.getByText(label).classList);

describe("Text", () => {
	it("renders a span by default", () => {
		render(<Text>Unit Tests</Text>);

		expect(screen.getByText("Unit Tests").tagName).toBe("SPAN");
	});

	it("renders the tag it is given", () => {
		render(
			<Text as="h1" size="hero">
				Gate 4
			</Text>
		);

		expect(screen.getByRole("heading", { name: "Gate 4" })).toBeInTheDocument();
	});

	it("paints the tone it is given", () => {
		render(<Text tone="cinnabar">6.7</Text>);

		expect(screen.getByText("6.7")).toHaveClass("text-cinnabar");
	});

	it("emits no font weight when weight is omitted", () => {
		render(<Text tone="muted">wrong costs</Text>);

		expect(classesOf("wrong costs")).not.toContainEqual(
			expect.stringMatching(/^font-/)
		);
	});

	it("thins to the one weight the loaded faces provide", () => {
		render(
			<Text tone="muted" weight="thin">
				scores
			</Text>
		);

		expect(screen.getByText("scores")).toHaveClass("font-normal");
	});

	it("lets a caller's font weight win when no weight is set", () => {
		render(<Text className="font-bold">Storage</Text>);

		expect(classesOf("Storage")).toEqual([
			"tabular-nums",
			"text-sm",
			"text-zinc-100",
			"font-bold",
		]);
	});

	it("keeps a caller's className alongside its own", () => {
		render(<Text className="truncate">Garbage Collection</Text>);

		expect(screen.getByText("Garbage Collection")).toHaveClass(
			"truncate",
			"text-sm"
		);
	});

	it("hides a decorative glyph from the accessibility tree", () => {
		render(
			<Text tone="faint" size="caption" aria-hidden>
				·
			</Text>
		);

		expect(screen.getByText("·")).toHaveAttribute("aria-hidden", "true");
	});

	it("leaves the accessibility tree alone when aria-hidden is not asked for", () => {
		render(<Text tone="faint">3 options</Text>);

		expect(screen.getByText("3 options")).not.toHaveAttribute("aria-hidden");
	});
});
