import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Uninstall } from "./Uninstall.ui";

const FIGURES = [
	{ label: "refund", value: "+16 KB", color: "viridian" },
	{ label: "balance", value: "704 → 720 KB" },
	{ label: "slots used", value: "7 → 6 of 10" },
] as const;

const props = {
	name: "Moore's Law",
	slots: 1,
	prose: "Removing it frees its room and refunds half the draft price.",
	figures: FIGURES,
};

describe("Uninstall", () => {
	it("labels what the dialog is for", () => {
		render(<Uninstall {...props} />);

		expect(screen.getByText("uninstall", { selector: "p" })).toHaveClass(
			"text-xs",
			"text-theme-muted"
		);
	});

	it("sets the ledger labels in the default text tone", () => {
		render(<Uninstall {...props} />);

		expect(screen.getByText("refund")).toHaveClass("text-theme-faint");
	});

	it("names the config beside the room it takes up", () => {
		render(<Uninstall {...props} />);

		expect(screen.getByText("Moore's Law")).toBeInTheDocument();
		expect(screen.getByText("1")).toHaveClass("badge-theme");
	});

	it("says what removing it does", () => {
		render(<Uninstall {...props} />);

		expect(
			screen.getByText(
				"Removing it frees its room and refunds half the draft price."
			)
		).toBeInTheDocument();
	});

	it("lists every figure the removal moves, against its label", () => {
		render(<Uninstall {...props} />);

		for (const figure of FIGURES) {
			expect(screen.getByText(figure.label)).toBeInTheDocument();
			expect(screen.getByText(figure.value)).toBeInTheDocument();
		}
	});

	it("badges each figure, so a value never reads as prose", () => {
		render(<Uninstall {...props} />);

		for (const figure of FIGURES) {
			expect(screen.getByText(figure.value)).toHaveClass("badge-theme");
		}
	});

	it("colours a figure that is a gain, and leaves the rest neutral", () => {
		render(<Uninstall {...props} />);

		expect(screen.getByText("+16 KB")).toHaveAttribute(
			"data-screen-theme",
			"viridian"
		);
		expect(screen.getByText("704 → 720 KB")).not.toHaveAttribute(
			"data-screen-theme"
		);
	});

	it("pairs each label with its own value, so a row cannot be misread", () => {
		render(<Uninstall {...props} />);

		expect(screen.getByText("refund").parentElement).toHaveTextContent(
			"refund+16 KB"
		);
	});

	it("uninstalls", async () => {
		const onConfirm = vi.fn();
		render(<Uninstall {...props} onConfirm={onConfirm} />);

		await userEvent.click(screen.getByRole("button", { name: "uninstall" }));

		expect(onConfirm).toHaveBeenCalledOnce();
	});

	it("cancels", async () => {
		const onCancel = vi.fn();
		render(<Uninstall {...props} onCancel={onCancel} />);

		await userEvent.click(screen.getByRole("button", { name: "cancel" }));

		expect(onCancel).toHaveBeenCalledOnce();
	});

	it("stands its actions taller than a chip's, being a page-level choice", () => {
		render(<Uninstall {...props} onConfirm={vi.fn()} />);

		expect(screen.getByRole("button", { name: "uninstall" })).toHaveClass(
			"h-8"
		);
	});
});
