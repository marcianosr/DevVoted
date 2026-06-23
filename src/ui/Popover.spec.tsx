import { describe, it, expect, beforeAll, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Popover } from "./Popover.component";

// jsdom does not implement the native Popover API
beforeAll(() => {
	HTMLElement.prototype.showPopover = vi.fn();
	HTMLElement.prototype.hidePopover = vi.fn();
});

const TestPopover = () => (
	<Popover ariaLabel="Show info" content={<p>Rare game info</p>}>
		<span>ℹ️</span>
	</Popover>
);

describe("Popover", () => {
	it("renders the trigger button", () => {
		render(<TestPopover />);
		expect(
			screen.getByRole("button", { name: "Show info" })
		).toBeInTheDocument();
	});

	it("trigger has aria-expanded=false initially", () => {
		render(<TestPopover />);
		expect(screen.getByRole("button")).toHaveAttribute(
			"aria-expanded",
			"false"
		);
	});

	it("sets aria-expanded=true after click", async () => {
		render(<TestPopover />);
		await userEvent.click(screen.getByRole("button", { name: "Show info" }));
		expect(screen.getByRole("button")).toHaveAttribute("aria-expanded", "true");
	});

	it("toggles closed on second click", async () => {
		render(<TestPopover />);
		const btn = screen.getByRole("button", { name: "Show info" });
		await userEvent.click(btn);
		await userEvent.click(btn);
		expect(btn).toHaveAttribute("aria-expanded", "false");
	});
});
