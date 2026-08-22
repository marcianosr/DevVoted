import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Definitions } from "./Definitions.ui";

const items = [
	{ term: "Category", detail: "typescript" },
	{ term: "Answer type", detail: "single" },
];

describe("Definitions", () => {
	it("pairs each term with its detail", () => {
		render(<Definitions items={items} />);

		const terms = screen.getAllByRole("term");
		expect(terms).toHaveLength(2);
		expect(terms[0]).toHaveTextContent("Category");
		expect(screen.getAllByRole("definition")[0]).toHaveTextContent(
			"typescript"
		);
	});

	it("divides a standalone panel and leaves a nested block undivided", () => {
		const { container, unmount } = render(<Definitions items={items} />);
		expect(container.querySelector("dl")).toHaveClass("divide-y");
		unmount();

		const nested = render(<Definitions items={items} variant="nested" />);
		expect(nested.container.querySelector("dl")).not.toHaveClass("divide-y");
	});

	it("tones a detail when the caller marks it", () => {
		render(
			<Definitions
				items={[{ term: "next block", detail: "32 KB", tone: "saffron" }]}
			/>
		);

		expect(screen.getByText("32 KB")).toHaveClass("text-saffron");
	});
});
