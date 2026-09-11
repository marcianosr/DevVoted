import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Trail } from "./Trail.ui";

const SEPARATOR_GLYPH = "·";

const separatorsIn = (container: HTMLElement) =>
	Array.from(container.querySelectorAll("[aria-hidden='true']")).filter(
		(node) => node.textContent === SEPARATOR_GLYPH
	);

describe("Trail", () => {
	it("shows one step per poll in the gate", () => {
		render(<Trail count={5} current={1} />);

		for (const step of ["1", "2", "3", "4", "5"]) {
			expect(screen.getByText(step)).toBeInTheDocument();
		}
	});

	it("puts a chevron on the poll being answered and marks it current", () => {
		render(<Trail count={5} current={1} />);

		expect(screen.getByText("❯")).toBeInTheDocument();
		expect(screen.getByText("1").parentElement).toHaveAttribute(
			"aria-current",
			"step"
		);
	});

	it("marks exactly one step as current", () => {
		const { container } = render(<Trail count={5} current={3} />);

		expect(container.querySelectorAll("[aria-current='step']")).toHaveLength(1);
	});

	it("dims the polls still to come, and brightens only the current one", () => {
		render(<Trail count={3} current={2} />);

		expect(screen.getByText("2")).toHaveClass("text-theme-faint");
		expect(screen.getByText("2")).not.toHaveClass("opacity-50");
		expect(screen.getByText("3")).toHaveClass("opacity-50");
	});

	it.each([
		["correct", "viridian"],
		["partial", "saffron"],
		["wrong", "cinnabar"],
	] as const)("badges a %s poll in %s", (verdict, color) => {
		render(<Trail count={2} current={2} verdicts={[verdict]} />);

		expect(screen.getByText("1")).toHaveAttribute("data-screen-theme", color);
	});

	it("names each answered poll's verdict for a screen reader", () => {
		render(<Trail count={3} current={3} verdicts={["correct", "wrong"]} />);

		expect(screen.getByText("correct")).toBeInTheDocument();
		expect(screen.getByText("wrong")).toBeInTheDocument();
	});

	it("drops the chevron off a poll that already has a verdict", () => {
		render(<Trail count={3} current={1} verdicts={["correct"]} />);

		expect(screen.queryByText("❯")).not.toBeInTheDocument();
	});

	it("shows no current step once every poll is answered", () => {
		const { container } = render(
			<Trail count={2} current={3} verdicts={["correct", "partial"]} />
		);

		expect(container.querySelectorAll("[aria-current='step']")).toHaveLength(0);
		expect(screen.queryByText("❯")).not.toBeInTheDocument();
	});

	it("separates the steps with a dot that screen readers skip", () => {
		const { container } = render(<Trail count={4} current={1} />);

		expect(separatorsIn(container)).toHaveLength(3);
	});

	it("drops the dot beside an answered poll, whose badge is already a box", () => {
		const { container } = render(
			<Trail count={5} current={3} verdicts={["correct", "wrong"]} />
		);

		expect(separatorsIn(container)).toHaveLength(2);
	});

	it("keeps no dot at all once every poll is answered", () => {
		const { container } = render(
			<Trail count={3} current={4} verdicts={["correct", "wrong", "partial"]} />
		);

		expect(separatorsIn(container)).toHaveLength(0);
	});

	it("names itself for a screen reader, and takes an override", () => {
		const { rerender } = render(<Trail count={2} current={1} />);

		expect(
			screen.getByRole("navigation", { name: "Polls in this gate" })
		).toBeInTheDocument();

		rerender(<Trail count={2} current={1} label="Polls at gate 4" />);

		expect(
			screen.getByRole("navigation", { name: "Polls at gate 4" })
		).toBeInTheDocument();
	});
});
