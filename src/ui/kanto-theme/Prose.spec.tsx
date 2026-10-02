import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Prose } from "./Prose.ui";

const SENTENCE =
	"Every correct answer pays +0.1 units of coverage. No other config multiplies it; only the gate's accuracy does.";
const FLAT = "save your last checkpoint once; each gate asks a higher price.";

describe("Prose", () => {
	it("states the whole sentence", () => {
		const { container } = render(<Prose text={SENTENCE} />);

		expect(container.textContent).toBe(SENTENCE);
	});

	it("badges a figure the sentence carries", () => {
		render(<Prose text={SENTENCE} />);

		expect(screen.getByText("+0.1")).toHaveClass("badge-theme");
	});

	it("lets the caller retone a gain for a sentence stating a term", () => {
		render(<Prose text="At ×2 now, deleted two clears on." gain="saffron" />);

		expect(screen.getByText("×2")).toHaveAttribute(
			"data-screen-theme",
			"saffron"
		);
	});

	it("gives a sentence with no figure the room it would get with one", () => {
		const { container: flat } = render(<Prose text={FLAT} />);
		const { container: figured } = render(<Prose text={SENTENCE} />);

		expect(flat.firstChild).toHaveClass("leading-relaxed");
		expect(figured.firstChild).toHaveClass("leading-relaxed");
	});

	it("reads at the muted rung so a heading above it stays the loudest thing", () => {
		const { container } = render(<Prose text={FLAT} />);

		expect(container.firstChild).toHaveClass("text-xs", "text-theme-muted");
		expect(container.firstChild).not.toHaveClass("text-theme-faint");
	});

	it("wraps in a paragraph by default", () => {
		const { container } = render(<Prose text={FLAT} />);

		expect(container.firstChild?.nodeName).toBe("P");
	});

	it("takes a span so it can sit inside a press", () => {
		const { container } = render(<Prose as="span" text={FLAT} />);

		expect(container.firstChild?.nodeName).toBe("SPAN");
		expect(container.firstChild).toHaveClass("leading-relaxed");
	});
});
