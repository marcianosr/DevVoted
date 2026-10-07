import { useState } from "react";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { TextField } from "./TextField.ui";

const Typed = ({ onChange }: { onChange: (value: string) => void }) => {
	const [value, setValue] = useState("");
	return (
		<TextField
			label="CodeSandbox"
			value={value}
			onChange={(next) => {
				setValue(next);
				onChange(next);
			}}
		/>
	);
};

describe("TextField", () => {
	it("is a textbox named by its label and described by its note, which stays out of the name", () => {
		render(
			<TextField
				label="CodeSandbox"
				note="optional"
				caption="shown"
				value=""
				onChange={vi.fn()}
			/>
		);

		const field = screen.getByRole("textbox", { name: "CodeSandbox" });
		expect(field).toHaveAccessibleDescription("optional");
		expect(screen.getByText("CodeSandbox").closest("label")).not.toHaveClass(
			"sr-only"
		);
	});

	it("keeps a hidden caption for the reader alone", () => {
		render(<TextField label="answer A" value="" onChange={vi.fn()} />);

		expect(
			screen.getByRole("textbox", { name: "answer A" })
		).toBeInTheDocument();
		expect(screen.getByText("answer A").closest("span.sr-only")).not.toBeNull();
	});

	it("reports the whole value on every keystroke", async () => {
		const onChange = vi.fn();
		render(<Typed onChange={onChange} />);

		await userEvent.type(screen.getByRole("textbox"), "https://");

		expect(onChange).toHaveBeenLastCalledWith("https://");
	});

	it("can ask for a url, and caps its length", () => {
		render(
			<TextField
				label="CodeSandbox"
				type="url"
				maxLength={500}
				value=""
				onChange={vi.fn()}
			/>
		);

		expect(screen.getByRole("textbox")).toHaveAttribute("type", "url");
		expect(screen.getByRole("textbox")).toHaveAttribute("maxlength", "500");
	});

	it("grows to a roomier box and type size when asked for large", () => {
		render(
			<TextField label="answer 1" value="" size="lg" onChange={vi.fn()} />
		);

		const input = screen.getByRole("textbox", { name: "answer 1" });
		expect(input).toHaveClass("text-sm");
		expect(input.parentElement).toHaveClass("h-11");
	});
});
