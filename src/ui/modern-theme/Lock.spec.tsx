import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Lock } from "./Lock.ui";

describe("Lock", () => {
	it("names the offer and the price of holding it", () => {
		render(
			<Lock on="Stylelint" state="unlocked" cost="16 KB" onToggle={vi.fn()} />
		);

		expect(
			screen.getByRole("button", { name: "Lock Stylelint for 16 KB" })
		).toBeInTheDocument();
	});

	it("offers release rather than a price once the offer is held", () => {
		render(<Lock on="Freemium" state="locked" onToggle={vi.fn()} />);

		const button = screen.getByRole("button", { name: "Release Freemium" });
		expect(button).toHaveAttribute("aria-pressed", "true");
	});

	it("toggles on click", async () => {
		const onToggle = vi.fn();
		const user = userEvent.setup();
		render(
			<Lock on="Stylelint" state="unlocked" cost="16 KB" onToggle={onToggle} />
		);

		await user.click(screen.getByRole("button"));

		expect(onToggle).toHaveBeenCalledOnce();
	});

	it("does not toggle the fold it sits inside when it is pressed", async () => {
		const user = userEvent.setup();
		render(
			<details>
				<summary>
					Stylelint
					<Lock
						on="Stylelint"
						state="unlocked"
						cost="16 KB"
						onToggle={vi.fn()}
					/>
				</summary>
				<p>rare</p>
			</details>
		);

		await user.click(screen.getByRole("button"));

		expect(screen.getByRole("group")).not.toHaveAttribute("open");
	});

	it("offers no press where the lock cannot be paid for", () => {
		render(<Lock on="WTFPL" state="unavailable" />);

		expect(screen.queryByRole("button")).not.toBeInTheDocument();
	});

	it("keeps the padlock in the dim state, so the ring is never empty", () => {
		const { container } = render(<Lock on="WTFPL" state="unavailable" />);

		expect(container.querySelector("svg rect")).not.toBeNull();
	});

	it("invites the press on the states that have one", () => {
		const { rerender } = render(
			<Lock on="Stylelint" state="unlocked" cost="16 KB" onToggle={() => {}} />
		);
		expect(screen.getByRole("button")).toHaveClass("cursor-pointer");

		rerender(<Lock on="Stylelint" state="locked" onToggle={() => {}} />);
		expect(screen.getByRole("button")).toHaveClass("cursor-pointer");
	});

	it("offers no cursor where it offers no button", () => {
		const { container } = render(<Lock on="WTFPL" state="unavailable" />);

		expect(container.firstChild).not.toHaveClass("cursor-pointer");
	});
});
