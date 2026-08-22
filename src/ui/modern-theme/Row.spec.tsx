import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Row } from "./Row.ui";

describe("Row", () => {
	it("renders leading, content and trailing together", () => {
		render(
			<Row leading={<span>mark</span>} trailing={<span>+16</span>}>
				IndexedDB
			</Row>
		);

		expect(screen.getByText("mark")).toBeInTheDocument();
		expect(screen.getByText("IndexedDB")).toBeInTheDocument();
		expect(screen.getByText("+16")).toBeInTheDocument();
	});

	it("omits the trailing slot when there is nothing to put in it", () => {
		const { container } = render(<Row>IndexedDB</Row>);

		expect(container.querySelectorAll("span")).toHaveLength(1);
	});

	it("fades a dimmed row", () => {
		render(<Row dimmed>Freemium</Row>);

		expect(screen.getByText("Freemium").closest("div")).toHaveClass(
			"opacity-50"
		);
	});

	it("renders as the tag it is given, so a fold can use it as its summary", () => {
		const { container } = render(<Row as="summary">Pipeline</Row>);

		expect(container.querySelector("summary")).toBeInTheDocument();
	});

	it("pads a spacious row more than a tight one", () => {
		const { container: tight } = render(<Row spacing="tight">a</Row>);
		const { container: spacious } = render(<Row spacing="spacious">b</Row>);

		expect(tight.firstChild).toHaveClass("py-1");
		expect(spacious.firstChild).toHaveClass("py-4");
	});
});
