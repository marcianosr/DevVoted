import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Foldable, type FoldableItem } from "./Foldable.ui";

const items: FoldableItem[] = [
	{ id: "eslint", content: "ESLint" },
	{ id: "indexeddb", content: "IndexedDB" },
];

describe("Foldable", () => {
	it("renders the title and the subtitle in the header", () => {
		render(
			<Foldable
				title="Pipeline"
				subtitle="4 firing · 1 offline"
				items={items}
			/>
		);

		expect(screen.getByText("Pipeline")).toBeInTheDocument();
		expect(screen.getByText("4 firing · 1 offline")).toBeInTheDocument();
	});

	it("renders one row per item", () => {
		render(<Foldable title="Pipeline" items={items} />);

		expect(screen.getAllByRole("listitem")).toHaveLength(2);
		expect(screen.getByText("ESLint")).toBeInTheDocument();
	});

	it("renders an unordered list by default", () => {
		render(<Foldable title="Pipeline" items={items} />);

		expect(screen.getByRole("list").tagName).toBe("UL");
	});

	it("renders an ordered list when asked", () => {
		render(<Foldable title="Pipeline" items={items} as="ol" />);

		expect(screen.getByRole("list").tagName).toBe("OL");
	});

	it("starts open", () => {
		render(<Foldable title="Pipeline" items={items} />);

		expect(screen.getByRole("group")).toHaveAttribute("open");
	});

	it("starts folded when defaultOpen is false", () => {
		render(<Foldable title="Pipeline" items={items} defaultOpen={false} />);

		expect(screen.getByRole("group")).not.toHaveAttribute("open");
	});
});
