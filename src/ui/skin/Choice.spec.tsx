import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Choice } from "./Choice.ui";

const props = {
	name: "answer",
	label: "arr.slice(-2)",
	checked: false,
	onChange: () => {},
};

describe("Choice", () => {
	it("renders a radio when only one answer is allowed", () => {
		render(<Choice {...props} />);

		expect(
			screen.getByRole("radio", { name: "arr.slice(-2)" })
		).toBeInTheDocument();
	});

	it("renders a checkbox when several answers are allowed", () => {
		render(<Choice {...props} multiple />);

		expect(screen.getByRole("checkbox")).toBeInTheDocument();
	});

	it("tints the row it has picked", () => {
		render(<Choice {...props} checked />);

		expect(screen.getByText("arr.slice(-2)").closest("label")).toHaveClass(
			"bg-theme-soft"
		);
	});

	it("reports the new state when the row is clicked", async () => {
		const onChange = vi.fn();
		render(<Choice {...props} onChange={onChange} />);

		await userEvent.click(screen.getByText("arr.slice(-2)"));

		expect(onChange).toHaveBeenCalledWith(true);
	});

	it("strikes out a blocked option and refuses the click", async () => {
		const onChange = vi.fn();
		render(
			<Choice
				{...props}
				onChange={onChange}
				disabled
				note="blocked by ESLint · 16 KB"
			/>
		);

		expect(screen.getByText("arr.slice(-2)")).toHaveClass("line-through");
		expect(screen.getByText("blocked by ESLint · 16 KB")).toHaveClass(
			"text-cinnabar"
		);

		await userEvent.click(screen.getByText("arr.slice(-2)"));
		expect(onChange).not.toHaveBeenCalled();
	});
});
