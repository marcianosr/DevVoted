import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Audit } from "./Audit.ui";

const LEAK = {
	code: 507,
	name: "Insufficient Storage",
	cue: "leaking 16 KB a poll · 32 KB on a miss",
} as const;

describe("Audit", () => {
	it("shows the status code, its name and what it costs you", () => {
		render(<Audit {...LEAK} />);

		expect(screen.getByText("507")).toBeInTheDocument();
		expect(screen.getByText("Insufficient Storage")).toBeInTheDocument();
		expect(screen.getByText(LEAK.cue)).toBeInTheDocument();
	});

	it("sets its own saffron theme rather than inheriting the screen's", () => {
		const { container } = render(<Audit {...LEAK} />);

		expect(container.firstChild).toHaveAttribute(
			"data-screen-theme",
			"saffron"
		);
	});

	it("runs the code panel the full height of the box", () => {
		const { container } = render(<Audit {...LEAK} />);

		expect(container.firstChild).toHaveClass("items-stretch");
		expect(screen.getByText("507")).toHaveClass("bg-theme-raised");
	});

	it("clips the code panel's fill to the rounded corners", () => {
		const { container } = render(<Audit {...LEAK} />);

		expect(container.firstChild).toHaveClass("overflow-hidden", "rounded-lg");
	});

	it("draws a faint themed edge rather than a hard one", () => {
		const { container } = render(<Audit {...LEAK} />);

		expect(container.firstChild).toHaveClass("border", "border-theme-faint");
	});

	it("quiets the cue below the name", () => {
		render(<Audit {...LEAK} />);

		expect(screen.getByText("Insufficient Storage")).not.toHaveClass(
			"opacity-60"
		);
		expect(screen.getByText(LEAK.cue)).toHaveClass("opacity-60");
	});

	it("stays as wide as its contents, so two can sit side by side", () => {
		const { container } = render(<Audit {...LEAK} />);

		expect(container.firstChild).toHaveClass("w-fit");
	});

	it("takes a cue naming the config an outage took out", () => {
		render(
			<Audit
				code={424}
				name="Failed Dependency"
				cue="Intellisense is out this attempt"
			/>
		);

		expect(
			screen.getByText("Intellisense is out this attempt")
		).toBeInTheDocument();
	});
});

describe("Audit when locked", () => {
	it("leaks no digit of the status code", () => {
		const { container } = render(<Audit locked />);

		expect(container.textContent).not.toMatch(/\d/);
	});

	it("withholds the code, the name and the cue alike", () => {
		const { container } = render(<Audit locked />);

		expect(container.querySelectorAll("[aria-hidden='true']")).toHaveLength(3);
	});

	it("keeps its saffron theme, since a hazard is a hazard either way", () => {
		const { container } = render(<Audit locked />);

		expect(container.firstChild).toHaveAttribute(
			"data-screen-theme",
			"saffron"
		);
	});

	it("names the locked state once, not once per withheld field", () => {
		const { container } = render(<Audit locked />);

		expect(container.querySelectorAll(".sr-only")).toHaveLength(1);
		expect(screen.getByText("Locked audit")).toBeInTheDocument();
	});

	it("keeps the released box's shape, so a roster still lines up", () => {
		const { container } = render(<Audit locked />);

		expect(container.firstChild).toHaveClass(
			"w-fit",
			"items-stretch",
			"border-theme-faint"
		);
	});

	it("sizes to its own cue by default", () => {
		const { container } = render(<Audit {...LEAK} />);

		expect(container.firstElementChild).toHaveClass("w-fit");
	});

	it("fills the column when the screen stacks it", () => {
		const { container } = render(<Audit {...LEAK} layout="full" />);

		expect(container.firstElementChild).toHaveClass("w-full");
		expect(container.firstElementChild).not.toHaveClass("w-fit");
	});
	describe("as a row", () => {
		it("still shows the code, the name and the cue", () => {
			render(<Audit {...LEAK} layout="row" />);

			expect(screen.getByText("507")).toBeInTheDocument();
			expect(screen.getByText("Insufficient Storage")).toBeInTheDocument();
			expect(screen.getByText(LEAK.cue)).toBeInTheDocument();
		});

		it("sheds the card's border and fills the panel it sits in", () => {
			const { container } = render(<Audit {...LEAK} layout="row" />);

			expect(container.firstElementChild).toHaveClass("w-full");
			expect(container.firstElementChild).not.toHaveClass("border");
		});

		it("keeps the cue flush left wherever it lands", () => {
			render(<Audit {...LEAK} layout="row" />);

			expect(screen.getByText(LEAK.cue)).not.toHaveClass(
				"ml-auto",
				"text-right"
			);
		});

		it("keeps the audit hue, so the code and the name still read as one", () => {
			const { container } = render(<Audit {...LEAK} layout="row" />);

			expect(container.firstElementChild).toHaveAttribute(
				"data-screen-theme",
				"saffron"
			);
		});

		it("withholds every field of a locked audit, row or card", () => {
			render(<Audit locked layout="row" />);

			expect(screen.getAllByText("???")).toHaveLength(3);
		});
	});
});
