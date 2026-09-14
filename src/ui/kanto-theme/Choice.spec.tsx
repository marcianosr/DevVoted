import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Choice } from "./Choice.ui";

describe("Choice", () => {
	it("shows its keycap letter beside its answer", () => {
		render(<Choice letter="A">at(-1)</Choice>);

		expect(screen.getByText("A")).toBeInTheDocument();
		expect(screen.getByText("at(-1)")).toBeInTheDocument();
	});

	it("gives the keycap a front wall heavier than its other edges", () => {
		render(<Choice letter="A">at(-1)</Choice>);

		expect(screen.getByText("A")).toHaveClass("border", "border-b-4");
	});

	it("renders a plain row when there is nothing to pick", () => {
		render(<Choice letter="A">at(-1)</Choice>);

		expect(screen.queryByRole("button")).not.toBeInTheDocument();
	});

	it("becomes a button once it can be picked", async () => {
		const onPick = vi.fn();
		render(
			<Choice letter="A" onPick={onPick}>
				at(-1)
			</Choice>
		);

		await userEvent.click(screen.getByRole("button"));

		expect(onPick).toHaveBeenCalledOnce();
	});

	it("reports whether it is the picked answer", () => {
		render(
			<Choice letter="B" picked onPick={vi.fn()}>
				slice(-1)
			</Choice>
		);

		expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "true");
	});

	it("leaves an unpicked answer unpressed", () => {
		render(
			<Choice letter="B" onPick={vi.fn()}>
				slice(-1)
			</Choice>
		);

		expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "false");
	});

	it("fills the row and themes the keycap once picked", () => {
		render(
			<Choice letter="A" picked>
				at(-1)
			</Choice>
		);

		expect(screen.getByText("A")).toHaveClass(
			"border-theme",
			"text-theme-soft"
		);
		expect(screen.getByText("at(-1)").parentElement).toHaveClass(
			"bg-theme-soft"
		);
	});

	it("greys the keycap while unpicked, rather than theming it", () => {
		render(<Choice letter="A">at(-1)</Choice>);

		expect(screen.getByText("A")).toHaveClass(
			"border-edge-strong",
			"text-pewter"
		);
		expect(screen.getByText("A")).not.toHaveClass("border-theme");
	});

	it("pads the row vertically only, so a column aligns on the caps", () => {
		render(<Choice letter="A">at(-1)</Choice>);

		const row = screen.getByText("at(-1)").parentElement;
		expect(row).toHaveClass("py-2.5");
		expect(row?.className).not.toMatch(/\bpx-/);
	});

	it("covers a sealed answer with a bar instead of its text", () => {
		const { container } = render(
			<Choice letter="D" seal={{ price: "4 KB" }} />
		);

		expect(container.querySelector(".h-5.rounded-md")).toBeInTheDocument();
		expect(screen.getByText("unseal")).toBeInTheDocument();
		expect(screen.getByText("4 KB")).toBeInTheDocument();
	});

	it.each([
		["A", "w-28"],
		["B", "w-20"],
		["C", "w-24"],
		["D", "w-16"],
	])("widths %s's seal bar off the letter, not the answer", (letter, width) => {
		const { container } = render(
			<Choice letter={letter} seal={{ price: "4 KB" }} />
		);

		expect(container.querySelector(`.${width}`)).toBeInTheDocument();
	});

	it("names a sealed row for a screen reader without naming the answer", async () => {
		const onPick = vi.fn();
		render(<Choice letter="D" seal={{ price: "4 KB" }} onPick={onPick} />);

		await userEvent.click(
			screen.getByRole("button", { name: "D, sealed answer" })
		);

		expect(onPick).toHaveBeenCalledOnce();
	});

	it("keeps unseal a separate control from the pick area", async () => {
		const onPick = vi.fn();
		const onUnseal = vi.fn();
		render(
			<Choice letter="D" seal={{ price: "4 KB", onUnseal }} onPick={onPick} />
		);

		await userEvent.click(screen.getByRole("button", { name: "unseal" }));

		expect(onUnseal).toHaveBeenCalledOnce();
		expect(onPick).not.toHaveBeenCalled();
	});

	it("disables unseal when the player cannot afford it", () => {
		render(<Choice letter="D" seal={{ price: "4 KB" }} />);

		expect(screen.getByRole("button", { name: "unseal" })).toBeDisabled();
	});

	it("hands the answer text to Typography rather than styling it here", () => {
		render(<Choice letter="A">at(-1)</Choice>);

		expect(screen.getByText("at(-1)")).toHaveClass(
			"text-theme-faint",
			"text-base"
		);
	});

	it.each([
		["single", "rounded-full"],
		["multiple", "rounded-md"],
	] as const)(
		"caps a %s-answer option with the shape it was answered with",
		(answerType, shape) => {
			render(
				<Choice letter="A" answerType={answerType}>
					justify-content
				</Choice>
			);

			expect(screen.getByText("A")).toHaveClass(shape);
		}
	);

	it("strikes a ruled-out answer through with a red line", () => {
		render(
			<Choice letter="C" crossedOut>
				party.pop()
			</Choice>
		);

		expect(screen.getByText("party.pop()").parentElement).toHaveClass(
			"line-through",
			"decoration-cinnabar"
		);
	});

	it("leaves an answer that is still in play unstruck", () => {
		render(<Choice letter="C">party.pop()</Choice>);

		expect(screen.getByText("party.pop()").parentElement).not.toHaveClass(
			"line-through"
		);
	});

	it("refuses the press once the linter has ruled the answer out", async () => {
		const onPick = vi.fn();
		render(
			<Choice letter="C" crossedOut onPick={onPick}>
				party.pop()
			</Choice>
		);

		await userEvent.click(screen.getByRole("button"));

		expect(screen.getByRole("button")).toBeDisabled();
		expect(onPick).not.toHaveBeenCalled();
	});

	it("tells a screen reader the answer is out, rather than only drawing it", () => {
		render(
			<Choice letter="C" crossedOut>
				party.pop()
			</Choice>
		);

		expect(screen.getByText("ruled out")).toHaveClass("sr-only");
	});

	it("reads as a radio until it is told the poll takes several", () => {
		render(<Choice letter="A">justify-content</Choice>);

		expect(screen.getByText("A")).toHaveClass("rounded-full");
	});
});
