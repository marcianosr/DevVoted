import { useState } from "react";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { SearchField } from "./SearchField.ui";

const Typed = ({ onChange }: { onChange: (value: string) => void }) => {
	const [value, setValue] = useState("");
	return (
		<SearchField
			label="Search questions"
			value={value}
			placeholder="search questions…"
			onChange={(next) => {
				setValue(next);
				onChange(next);
			}}
		/>
	);
};

describe("SearchField", () => {
	it("is a search box named by its label, with the label kept off the screen", () => {
		render(
			<SearchField label="Search questions" value="" onChange={vi.fn()} />
		);

		expect(
			screen.getByRole("searchbox", { name: "Search questions" })
		).toBeInTheDocument();
		expect(screen.getByText("Search questions")).toHaveClass("sr-only");
	});

	it("reports the whole value on every keystroke", async () => {
		const onChange = vi.fn();
		render(<Typed onChange={onChange} />);

		await userEvent.type(screen.getByRole("searchbox"), "flex");

		expect(onChange).toHaveBeenLastCalledWith("flex");
		expect(screen.getByRole("searchbox")).toHaveValue("flex");
	});

	it("shows its placeholder while empty", () => {
		render(
			<SearchField
				label="Search questions"
				value=""
				placeholder="search questions…"
				onChange={vi.fn()}
			/>
		);

		expect(
			screen.getByPlaceholderText("search questions…")
		).toBeInTheDocument();
	});
});
