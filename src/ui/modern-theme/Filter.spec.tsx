import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Filter, FilterSelect, type FilterOption } from "./Filter.ui";

const OPTIONS: readonly FilterOption[] = [
	{ id: "seen", label: "seen", count: "23" },
	{ id: "all", label: "all", count: "418" },
	{ id: "bare", label: "bare" },
];

const CATEGORIES = [
	{ id: "any", label: "any category" },
	{ id: "css", label: "css" },
];

describe("Filter", () => {
	it("presses exactly the one narrowing the list", () => {
		render(
			<Filter
				options={OPTIONS}
				activeId="all"
				onSelect={() => {}}
				label="Seen"
			/>
		);

		expect(
			screen
				.getAllByRole("button")
				.map((pill) => pill.getAttribute("aria-pressed"))
		).toEqual(["false", "true", "false"]);
	});

	it("reports the filter you asked for", async () => {
		const onSelect = vi.fn();
		render(
			<Filter
				options={OPTIONS}
				activeId="all"
				onSelect={onSelect}
				label="Seen"
			/>
		);

		await userEvent.click(screen.getByRole("button", { name: "seen · 23" }));

		expect(onSelect).toHaveBeenCalledWith("seen");
	});

	it("hangs the tally off the label, so the pill reads as one phrase", () => {
		render(
			<Filter
				options={OPTIONS}
				activeId="all"
				onSelect={() => {}}
				label="Seen"
			/>
		);

		expect(
			screen.getByRole("button", { name: "all · 418" })
		).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "bare" })).toBeInTheDocument();
	});
});

describe("FilterSelect", () => {
	it("stays a real select, so the platform supplies the popup", () => {
		render(
			<FilterSelect
				options={CATEGORIES}
				value="any"
				onChange={() => {}}
				label="Category"
			/>
		);

		expect(screen.getByRole("combobox", { name: "Category" })).toHaveValue(
			"any"
		);
	});

	it("reports the option's id, not the words on it", async () => {
		const onChange = vi.fn();
		render(
			<FilterSelect
				options={CATEGORIES}
				value="any"
				onChange={onChange}
				label="Category"
			/>
		);

		await userEvent.selectOptions(screen.getByRole("combobox"), "css");

		expect(onChange).toHaveBeenCalledWith("css");
	});
});
