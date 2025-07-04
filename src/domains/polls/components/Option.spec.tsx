import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Option, { handleOptionsChange } from "./Option";
import { createPollOption } from "~/domains/polls/models/pollOption";

describe(Option, () => {
	const mockOption = createPollOption({
		option: "JavaScript",
	});

	const mockField = {
		state: {
			value: [] as string[],
		},
		setValue: vi.fn(),
	};

	it("renders the option text correctly", () => {
		render(
			<Option
				option={mockOption}
				type="radio"
				field={mockField}
				checked={false}
			/>
		);

		expect(screen.getByText("JavaScript")).toBeInTheDocument();
		expect(screen.getByRole("radio")).toBeInTheDocument();
	});

	it("renders as a checkbox when type is checkbox", () => {
		render(
			<Option
				option={mockOption}
				type="checkbox"
				field={mockField}
				checked={false}
			/>
		);

		expect(screen.getByRole("checkbox")).toBeInTheDocument();
	});

	it("shows as checked when checked prop is true", () => {
		render(
			<Option
				option={mockOption}
				type="checkbox"
				field={mockField}
				checked={true}
			/>
		);

		expect(screen.getByRole("checkbox")).toBeChecked();
	});

	it("calls handleChange when clicked", () => {
		render(
			<Option
				option={mockOption}
				type="checkbox"
				field={mockField}
				checked={false}
			/>
		);

		fireEvent.click(screen.getByRole("checkbox"));
		expect(mockField.setValue).toHaveBeenCalled();
	});

	it("renders disabled state correctly", () => {
		render(
			<Option
				option={mockOption}
				type="checkbox"
				field={mockField}
				checked={false}
				disabled={true}
			/>
		);

		const checkbox = screen.getByRole("checkbox");
		expect(checkbox).toBeDisabled();
		expect(checkbox).toHaveClass("cursor-not-allowed");
		
		const label = screen.getByText("JavaScript");
		expect(label).toHaveClass("cursor-not-allowed", "text-gray-500");
	});

	it("renders enabled state correctly when disabled is false", () => {
		render(
			<Option
				option={mockOption}
				type="checkbox"
				field={mockField}
				checked={false}
				disabled={false}
			/>
		);

		const checkbox = screen.getByRole("checkbox");
		expect(checkbox).not.toBeDisabled();
		expect(checkbox).not.toHaveClass("cursor-not-allowed");
		
		const label = screen.getByText("JavaScript");
		expect(label).toHaveClass("cursor-pointer");
		expect(label).not.toHaveClass("cursor-not-allowed", "text-gray-500");
	});

	it("applies disabled styling to container when disabled", () => {
		const { container } = render(
			<Option
				option={mockOption}
				type="checkbox"
				field={mockField}
				checked={false}
				disabled={true}
			/>
		);

		const optionContainer = container.firstChild;
		expect(optionContainer).toHaveClass("opacity-60");
	});

	it("does not apply disabled styling to container when enabled", () => {
		const { container } = render(
			<Option
				option={mockOption}
				type="checkbox"
				field={mockField}
				checked={false}
				disabled={false}
			/>
		);

		const optionContainer = container.firstChild;
		expect(optionContainer).not.toHaveClass("opacity-60");
	});
});

describe("handleOptionsChange", () => {
	it("sets a single value for radio buttons", () => {
		const mockField = {
			state: {
				value: ["2", "3"],
			},
			setValue: vi.fn(),
		};

		const mockEvent = {
			target: {
				checked: true,
			},
		} as unknown as React.ChangeEvent<HTMLInputElement>;

		handleOptionsChange({
			e: mockEvent,
			field: mockField,
			type: "radio",
			optionValue: "1",
		});

		expect(mockField.setValue).toHaveBeenCalledWith(["1"]);
	});

	it("adds a value to the array for checkboxes when checked", () => {
		const mockField = {
			state: {
				value: ["2", "3"],
			},
			setValue: vi.fn(),
		};

		const mockEvent = {
			target: {
				checked: true,
			},
		} as unknown as React.ChangeEvent<HTMLInputElement>;

		handleOptionsChange({
			e: mockEvent,
			field: mockField,
			type: "checkbox",
			optionValue: "1",
		});

		expect(mockField.setValue).toHaveBeenCalledWith(["2", "3", "1"]);
	});

	it("removes a value from the array for checkboxes when unchecked", () => {
		const mockField = {
			state: {
				value: ["1", "2", "3"],
			},
			setValue: vi.fn(),
		};

		const mockEvent = {
			target: {
				checked: false,
			},
		} as unknown as React.ChangeEvent<HTMLInputElement>;

		handleOptionsChange({
			e: mockEvent,
			field: mockField,
			type: "checkbox",
			optionValue: "2",
		});

		expect(mockField.setValue).toHaveBeenCalledWith(["1", "3"]);
	});
});
