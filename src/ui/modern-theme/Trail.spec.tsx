import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Crumb, Trail } from "./Trail.ui";

const items = [
	{ id: "1", label: "1", state: "done" as const, verdict: "correct" as const },
	{ id: "2", label: "2", state: "done" as const, verdict: "partial" as const },
	{ id: "3", label: "3", state: "current" as const },
	{ id: "4", label: "4", state: "todo" as const },
	{ id: "5", label: "5", state: "todo" as const },
];

describe("Crumb", () => {
	it("marks only the current poll as the step the player is on", () => {
		render(
			<>
				<Crumb label="2" state="done" verdict="correct" />
				<Crumb label="3" state="current" />
			</>
		);

		expect(screen.getByText("3").closest("span")).toBeInTheDocument();
		expect(screen.getByText("2").parentElement).not.toHaveAttribute(
			"aria-current"
		);
	});

	it("colours the live crumb in the gate's own hue", () => {
		const { container } = render(<Crumb label="3" state="current" />);

		expect(container.firstChild).toHaveClass("text-theme");
	});
});

describe("Trail", () => {
	it("names itself for screen readers", () => {
		render(<Trail items={items} label="Polls in this gate" />);

		expect(
			screen.getByRole("navigation", { name: "Polls in this gate" })
		).toBeInTheDocument();
	});

	it("renders a separator between crumbs but not before the first", () => {
		render(<Trail items={items} label="Polls in this gate" />);

		expect(screen.getAllByText("›")).toHaveLength(items.length - 1);
	});

	it("flags the current poll with aria-current", () => {
		render(<Trail items={items} label="Polls in this gate" />);

		const current = screen
			.getByRole("navigation")
			.querySelector('[aria-current="step"]');

		expect(current).toHaveTextContent("3");
	});

	it("dots an answered crumb in its verdict", () => {
		const { container: correct } = render(
			<Crumb label="1" state="done" verdict="correct" />
		);
		const { container: partial } = render(
			<Crumb label="2" state="done" verdict="partial" />
		);
		const { container: wrong } = render(
			<Crumb label="3" state="done" verdict="wrong" />
		);

		expect(correct.querySelector("[aria-hidden]")).toHaveClass("bg-celadon");
		expect(partial.querySelector("[aria-hidden]")).toHaveClass("bg-saffron");
		expect(wrong.querySelector("[aria-hidden]")).toHaveClass("bg-cinnabar");
	});

	it("speaks the verdict, since a dot colour is not readable aloud", () => {
		render(<Crumb label="2" state="done" verdict="partial" />);

		expect(screen.getByText(/partly correct/)).toBeInTheDocument();
	});

	it("weights the live crumb, so a celadon gate cannot pass for a correct one", () => {
		const { container } = render(<Crumb label="3" state="current" />);

		expect(container.firstChild).toHaveClass("font-bold");
		expect(container.querySelector("[aria-hidden]")).toHaveClass("bg-theme");
	});

	it("leaves an unanswered crumb a plain dot, with no verdict to report", () => {
		const { container } = render(<Crumb label="4" state="todo" />);

		expect(container.querySelector("[aria-hidden]")).toHaveClass("bg-zinc-700");
		expect(screen.queryByText(/correct|wrong/)).not.toBeInTheDocument();
	});
});
