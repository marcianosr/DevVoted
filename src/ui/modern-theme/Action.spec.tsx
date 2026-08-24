import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Action } from "./Action.ui";

describe("Action", () => {
	it("names what it does and what it costs", () => {
		render(<Action label="Use" cost="16 KB" onUse={vi.fn()} />);

		expect(
			screen.getByRole("button", { name: "Use 16 KB" })
		).toBeInTheDocument();
	});

	it("spends on click", async () => {
		const onUse = vi.fn();
		const user = userEvent.setup();
		render(<Action label="Use" cost="16 KB" onUse={onUse} />);

		await user.click(screen.getByRole("button"));

		expect(onUse).toHaveBeenCalledOnce();
	});

	it("does not toggle the fold it sits inside when it is pressed", async () => {
		const user = userEvent.setup();
		render(
			<details>
				<summary>
					ESLint
					<Action label="Use" cost="16 KB" onUse={vi.fn()} />
				</summary>
				<p>hint</p>
			</details>
		);

		await user.click(screen.getByRole("button", { name: "Use 16 KB" }));

		expect(screen.getByRole("group")).not.toHaveAttribute("open");
	});

	it("cannot be spent when there is nothing to spend", async () => {
		const onUse = vi.fn();
		const user = userEvent.setup();
		render(<Action label="Use" cost="16 KB" onUse={onUse} disabled />);

		await user.click(screen.getByRole("button"));

		expect(onUse).not.toHaveBeenCalled();
	});

	it("stands on a price alone, for a shelf where the verb is the row itself", () => {
		render(<Action cost="32 KB" on="Stylelint" onUse={vi.fn()} />);

		expect(
			screen.getByRole("button", { name: "Stylelint 32 KB" })
		).toBeInTheDocument();
	});

	it("stands on a verb alone, where the action carries no price", () => {
		render(<Action label="Uninstall" on=".vue" onUse={vi.fn()} />);

		expect(
			screen.getByRole("button", { name: "Uninstall .vue" })
		).toBeInTheDocument();
	});

	it("wears the gain colour when it is the action the shelf wants taken", () => {
		render(<Action label="install" emphasis="loud" onUse={vi.fn()} />);

		expect(screen.getByRole("button")).toHaveClass("border-celadon");
	});

	it("wears the legendary ring when a requirement is already met", () => {
		render(<Action label="Upgrade" emphasis="prismatic" onUse={vi.fn()} />);

		expect(screen.getByRole("button")).toHaveClass("legendary-ring");
	});

	it("leaves a price the button's own colour rather than shouting it red", () => {
		render(<Action label="Use" cost="16 KB" onUse={vi.fn()} />);

		expect(screen.getByRole("button")).toHaveClass("text-zinc-100");
		expect(screen.getByText("16 KB")).not.toHaveClass("text-cinnabar");
	});

	it("turns a whole button red where the action takes something back out", () => {
		render(<Action label="Uninstall" emphasis="danger" onUse={vi.fn()} />);

		expect(screen.getByRole("button")).toHaveClass(
			"border-cinnabar",
			"text-cinnabar"
		);
	});

	it("pads a screen's one way forward harder than a shelf button", () => {
		const { unmount } = render(<Action label="Use" onUse={vi.fn()} />);
		expect(screen.getByRole("button")).toHaveClass("px-3", "py-1.5");
		unmount();

		render(<Action label="Enter shop" size="lg" onUse={vi.fn()} />);
		expect(screen.getByRole("button")).toHaveClass("px-6", "py-3");
	});
	it("stretches to its column when the caller asks for the width", () => {
		render(<Action label="Pick 3 to start" full onUse={() => {}} />);

		expect(screen.getByRole("button")).toHaveClass("w-full", "justify-center");
	});

	it("invites the press it can accept, and refuses the one it cannot", () => {
		const { rerender } = render(<Action label="rebuild" onUse={() => {}} />);
		expect(screen.getByRole("button")).toHaveClass("cursor-pointer");

		rerender(<Action label="rebuild" disabled onUse={() => {}} />);
		expect(screen.getByRole("button")).toHaveClass(
			"disabled:cursor-not-allowed"
		);
	});
});
