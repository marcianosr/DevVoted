import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Row } from "./Row.ui";

describe("Row", () => {
	it("steps its padding through three sizes", () => {
		const { container } = render(
			<>
				<Row spacing="tight">a</Row>
				<Row spacing="compact">b</Row>
				<Row spacing="spacious">c</Row>
			</>
		);

		const [tight, compact, spacious] = Array.from(container.children);
		expect(tight).toHaveClass("py-0.5");
		expect(compact).toHaveClass("py-1.5");
		expect(spacious).toHaveClass("py-2.5");
	});

	it("centres its leading cell by default and aligns on the baseline when asked", () => {
		const { container, unmount } = render(<Row>centred</Row>);
		expect(container.firstElementChild).toHaveClass("items-center");
		unmount();

		const aligned = render(<Row align="baseline">baseline</Row>);
		expect(aligned.container.firstElementChild).toHaveClass("items-baseline");
	});

	it("wraps its content in a dd when it is one pair of a list", () => {
		render(
			<dl>
				<Row contentAs="dd" leading={<dt>Category</dt>}>
					typescript
				</Row>
			</dl>
		);

		expect(screen.getByRole("definition")).toHaveTextContent("typescript");
		expect(screen.getByRole("term")).toHaveTextContent("Category");
	});

	it("omits the trailing cell when there is nothing to trail", () => {
		const { container } = render(<Row>only content</Row>);

		expect(container.firstElementChild?.children).toHaveLength(1);
	});
});
