import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { FoldableRow, type Fold } from "./FoldableRow.ui";

const chipSummary = ({ expanded, toggle }: Fold) => (
	<>
		<span>the label</span>
		<button type="button" aria-expanded={expanded} onClick={toggle}>
			.js
		</button>
	</>
);

const renderRow = (props: Partial<ComponentProps<typeof FoldableRow>> = {}) =>
	render(
		<FoldableRow
			summary={chipSummary}
			detail={<span>the detail</span>}
			{...props}
		/>
	);

describe(FoldableRow, () => {
	it("starts with the detail folded open", () => {
		renderRow();
		expect(screen.getByText("the detail")).toBeInTheDocument();
	});

	it("folds closed on a row tap and back open on a second", () => {
		renderRow();
		fireEvent.click(screen.getByText("the label"));
		expect(screen.queryByText("the detail")).not.toBeInTheDocument();
		fireEvent.click(screen.getByText("the label"));
		expect(screen.getByText("the detail")).toBeInTheDocument();
	});

	it("hands the summary a working toggle with the open state", () => {
		renderRow();
		const chip = screen.getByRole("button", { name: ".js" });
		expect(chip).toHaveAttribute("aria-expanded", "true");
		fireEvent.click(chip);
		expect(chip).toHaveAttribute("aria-expanded", "false");
		expect(screen.queryByText("the detail")).not.toBeInTheDocument();
	});

	it("leaves clicks on the summary's own controls alone", () => {
		const use = vi.fn();
		renderRow({
			summary: () => (
				<button type="button" onClick={use}>
					use
				</button>
			),
		});
		fireEvent.click(screen.getByRole("button", { name: "use" }));
		expect(use).toHaveBeenCalledTimes(1);
		expect(screen.getByText("the detail")).toBeInTheDocument();
	});

	it("activates instead of folding when onActivate is set", () => {
		const onActivate = vi.fn();
		renderRow({ summary: () => <span>ghost</span>, onActivate });
		fireEvent.click(screen.getByText("ghost"));
		expect(onActivate).toHaveBeenCalledTimes(1);
		expect(screen.getByText("the detail")).toBeInTheDocument();
	});

	it("exposes an activatable row to the keyboard via a button role", () => {
		const onActivate = vi.fn();
		renderRow({ summary: () => <span>ghost</span>, onActivate });
		const row = screen.getByRole("button");
		fireEvent.keyDown(row, { key: "Enter" });
		fireEvent.keyDown(row, { key: " " });
		expect(onActivate).toHaveBeenCalledTimes(2);
	});

	it("gives a fold row no button role of its own", () => {
		renderRow({ summary: () => <span>plain</span> });
		expect(screen.queryByRole("button")).not.toBeInTheDocument();
	});

	it("stays open and ignores row taps when not foldable", () => {
		renderRow({ summary: () => <span>plain</span>, foldable: false });
		fireEvent.click(screen.getByText("plain"));
		expect(screen.getByText("the detail")).toBeInTheDocument();
	});
});
