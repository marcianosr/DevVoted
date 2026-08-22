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

	it("offers no control at all where there is no lock to sell", () => {
		render(<Lock on="WTFPL" state="unavailable" />);

		expect(screen.queryByRole("button")).not.toBeInTheDocument();
	});
});
