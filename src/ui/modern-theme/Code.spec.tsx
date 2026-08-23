import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Code, Token } from "./Code.ui";

describe("Code", () => {
	it("renders every line of the snippet", () => {
		render(<Code lines={["const arr = [];", "const tail = arr.slice(-2);"]} />);

		expect(screen.getByText("const arr = [];")).toBeInTheDocument();
		expect(screen.getByText("const tail = arr.slice(-2);")).toBeInTheDocument();
	});

	it("preserves the source's own whitespace", () => {
		render(<Code lines={["  indented"]} />);

		expect(screen.getByText("indented")).toHaveClass("whitespace-pre");
	});

	it("scrolls a long line inside the block rather than widening the screen", () => {
		const { container } = render(<Code lines={["a"]} />);

		expect(container.querySelector("pre")).toHaveClass("overflow-x-auto");
	});
});

describe("Token", () => {
	it("paints the tone it is given", () => {
		render(<Token tone="vermillion">{'"init"'}</Token>);

		expect(screen.getByText('"init"')).toHaveClass("text-vermillion");
	});
});
