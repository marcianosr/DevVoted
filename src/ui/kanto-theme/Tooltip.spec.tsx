import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Tooltip } from "./Tooltip.ui";

describe("Tooltip", () => {
	it("shows what it was wrapped around", () => {
		render(
			<Tooltip label="How a correct answer is counted" hint="Single is 1.">
				34/55 correct
			</Tooltip>
		);

		expect(screen.getByText("34/55 correct")).toBeInTheDocument();
	});

	it("hangs its panel shut until the trigger is hovered", () => {
		const { container } = render(
			<Tooltip label="How a correct answer is counted" hint="Single is 1.">
				34/55 correct
			</Tooltip>
		);

		const panel = container.querySelector("[aria-hidden]");

		expect(panel).toHaveClass("invisible", "opacity-0");
		expect(panel).toHaveClass("group-hover/tip:visible");
	});

	it("opens the panel on a press, which is the only way a phone can", async () => {
		const { container } = render(
			<Tooltip label="How a correct answer is counted" hint="Single is 1.">
				34/55 correct
			</Tooltip>
		);

		await userEvent.click(screen.getByRole("button"));

		expect(container.querySelector("[aria-hidden]")).toHaveClass(
			"visible",
			"opacity-100"
		);
		expect(screen.getByRole("button")).toHaveAttribute("aria-expanded", "true");
	});

	it("shuts again on a second press", async () => {
		const { container } = render(
			<Tooltip label="How a correct answer is counted" hint="Single is 1.">
				34/55 correct
			</Tooltip>
		);

		await userEvent.click(screen.getByRole("button"));
		await userEvent.click(screen.getByRole("button"));

		expect(container.querySelector("[aria-hidden]")).toHaveClass(
			"invisible",
			"opacity-0"
		);
	});

	it("names the rule for a reader the hover panel is hidden from", () => {
		render(
			<Tooltip label="How a correct answer is counted" hint="Single is 1.">
				34/55 correct
			</Tooltip>
		);

		expect(
			screen.getByRole("button", { name: "How a correct answer is counted" })
		).toBeInTheDocument();
	});

	it("takes focus, so the rule is reachable without a pointer", () => {
		render(
			<Tooltip label="How a correct answer is counted" hint="Single is 1.">
				34/55 correct
			</Tooltip>
		);

		expect(screen.getByRole("button")).toBeInTheDocument();
	});

	it("opens rightwards by default, and leftwards from a right-hand edge", () => {
		const { container, rerender } = render(
			<Tooltip label="How a correct answer is counted" hint="Single is 1.">
				34/55 correct
			</Tooltip>
		);

		expect(container.querySelector(".absolute")).toHaveClass("left-0");

		rerender(
			<Tooltip
				label="How a correct answer is counted"
				hint="Single is 1."
				align="end"
			>
				34/55 correct
			</Tooltip>
		);

		expect(container.querySelector(".absolute")).toHaveClass("right-0");
	});

	it("widens on demand, so a table of rungs keeps each row on one line", () => {
		const { container, rerender } = render(
			<Tooltip label="How a correct answer is counted" hint="Single is 1.">
				34/55 correct
			</Tooltip>
		);

		expect(container.querySelector(".absolute")).toHaveClass("w-72");
		expect(container.querySelector(".absolute")).not.toHaveClass("sm:w-112");

		rerender(
			<Tooltip
				label="How a correct answer is counted"
				hint="Single is 1."
				width="wide"
			>
				34/55 correct
			</Tooltip>
		);

		expect(container.querySelector(".absolute")).toHaveClass("sm:w-112");
	});

	it("hands back a bare reading when there is no rule to explain", () => {
		const { container } = render(
			<Tooltip label="How a correct answer is counted">34/55 correct</Tooltip>
		);

		expect(screen.getByText("34/55 correct")).toBeInTheDocument();
		expect(container.querySelector("button")).toBeNull();
	});
});
