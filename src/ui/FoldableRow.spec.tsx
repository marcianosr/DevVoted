import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { FoldableRow, type Fold } from "./FoldableRow.ui";

const chipSummary = ({ expanded, toggle, marker }: Fold) => (
	<>
		<span>the label</span>
		<button type="button" aria-expanded={expanded} onClick={toggle}>
			.js
		</button>
		{marker}
	</>
);

// The detail stays mounted and hides by class, so the breakpoint can decide the
// default fold with no media query and no hydration flash.
const detailBlock = ({ detailClass }: Fold) => (
	<span className={detailClass}>the detail</span>
);

const renderRow = (props: Partial<ComponentProps<typeof FoldableRow>> = {}) =>
	render(<FoldableRow summary={chipSummary} detail={detailBlock} {...props} />);

const detail = () => screen.getByText("the detail");

describe(FoldableRow, () => {
	it("leaves the fold to the breakpoint until tapped: shut on a phone, open above", () => {
		renderRow();
		expect(detail()).toHaveClass("hidden", "sm:flex");
	});

	it("obeys defaultOpen at every width instead of the breakpoint", () => {
		renderRow({ defaultOpen: false });
		expect(detail()).toHaveClass("hidden");
		expect(detail()).not.toHaveClass("sm:flex");
	});

	it("opens a defaultOpen row on a phone too, since it was singled out", () => {
		renderRow({ defaultOpen: true });
		expect(detail()).toHaveClass("flex");
		expect(detail()).not.toHaveClass("hidden");
	});

	it("opens a shut-by-default row on the first tap, not the second", () => {
		renderRow({ defaultOpen: false });
		fireEvent.click(screen.getByText("the label"));
		expect(detail()).toHaveClass("flex");
	});

	it("folds closed on a row tap and back open on a second", () => {
		renderRow();
		fireEvent.click(screen.getByText("the label"));
		expect(detail()).toHaveClass("hidden");
		expect(detail()).not.toHaveClass("sm:flex");
		fireEvent.click(screen.getByText("the label"));
		expect(detail()).toHaveClass("flex");
	});

	it("hands the summary a working toggle with the open state", () => {
		renderRow();
		const chip = screen.getByRole("button", { name: ".js" });
		// No claim before a tap — the breakpoint owns the state, not the row.
		expect(chip).not.toHaveAttribute("aria-expanded");
		fireEvent.click(chip);
		expect(chip).toHaveAttribute("aria-expanded", "false");
		expect(detail()).toHaveClass("hidden");
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
		expect(detail()).toHaveClass("hidden", "sm:flex");
	});

	it("activates instead of folding when onActivate is set", () => {
		const onActivate = vi.fn();
		renderRow({ summary: () => <span>ghost</span>, onActivate });
		fireEvent.click(screen.getByText("ghost"));
		expect(onActivate).toHaveBeenCalledTimes(1);
		expect(detail()).toHaveClass("hidden", "sm:flex");
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

	// The shop's rows carry their own controls instead of folding, so nothing may
	// hide their detail — not even a narrow screen.
	it("stays open on every width and ignores row taps when not foldable", () => {
		renderRow({ summary: () => <span>plain</span>, foldable: false });
		fireEvent.click(screen.getByText("plain"));
		expect(detail()).toHaveClass("flex");
		expect(detail()).not.toHaveClass("hidden");
	});

	it("carries a caret only where the row folds", () => {
		const { container } = renderRow();
		expect(container.querySelector("[aria-hidden]")).toHaveTextContent("▸");
	});

	it("leaves a non-folding row without a caret to promise a fold", () => {
		const { container } = renderRow({ foldable: false });
		expect(container.querySelector("[aria-hidden]")).toBeNull();
	});
});
