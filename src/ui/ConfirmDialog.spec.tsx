import { describe, it, expect, beforeAll, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConfirmDialog } from "./ConfirmDialog.component";

// jsdom does not implement HTMLDialogElement.showModal / close.
// We mock them and set the `open` attribute so dialog contents become accessible.
beforeAll(() => {
	HTMLDialogElement.prototype.showModal = vi.fn(function (
		this: HTMLDialogElement
	) {
		this.setAttribute("open", "");
	});
	HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
		this.removeAttribute("open");
	});
});

const defaultProps = {
	isOpen: true,
	title: "Uninstall config?",
	message: "This will remove the config and free up storage.",
	onConfirm: vi.fn(),
	onCancel: vi.fn(),
};

describe("ConfirmDialog", () => {
	it("renders title and message", () => {
		render(<ConfirmDialog {...defaultProps} />);
		expect(screen.getByText("Uninstall config?")).toBeInTheDocument();
		expect(
			screen.getByText("This will remove the config and free up storage.")
		).toBeInTheDocument();
	});

	it("renders confirm and cancel buttons", () => {
		render(<ConfirmDialog {...defaultProps} />);
		expect(screen.getByRole("button", { name: "Yes" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "No" })).toBeInTheDocument();
	});

	it("uses custom button labels", () => {
		render(
			<ConfirmDialog
				{...defaultProps}
				confirmText="Uninstall"
				cancelText="Keep it"
			/>
		);
		expect(
			screen.getByRole("button", { name: "Uninstall" })
		).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Keep it" })).toBeInTheDocument();
	});

	it("calls onConfirm when confirm button is clicked", async () => {
		const onConfirm = vi.fn();
		render(<ConfirmDialog {...defaultProps} onConfirm={onConfirm} />);
		await userEvent.click(screen.getByRole("button", { name: "Yes" }));
		expect(onConfirm).toHaveBeenCalledOnce();
	});

	it("calls onCancel when cancel button is clicked", async () => {
		const onCancel = vi.fn();
		render(<ConfirmDialog {...defaultProps} onCancel={onCancel} />);
		await userEvent.click(screen.getByRole("button", { name: "No" }));
		expect(onCancel).toHaveBeenCalledOnce();
	});

	it("disables both buttons when isConfirming", () => {
		render(<ConfirmDialog {...defaultProps} isConfirming />);
		screen.getAllByRole("button").forEach((btn) => {
			expect(btn).toBeDisabled();
		});
	});

	it("shows error message when provided", () => {
		render(
			<ConfirmDialog {...defaultProps} errorMessage="Something went wrong." />
		);
		expect(screen.getByRole("alert")).toHaveTextContent(
			"Something went wrong."
		);
	});
});
