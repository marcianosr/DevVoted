import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { PollOptionList } from "./PollOptionList.ui";
import type { PollAnsweringOption } from "./PollOptionList.ui";

const options: PollAnsweringOption[] = [
	{ id: "1", text: "Banjo" },
	{ id: "2", text: "Kazooie" },
	{ id: "3", text: "Tooie", disabled: true },
];

describe(PollOptionList.name, () => {
	it("renders radio inputs for single-answer polls", () => {
		render(
			<PollOptionList
				options={options}
				selectedIds={[]}
				answerType="single"
				onToggle={vi.fn()}
			/>
		);
		expect(screen.getAllByRole("radio")).toHaveLength(3);
	});

	it("renders checkbox inputs for multiple-answer polls", () => {
		render(
			<PollOptionList
				options={options}
				selectedIds={[]}
				answerType="multiple"
				onToggle={vi.fn()}
			/>
		);
		expect(screen.getAllByRole("checkbox")).toHaveLength(3);
	});

	it("calls onToggle with the option id when an option is selected", () => {
		const onToggle = vi.fn();
		render(
			<PollOptionList
				options={options}
				selectedIds={[]}
				answerType="single"
				onToggle={onToggle}
			/>
		);
		fireEvent.click(screen.getByLabelText("Kazooie"));
		expect(onToggle).toHaveBeenCalledWith("2");
	});

	it("disables options flagged as disabled", () => {
		render(
			<PollOptionList
				options={options}
				selectedIds={[]}
				answerType="single"
				onToggle={vi.fn()}
			/>
		);
		expect(screen.getByLabelText("Tooie")).toBeDisabled();
	});

	it("reflects the selected option as checked", () => {
		render(
			<PollOptionList
				options={options}
				selectedIds={["1"]}
				answerType="single"
				onToggle={vi.fn()}
			/>
		);
		expect(screen.getByLabelText("Banjo")).toBeChecked();
	});

	it("shows the removing config's card beside a removed option", () => {
		const removedOptions: PollAnsweringOption[] = [
			{ id: "1", text: "Banjo" },
			{
				id: "2",
				text: "Kazooie",
				disabled: true,
				removedByConfig: {
					name: "ESLint",
					rarity: "uncommon",
					description: "Disables 1 wrong option.",
				},
			},
		];
		render(
			<PollOptionList
				options={removedOptions}
				selectedIds={[]}
				answerType="single"
				onToggle={vi.fn()}
			/>
		);
		expect(screen.getByText("ESLint")).toBeInTheDocument();
		expect(screen.getByText("(uncommon)")).toBeInTheDocument();
	});
});
