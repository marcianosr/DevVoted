import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Tooltip } from "./Tooltip.component";

describe("Tooltip", () => {
	it("renders the trigger and keeps the content in the DOM", () => {
		render(
			<Tooltip content="Banjo's move set">
				<span>Kazooie</span>
			</Tooltip>
		);
		expect(screen.getByText("Kazooie")).toBeInTheDocument();
		expect(screen.getByText("Banjo's move set")).toBeInTheDocument();
	});

	it("hides the content until hover/focus reveals it", () => {
		render(
			<Tooltip content="Grunty's lair">
				<span>trigger</span>
			</Tooltip>
		);
		expect(screen.getByRole("tooltip")).toHaveClass(
			"hidden",
			"group-hover:block"
		);
	});
});
