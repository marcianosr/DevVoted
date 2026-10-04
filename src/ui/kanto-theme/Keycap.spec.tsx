import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Keycap } from "./Keycap.ui";

describe("Keycap", () => {
	it("rounds a single-answer key like a radio and squares a multi-answer key like a checkbox", () => {
		const { rerender } = render(<Keycap letter="A" />);
		expect(screen.getByText("A")).toHaveClass("rounded-full");

		rerender(<Keycap letter="A" answerType="multiple" />);
		expect(screen.getByText("A")).toHaveClass("rounded-md");
	});

	it("lights up in the screen's colour when lit, and sits raised otherwise", () => {
		const { rerender } = render(<Keycap letter="B" />);
		expect(screen.getByText("B")).toHaveClass("bg-theme-raised");

		rerender(<Keycap letter="B" lit />);
		expect(screen.getByText("B")).toHaveClass("bg-theme-soft", "border-theme");
	});
});
