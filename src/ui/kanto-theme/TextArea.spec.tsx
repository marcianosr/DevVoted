import { useState } from "react";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { TextArea } from "./TextArea.ui";

const Typed = ({ onChange }: { onChange: (value: string) => void }) => {
	const [value, setValue] = useState("");
	return (
		<TextArea
			label="Question"
			value={value}
			onChange={(next) => {
				setValue(next);
				onChange(next);
			}}
		/>
	);
};

describe("TextArea", () => {
	it("is a textbox named by its label and described by its note", () => {
		render(
			<TextArea
				label="explanation"
				note="shown after answering · optional"
				caption="shown"
				value=""
				onChange={vi.fn()}
			/>
		);

		expect(
			screen.getByRole("textbox", { name: "explanation" })
		).toHaveAccessibleDescription("shown after answering · optional");
	});

	it("reports the whole value on every keystroke, newlines included", async () => {
		const onChange = vi.fn();
		render(<Typed onChange={onChange} />);

		await userEvent.type(screen.getByRole("textbox"), "Roses{enter}violets");

		expect(onChange).toHaveBeenLastCalledWith("Roses\nviolets");
	});

	it("grows to the rows it is given and never below its floor", () => {
		render(<TextArea label="Question" rows={8} value="" onChange={vi.fn()} />);

		expect(screen.getByRole("textbox")).toHaveAttribute("rows", "8");
		expect(screen.getByRole("textbox")).toHaveClass("min-h-32", "resize-y");
	});
});
