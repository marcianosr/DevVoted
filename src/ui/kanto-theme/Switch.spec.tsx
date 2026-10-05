import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Switch } from "./Switch.ui";

describe("Switch", () => {
	it("states its label, count and whether it is on", () => {
		render(<Switch label="with code" count={143} checked onChange={vi.fn()} />);

		expect(
			screen.getByRole("switch", { name: "with code 143" })
		).toHaveAttribute("aria-checked", "true");
	});

	it("asks to flip when pressed", async () => {
		const onChange = vi.fn();
		render(<Switch label="with code" checked={false} onChange={onChange} />);

		await userEvent.click(screen.getByRole("switch", { name: "with code" }));

		expect(onChange).toHaveBeenCalledWith(true);
	});
});
