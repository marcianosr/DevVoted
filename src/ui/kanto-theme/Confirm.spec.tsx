import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Confirm, type ConfirmFigure } from "./Confirm.ui";

const FIGURES = [
	{ label: "cap", value: "2 MB → 1 MB" },
	{ label: "burnt now", value: "512 KB", color: "cinnabar" },
] as const satisfies readonly ConfirmFigure[];

const props = {
	eyebrow: "downgrade",
	title: "Storage plan 1 MB",
	prose: "Dropping a rung takes effect now.",
	figures: FIGURES,
	confirmLabel: "drop to 1 MB",
};

describe("Confirm", () => {
	it("titles the body as a heading, not as bold prose", () => {
		render(<Confirm {...props} />);

		expect(
			screen.getByRole("heading", { name: "Storage plan 1 MB" })
		).toBeInTheDocument();
	});

	it("leaves the eyebrow's case to the caller", () => {
		render(<Confirm {...props} />);

		expect(screen.getByText("downgrade")).toBeInTheDocument();
	});

	it("keeps the eyebrow the quietest line in the body", () => {
		render(<Confirm {...props} />);

		expect(screen.getByText("downgrade")).toHaveClass(
			"text-theme-muted",
			"text-xs"
		);
	});

	it("spells out what the press will do before it is pressed", () => {
		render(<Confirm {...props} />);

		expect(
			screen.getByText("Dropping a rung takes effect now.")
		).toBeInTheDocument();
	});

	it("pairs every figure's label with its own value", () => {
		render(<Confirm {...props} />);

		expect(screen.getByText("cap").parentElement).toHaveTextContent(
			"cap2 MB → 1 MB"
		);
	});

	it("badges every value, so the ledger reads as one column of figures", () => {
		render(<Confirm {...props} />);

		for (const figure of FIGURES) {
			expect(screen.getByText(figure.value)).toHaveClass("badge-theme");
		}
	});

	it("colours only the figures that asked for it", () => {
		render(<Confirm {...props} />);

		expect(screen.getByText("512 KB")).toHaveAttribute(
			"data-screen-theme",
			"cinnabar"
		);
		expect(screen.getByText("2 MB → 1 MB")).not.toHaveAttribute(
			"data-screen-theme"
		);
	});

	it("names the confirm press after the thing it does", () => {
		render(<Confirm {...props} />);

		expect(
			screen.getByRole("button", { name: "drop to 1 MB" })
		).toBeInTheDocument();
	});

	it("always offers a way out beside the way through", () => {
		render(<Confirm {...props} />);

		expect(screen.getByRole("button", { name: "cancel" })).toBeInTheDocument();
	});

	it("confirms and cancels through their own handlers", async () => {
		const onConfirm = vi.fn();
		const onCancel = vi.fn();
		render(<Confirm {...props} onConfirm={onConfirm} onCancel={onCancel} />);

		await userEvent.click(screen.getByRole("button", { name: "drop to 1 MB" }));
		await userEvent.click(screen.getByRole("button", { name: "cancel" }));

		expect(onConfirm).toHaveBeenCalledTimes(1);
		expect(onCancel).toHaveBeenCalledTimes(1);
	});

	it("stands the ledger under a rule, so the figures read as a total", () => {
		const { container } = render(<Confirm {...props} />);

		expect(container.querySelector(".border-t")).not.toBeNull();
	});

	it("hangs a caller's mark beside the title", () => {
		render(<Confirm {...props} lead={<span>8</span>} />);

		expect(screen.getByText("8").parentElement).toHaveTextContent(
			"8Storage plan 1 MB"
		);
	});

	it("stands on its own without a lead", () => {
		render(<Confirm {...props} />);

		expect(
			screen.getByRole("heading", { name: "Storage plan 1 MB" })
		).toBeInTheDocument();
	});

	it("brings no box of its own, leaving the spacing to its chrome", () => {
		const { container } = render(<Confirm {...props} />);

		expect(container.children.length).toBeGreaterThan(1);
	});
});
