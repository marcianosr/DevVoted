import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Fold, type FoldItem } from "./Fold.ui";

const items: FoldItem[] = [
	{ id: "eslint", content: <span>ESLint</span> },
	{ id: "freemium", content: <span>Freemium</span> },
];

describe("Fold", () => {
	it("shows its bottom line in the summary, so a closed fold still reports", () => {
		render(
			<Fold
				title="Pipeline"
				value="−128 KB"
				items={items}
				defaultOpen={false}
			/>
		);

		expect(screen.getByText("Pipeline")).toBeInTheDocument();
		expect(screen.getByText("−128 KB")).toBeInTheDocument();
	});

	it("opens by default", () => {
		const { container } = render(<Fold title="Pipeline" items={items} />);

		expect(container.querySelector("details")).toHaveAttribute("open");
	});

	it("stays shut when asked to", () => {
		const { container } = render(
			<Fold title="Coverage" items={items} defaultOpen={false} />
		);

		expect(container.querySelector("details")).not.toHaveAttribute("open");
	});

	it("renders one list item per config", () => {
		render(<Fold title="Pipeline" items={items} />);

		expect(screen.getAllByRole("listitem")).toHaveLength(2);
	});

	it("renders freeform children when there is no item list", () => {
		render(
			<Fold title="Stake">
				<span>A miss peels one config.</span>
			</Fold>
		);

		expect(screen.getByText("A miss peels one config.")).toBeInTheDocument();
		expect(screen.queryByRole("list")).not.toBeInTheDocument();
	});

	it("closes with a line so stacked folds read as separate sections", () => {
		const { container } = render(<Fold title="Pipeline" />);

		expect(container.firstElementChild).toHaveClass("border-b");
	});

	it("carries a control that acts on the whole section", () => {
		render(<Fold title="Draft" action={<button>rebuild</button>} />);

		expect(screen.getByRole("button", { name: "rebuild" })).toBeInTheDocument();
	});

	it("states the section's own state under the summary", () => {
		render(<Fold title="Draft" note="next rebuild 8 KB" />);

		expect(screen.getByText("next rebuild 8 KB")).toBeInTheDocument();
	});

	it("hides the note with the fold, since a shut section explains nothing", () => {
		const { container } = render(
			<Fold title="Draft" note="next rebuild 8 KB" defaultOpen={false} />
		);

		expect(container.querySelector("details")).not.toHaveAttribute("open");
	});
});
