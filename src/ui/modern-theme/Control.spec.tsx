import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Control } from "./Control.ui";

describe("Control", () => {
	it("states the offer and carries the tag that buys it", () => {
		render(
			<Control icon="extend" action={<button>extend · 48</button>}>
				a 6th offer, this shop and every shop after
			</Control>
		);

		expect(screen.getByText(/a 6th offer/)).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "extend · 48" })
		).toBeInTheDocument();
	});

	it("names itself and its terms when the offer needs more than a sentence", () => {
		render(
			<Control
				icon="tag"
				title="git tag"
				note="for your next run · one per run"
				footnote="Price rises 64 KB per gate."
				action={<button>128 KB</button>}
			>
				If this run dies, the next one checks out at gate 4.
			</Control>
		);

		expect(screen.getByText("git tag")).toBeInTheDocument();
		expect(screen.getByText("for your next run · one per run")).toHaveClass(
			"text-zinc-500"
		);
		expect(screen.getByText("Price rises 64 KB per gate.")).toHaveClass(
			"text-xxs"
		);
	});

	it("draws a dashed frame for something the run does not have yet", () => {
		const { container } = render(
			<Control icon="extend" frame="dashed" action={<span />}>
				a 6th offer
			</Control>
		);

		expect(container.firstChild).toHaveClass("border-dashed");
	});

	it("folds a titled control, so its terms are behind the name not in front", () => {
		const { container } = render(
			<Control icon="tag" title="git tag" action={<span />}>
				If this run dies, the next one checks out at gate 4.
			</Control>
		);

		expect(container.querySelector("details")).not.toHaveAttribute("open");
		expect(screen.getByText("git tag")).toBeInTheDocument();
	});

	it("opens on request, for a control whose terms should lead", () => {
		const { container } = render(
			<Control icon="tag" title="git tag" action={<span />} defaultOpen>
				If this run dies, the next one checks out at gate 4.
			</Control>
		);

		expect(container.querySelector("details")).toHaveAttribute("open");
	});

	it("leaves an untitled control unfolded, since the sentence is the offer", () => {
		const { container } = render(
			<Control icon="extend" frame="dashed" action={<span />}>
				a 6th offer
			</Control>
		);

		expect(container.querySelector("details")).not.toBeInTheDocument();
		expect(screen.getByText("a 6th offer")).toBeInTheDocument();
	});

	it("draws a solid frame for something it can simply buy", () => {
		const { container } = render(
			<Control icon="tag" action={<span />}>
				a checkpoint
			</Control>
		);

		expect(container.firstChild).not.toHaveClass("border-dashed");
	});

	it("keeps its glyph out of the reading order", () => {
		const { container } = render(
			<Control icon="tag" action={<span />}>
				a checkpoint
			</Control>
		);

		expect(container.querySelector("svg")).toHaveAttribute("aria-hidden");
	});
});
