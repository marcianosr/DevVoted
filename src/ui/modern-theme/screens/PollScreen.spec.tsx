import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Token } from "../Code.ui";
import { Fold } from "../Fold.ui";
import { PollScreen, type PollScreenProps } from "./PollScreen.ui";

const onChange = vi.fn();

const props: PollScreenProps = {
	theme: "lavender",
	gate: { title: "Gate 4 · Lavender" },
	trailLabel: "Polls in this gate",
	trail: [
		{ id: "1", label: "1", state: "done", verdict: "correct" },
		{ id: "2", label: "2", state: "done", verdict: "correct" },
		{ id: "3", label: "3", state: "current" },
		{ id: "4", label: "4", state: "todo" },
		{ id: "5", label: "5", state: "todo" },
	],
	question: (
		<>
			which line lifts the final two from <Token tone="theme">arr</Token>?
		</>
	),
	meta: ["lift-the-final-two", "typescript"],
	code: ["const arr = [];"],
	options: [
		{
			id: "slice",
			name: "answer",
			label: "arr.slice(-2)",
			checked: false,
			onChange,
		},
		{
			id: "splice",
			name: "answer",
			label: "arr.splice(2)",
			checked: false,
			blocked: true,
			note: "blocked · ESLint",
			onChange,
		},
	],
	rail: <Fold title="Pipeline" value="−128 KB" />,
};

const wholeQuestion = (_: string, element: Element | null) =>
	element?.textContent === "which line lifts the final two from arr?";

describe("PollScreen", () => {
	it("renders the question with its highlighted identifier intact", () => {
		render(<PollScreen {...props} />);

		expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
			"which line lifts the final two from arr?"
		);
		expect(screen.getAllByText(wholeQuestion).length).toBeGreaterThan(0);
	});

	it("puts the gate, the trail and the rail on one screen with the question", () => {
		render(<PollScreen {...props} />);

		expect(
			screen.getByRole("heading", { name: "Gate 4 · Lavender" })
		).toBeInTheDocument();
		expect(
			screen.getByRole("navigation", { name: "Polls in this gate" })
		).toBeInTheDocument();
		expect(screen.getByText("Pipeline")).toBeInTheDocument();
		expect(screen.getByText("const arr = [];")).toBeInTheDocument();
	});

	it("renders one answer per option", () => {
		render(<PollScreen {...props} />);

		expect(screen.getAllByRole("radio")).toHaveLength(2);
	});

	it("letters the options in the order they are offered", () => {
		render(<PollScreen {...props} />);

		expect(screen.getByText("A")).toBeInTheDocument();
		expect(screen.getByText("B")).toBeInTheDocument();
	});

	it("strikes out and disables the answer a config blocked", () => {
		render(<PollScreen {...props} />);

		expect(
			screen.getByRole("radio", { name: "B arr.splice(2) blocked · ESLint" })
		).toBeDisabled();
		expect(screen.getByText("arr.splice(2)")).toHaveClass("line-through");
		expect(screen.getByText("blocked · ESLint")).toBeInTheDocument();
	});

	it("reports a picked answer to the caller", async () => {
		render(<PollScreen {...props} />);

		await userEvent.click(screen.getByText("arr.slice(-2)"));

		expect(onChange).toHaveBeenCalledWith(true);
	});

	it("wears the gate theme, so every accent on the screen follows one attribute", () => {
		const { container } = render(<PollScreen {...props} />);

		expect(container.firstChild).toHaveAttribute("data-gate-theme", "lavender");
	});

	it("drops the rail entirely when the run has nothing to show beside the poll", () => {
		const { container } = render(<PollScreen {...props} rail={undefined} />);

		expect(container.querySelector("aside")).not.toBeInTheDocument();
	});

	it("orders the rail after the question in the DOM, so a narrow screen reads question-first", () => {
		const { container } = render(<PollScreen {...props} />);

		expect(container.querySelector("aside")).toHaveClass("lg:order-first");
	});

	it("sits on ground tinted by the gate it belongs to", () => {
		const { container } = render(<PollScreen {...props} />);

		expect(container.firstElementChild).toHaveClass("bg-theme-faint");
	});
});
