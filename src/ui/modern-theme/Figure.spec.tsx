import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Figure } from "./Figure.ui";

describe("Figure", () => {
	it("shows nothing for a config that leads with no number", () => {
		const { container } = render(<Figure />);

		expect(container).toBeEmptyDOMElement();
	});

	it("badges a rate as a multiplier", () => {
		render(<Figure figure={{ kind: "multiplier", value: 1.25 }} />);

		expect(screen.getByText("×1.25")).toBeInTheDocument();
	});

	it("badges a per-answer payout in KB", () => {
		render(<Figure figure={{ kind: "kb", value: 16 }} />);

		expect(screen.getByText("+16 KB")).toBeInTheDocument();
	});

	it("keeps a share of held storage marked as a percentage", () => {
		render(<Figure figure={{ kind: "percent", value: 2 }} />);

		expect(screen.getByText("+2%")).toBeInTheDocument();
	});

	// Nothing is gained or lost, so it wears neither a sign nor a gain colour.
	it("states odds plainly rather than as a signed gain", () => {
		render(<Figure figure={{ kind: "chance", oneIn: 3 }} />);

		const odds = screen.getByText("1 in 3");
		expect(odds).toBeInTheDocument();
		expect(odds.parentElement).not.toHaveClass("bg-celadon/15");
	});
});
