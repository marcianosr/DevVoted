import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";

import { Dot } from "./Dot.ui";

describe("Dot", () => {
	it("is hidden from assistive tech, the row's own words carrying the state", () => {
		const { container } = render(<Dot tone="celadon" />);

		expect(container.firstChild).toHaveAttribute("aria-hidden");
	});

	it("fills in the tone it was asked for", () => {
		const { container: online } = render(<Dot tone="celadon" />);
		const { container: offline } = render(<Dot tone="cinnabar" />);

		expect(online.firstChild).toHaveClass("bg-celadon");
		expect(offline.firstChild).toHaveClass("bg-cinnabar");
	});

	it("rings instead of filling when the state is only installed", () => {
		const { container } = render(<Dot tone="muted" hollow />);

		expect(container.firstChild).toHaveClass("border", "border-zinc-600");
		expect(container.firstChild).not.toHaveClass("bg-zinc-700");
	});

	it("is round unless asked for a box, which keys a chip", () => {
		const { container: disc } = render(<Dot tone="saffron" />);
		const { container: box } = render(<Dot tone="saffron" shape="box" />);

		expect(disc.firstChild).toHaveClass("rounded-full");
		expect(box.firstChild).toHaveClass("rounded-xs");
		expect(box.firstChild).not.toHaveClass("rounded-full");
	});

	it("speaks only in status tones, never in a grade", () => {
		const { container } = render(<Dot tone="theme" />);

		expect(container.firstChild?.textContent).toBe("");
		expect((container.firstChild as HTMLElement).className).not.toMatch(
			/cerulean|viridian|legendary/
		);
	});
});
