import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Popover } from "./Popover.component";

// The native Popover API is polyfilled for jsdom in src/test/setup.ts

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

	it("wraps a disabled control in a span trigger that still opens on tap", async () => {
		render(
			<Popover
				triggerAs="span"
				ariaLabel="Why disabled"
				content={<p>Slot a config to start</p>}
			>
				<button type="button" disabled>
					Start the climb
				</button>
			</Popover>
		);
		// The span is the interactive trigger; the disabled inner button is not.
		const trigger = screen.getByRole("button", { name: "Why disabled" });
		expect(trigger.tagName).toBe("SPAN");
		await userEvent.click(trigger);
		expect(trigger).toHaveAttribute("aria-expanded", "true");
	});
});
