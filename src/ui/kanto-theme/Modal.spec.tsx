import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Modal } from "./Modal.ui";

describe("Modal", () => {
	it("names the dialog it opens", () => {
		render(
			<Modal label="Uninstall Moore's Law">
				<p>body</p>
			</Modal>
		);

		expect(
			screen.getByRole("dialog", { name: "Uninstall Moore's Law" })
		).toBeInTheDocument();
	});

	it("holds the page behind it, so nothing outside answers a click", () => {
		render(
			<Modal label="Uninstall">
				<p>body</p>
			</Modal>
		);

		expect(screen.getByRole("dialog")).toHaveAttribute("aria-modal", "true");
	});

	it("shows what it was handed", () => {
		render(
			<Modal label="Uninstall">
				<p>Removing it frees its room.</p>
			</Modal>
		);

		expect(screen.getByText("Removing it frees its room.")).toBeInTheDocument();
	});

	it("dismisses on a press outside the panel", async () => {
		const onDismiss = vi.fn();
		render(
			<Modal label="Uninstall" onDismiss={onDismiss}>
				<p>body</p>
			</Modal>
		);

		await userEvent.click(screen.getByRole("button", { name: "Dismiss" }));

		expect(onDismiss).toHaveBeenCalledOnce();
	});

	it("makes the scrim a real control, reachable without a pointer", async () => {
		const onDismiss = vi.fn();
		render(
			<Modal label="Uninstall" onDismiss={onDismiss}>
				<p>body</p>
			</Modal>
		);

		const scrim = screen.getByRole("button", { name: "Dismiss" });
		scrim.focus();
		await userEvent.keyboard("{Enter}");

		expect(scrim).toHaveFocus();
		expect(onDismiss).toHaveBeenCalledOnce();
	});

	it("leaves a press inside the panel to the panel", async () => {
		const onDismiss = vi.fn();
		const onConfirm = vi.fn();
		render(
			<Modal label="Uninstall" onDismiss={onDismiss}>
				<button type="button" onClick={onConfirm}>
					uninstall
				</button>
			</Modal>
		);

		await userEvent.click(screen.getByRole("button", { name: "uninstall" }));

		expect(onConfirm).toHaveBeenCalledOnce();
		expect(onDismiss).not.toHaveBeenCalled();
	});
});
