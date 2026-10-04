import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Select } from "./Select.ui";

const CREATORS = [
	{ value: "all", label: "all creators" },
	{ value: "brock", label: "Brock" },
	{ value: "misty", label: "Misty" },
];

describe("Select", () => {
	it("is a combobox named by its label, offering every option", () => {
		render(
			<Select
				label="Creator"
				options={CREATORS}
				value="all"
				onChange={vi.fn()}
			/>
		);

		expect(screen.getByRole("combobox", { name: "Creator" })).toHaveValue(
			"all"
		);
		expect(screen.getAllByRole("option")).toHaveLength(3);
	});

	it("reports the option that is chosen", async () => {
		const onChange = vi.fn();
		render(
			<Select
				label="Creator"
				options={CREATORS}
				value="all"
				onChange={onChange}
			/>
		);

		await userEvent.selectOptions(screen.getByRole("combobox"), "misty");

		expect(onChange).toHaveBeenCalledExactlyOnceWith("misty");
	});
});

describe("Select with a caption", () => {
	it("shows its label and note, the note describing rather than naming it", () => {
		render(
			<Select
				label="category"
				note="pick one"
				caption="shown"
				options={CREATORS}
				value="all"
				onChange={vi.fn()}
			/>
		);

		const select = screen.getByRole("combobox", { name: "category" });
		expect(select).toHaveAccessibleDescription("pick one");
		expect(screen.getByText("category").closest("span.sr-only")).toBeNull();
	});
});
