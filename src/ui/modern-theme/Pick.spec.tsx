import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Chip } from "./Chip.ui";
import { Pick } from "./Pick.ui";

describe("Pick", () => {
	it("toggles from a click anywhere on the row, not just on the box", async () => {
		const onToggle = vi.fn();
		render(<Pick label="AGENTS.md" checked={false} onToggle={onToggle} />);

		await userEvent.click(screen.getByText("AGENTS.md"));

		expect(onToggle).toHaveBeenCalledWith(true);
	});

	it("reports the state it is moving to, so a ticked row can be unticked", async () => {
		const onToggle = vi.fn();
		render(<Pick label="ESLint" checked onToggle={onToggle} />);

		await userEvent.click(screen.getByRole("checkbox"));

		expect(onToggle).toHaveBeenCalledWith(false);
	});

	it("strikes the name of a config picked for removal", () => {
		render(<Pick label="ESLint" checked onToggle={() => {}} />);

		expect(screen.getByText("ESLint")).toHaveClass("line-through");
	});

	it("leaves an unpicked name intact", () => {
		render(<Pick label="IndexedDB" checked={false} onToggle={() => {}} />);

		expect(screen.getByText("IndexedDB")).not.toHaveClass("line-through");
	});

	it("washes a picked row in the colour of what is about to happen to it", () => {
		const { container } = render(
			<Pick label="ESLint" checked onToggle={() => {}} />
		);

		expect(container.firstChild).toHaveClass("bg-cinnabar/5");
	});

	it("carries what the config gives beside its name", () => {
		render(
			<Pick
				label="IndexedDB"
				checked={false}
				onToggle={() => {}}
				notes={<Chip tone="celadon">+8 / correct</Chip>}
			/>
		);

		expect(screen.getByText("+8 / correct")).toBeInTheDocument();
	});
});
