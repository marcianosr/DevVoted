import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Choice } from "./Choice.ui";

const props = {
	name: "answer",
	letter: "A",
	label: "arr.slice(-2)",
	checked: false,
	onChange: () => {},
};

describe("Choice", () => {
	it("names the radio by its letter and its answer, the way a player reads it out", () => {
		render(<Choice {...props} />);

		expect(
			screen.getByRole("radio", { name: "A arr.slice(-2)" })
		).toBeInTheDocument();
	});

	it("keeps the radio in the accessibility tree while the letter stands in for it", () => {
		render(<Choice {...props} />);

		expect(screen.getByRole("radio")).toHaveClass("sr-only", "peer");
		expect(screen.getByText("A")).toBeInTheDocument();
	});

	it("reports the new state when the card is clicked", async () => {
		const onChange = vi.fn();
		render(<Choice {...props} onChange={onChange} />);

		await userEvent.click(screen.getByText("arr.slice(-2)"));

		expect(onChange).toHaveBeenCalledWith(true);
	});

	it("strikes out a blocked answer and names what blocked it", () => {
		render(
			<Choice {...props} label="arr.slice(2)" blocked note="blocked · ESLint" />
		);

		expect(screen.getByText("arr.slice(2)")).toHaveClass("line-through");
		expect(screen.getByText("blocked · ESLint")).toHaveClass("text-cinnabar");
	});

	it("refuses the click on a blocked answer", async () => {
		const onChange = vi.fn();
		render(<Choice {...props} onChange={onChange} blocked />);

		await userEvent.click(screen.getByText("arr.slice(-2)"));

		expect(onChange).not.toHaveBeenCalled();
		expect(screen.getByRole("radio")).toBeDisabled();
	});

	it("carries the picked state on the input, so the browser owns the tint", () => {
		render(<Choice {...props} checked />);

		expect(screen.getByRole("radio")).toBeChecked();
	});
});
