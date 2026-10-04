import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { REDACTED, Redaction } from "./Redaction.ui";

const LABEL = "Locked audit";

describe("Redaction", () => {
	it("stands question marks in for the withheld value", () => {
		const { container } = render(<Redaction />);

		expect(container.textContent).toBe(REDACTED);
	});

	it("hides the question marks from a screen reader", () => {
		const { container } = render(<Redaction />);

		expect(container.querySelector("[aria-hidden='true']")).toHaveTextContent(
			REDACTED
		);
	});

	it("names the withheld state for a screen reader when asked", () => {
		render(<Redaction label={LABEL} />);

		expect(screen.getByText(LABEL)).toHaveClass("sr-only");
	});

	it("stays silent when it is one of several fields on the same item", () => {
		const { container } = render(<Redaction />);

		expect(container.querySelector(".sr-only")).not.toBeInTheDocument();
	});

	it("reads as withheld rather than as content", () => {
		const { container } = render(<Redaction />);

		expect(container.firstElementChild).toHaveClass(
			"opacity-40",
			"select-none"
		);
	});

	it("names no colour of its own, so it takes the tone it stands in for", () => {
		const { container } = render(<Redaction />);

		expect(container.firstElementChild?.className).not.toMatch(/text-/);
	});

	it("withholds one item of a known-length list with a shorter token", () => {
		render(<Redaction short />);

		expect(screen.getByText("?")).toBeInTheDocument();
		expect(screen.queryByText("???")).not.toBeInTheDocument();
	});

	it("keeps the reader-only label on the short token too", () => {
		render(<Redaction short label="Locked category" />);

		expect(screen.getByText("Locked category")).toHaveClass("sr-only");
	});
});
