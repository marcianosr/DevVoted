import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Crumb } from "./Crumb.ui";

describe("Crumb", () => {
	it("suffixes the category behind the label", () => {
		render(
			<Crumb label="poll 1" suffix="css" state="answered" verdict="pass" />
		);

		expect(screen.getByText("poll 1")).toBeInTheDocument();
		expect(screen.getByText("css")).toHaveClass("text-pewter");
	});

	it("marks the crumb you are on as the current step", () => {
		render(<Crumb label="poll 3" state="current" />);

		expect(
			screen.getByText("poll 3").closest("[aria-current]")
		).toHaveAttribute("aria-current", "step");
	});

	it("borrows the gate colour for the current crumb rather than a fixed hue", () => {
		render(<Crumb label="poll 3" suffix="ts" state="current" />);

		expect(screen.getByText("poll 3").parentElement).toHaveClass(
			"border-theme"
		);
		expect(screen.getByText("ts")).toHaveClass("text-theme");
	});

	it("answers the mouse on a disabled crumb", () => {
		render(<Crumb label="poll 4" state="disabled" />);

		expect(screen.getByText("poll 4").parentElement).toHaveClass(
			"cursor-not-allowed"
		);
	});

	it("italicises a crumb that cannot be reached yet", () => {
		render(<Crumb label="poll 5" state="disabled" />);

		expect(screen.getByText("poll 5").parentElement).toHaveClass("italic");
	});

	it("reports a click on a crumb behind you", async () => {
		const onSelect = vi.fn();
		render(
			<Crumb
				label="poll 1"
				state="answered"
				verdict="pass"
				onSelect={onSelect}
			/>
		);

		await userEvent.click(screen.getByRole("button"));

		expect(onSelect).toHaveBeenCalledOnce();
	});

	it("refuses a click on a crumb you have not reached", async () => {
		const onSelect = vi.fn();
		render(<Crumb label="poll 4" state="disabled" onSelect={onSelect} />);

		await userEvent.click(screen.getByRole("button"));

		expect(onSelect).not.toHaveBeenCalled();
	});
});
