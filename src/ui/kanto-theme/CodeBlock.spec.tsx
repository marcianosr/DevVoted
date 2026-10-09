import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";

import { CodeBlock } from "./CodeBlock.ui";

const SOURCE = "const gate = 9;";

describe("CodeBlock", () => {
	it("renders the source as a code element, not as prose", () => {
		const { container } = render(<CodeBlock>{SOURCE}</CodeBlock>);

		expect(container.querySelector("pre code")).toHaveTextContent(SOURCE);
	});

	it("keeps markdown syntax inside the fence literal", () => {
		const { container } = render(<CodeBlock>{"# not a heading"}</CodeBlock>);

		expect(container.querySelector("h1")).toBeNull();
		expect(container.querySelector("pre code")).toHaveTextContent(
			"# not a heading"
		);
	});

	it("hands highlight.js the code so tokens can be coloured", () => {
		const { container } = render(<CodeBlock>{SOURCE}</CodeBlock>);

		expect(container.querySelector("code")).toHaveClass("hljs");
	});

	it("sits on highlight.js's own ground, without a panel border", () => {
		const { container } = render(<CodeBlock>{SOURCE}</CodeBlock>);

		expect(container.firstChild).not.toHaveClass("panel-surface", "border");
		expect(container.firstChild).not.toHaveClass("[&_code]:bg-transparent");
	});

	it("scrolls a long line inside itself instead of widening the screen", () => {
		const { container } = render(
			<CodeBlock>{"const x = 1; ".repeat(40)}</CodeBlock>
		);

		expect(container.firstChild).toHaveClass("overflow-x-auto");
	});

	it("keeps every line of a multi-line source", () => {
		const { container } = render(
			<CodeBlock>{"type A = {\n\tb: string;\n};"}</CodeBlock>
		);

		expect(container.querySelector("pre code")?.textContent).toContain(
			"b: string;"
		);
	});
});

describe("CodeBlock with a language", () => {
	it("labels the code with the fence's language so highlighting need not guess", () => {
		const { container } = render(<CodeBlock lang="js">{SOURCE}</CodeBlock>);

		expect(container.querySelector("code")?.className).toMatch(/language-js/);
	});
});
