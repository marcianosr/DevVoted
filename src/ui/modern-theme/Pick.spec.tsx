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

	it("leaves a drafted name intact, since picking it is not a sentence", () => {
		const { container } = render(
			<Pick label=".ts" checked onToggle={() => {}} variant="draft" />
		);

		expect(screen.getByText(".ts")).not.toHaveClass("line-through");
		expect(container.firstChild).toHaveClass("bg-theme-soft");
	});

	it("draws a draft pick round and a removal pick square", () => {
		render(
			<Pick label=".ts" checked={false} onToggle={() => {}} variant="draft" />
		);

		expect(screen.getByRole("checkbox")).toHaveClass("rounded-full");
	});

	it("stays a checkbox under the round skin, since three can be picked", () => {
		render(
			<Pick label=".ts" checked={false} onToggle={() => {}} variant="draft" />
		);

		expect(screen.getByRole("checkbox")).toBeInTheDocument();
	});

	it("hangs a control off the end of the row when one is given", () => {
		render(
			<Pick
				label=".ts"
				checked={false}
				onToggle={() => {}}
				trailing={<button type="button">Lock .ts</button>}
			/>
		);

		expect(
			screen.getByRole("button", { name: "Lock .ts" })
		).toBeInTheDocument();
	});

	it("stays a plain row when there is nothing to unfold", () => {
		const { container } = render(
			<Pick label=".ts" checked={false} onToggle={() => {}} />
		);

		expect(container.querySelector("details")).toBeNull();
	});

	it("folds the rarity and the sentence away, the way a build row does", () => {
		const { container } = render(
			<Pick
				label=".ts"
				checked={false}
				onToggle={() => {}}
				variant="draft"
				summary="focus: typescript · ×1.25"
				explainer="TypeScript polls pay 1.25× coverage."
			/>
		);

		expect(container.querySelector("details")).not.toHaveAttribute("open");
		expect(screen.getByText("focus: typescript · ×1.25")).toBeInTheDocument();
	});

	it("keeps ticking and unfolding on separate targets", async () => {
		const onToggle = vi.fn();
		const { container } = render(
			<Pick
				label=".ts"
				checked={false}
				onToggle={onToggle}
				variant="draft"
				summary="focus: typescript · ×1.25"
			/>
		);
		const fold = container.querySelector("details") as HTMLDetailsElement;

		await userEvent.click(screen.getByText(".ts"));

		expect(onToggle).toHaveBeenCalledWith(true);
		expect(fold.open).toBe(false);
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

	it("leads the name with the slots it takes", () => {
		render(<Pick label=".ts" slots={4} checked={false} onToggle={() => {}} />);

		expect(screen.getByText("4 slots")).toBeInTheDocument();
	});

	it("leaves a shut row flat, having no size colour to tint with", () => {
		const { container } = render(
			<Pick label=".ts" slots={4} checked={false} onToggle={() => {}} />
		);

		expect((container.firstElementChild as HTMLElement).className).not.toMatch(
			/cinnabar|cerulean|viridian|legendary/
		);
	});

	it("carries a figure in a column of its own, clear of the trailing press", () => {
		render(
			<Pick
				label=".ts"
				slots={4}
				checked={false}
				onToggle={() => {}}
				value="×1.25"
				trailing={<button type="button">lock</button>}
			/>
		);

		expect(screen.getByText("×1.25")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "lock" })).toBeInTheDocument();
	});

	it("opens without taking on a grade colour", () => {
		const { container } = render(
			<Pick
				label=".ts"
				slots={4}
				checked={false}
				onToggle={() => {}}
				explainer="TS polls."
			/>
		);

		const card = container.firstElementChild as HTMLElement;
		expect(card.className).not.toMatch(/cinnabar|cerulean|viridian/);
		expect(card).toContainElement(screen.getByText("TS polls."));
	});

	it("washes a picked row in the pick's colour", () => {
		const { container } = render(
			<Pick label=".ts" slots={4} variant="draft" checked onToggle={() => {}} />
		);

		expect(container.firstElementChild).toHaveClass("bg-theme-soft");
	});

	it("stops a disabled row from being picked, and dims it", () => {
		render(
			<Pick
				label="AGENTS.md"
				slots={8}
				variant="draft"
				checked={false}
				disabled
				onToggle={() => {}}
			/>
		);

		expect(screen.getByRole("checkbox")).toBeDisabled();
	});

	it("drops the hover wash on a disabled row", () => {
		const { container } = render(
			<Pick
				label="AGENTS.md"
				variant="draft"
				checked={false}
				disabled
				onToggle={() => {}}
			/>
		);

		expect(container.firstElementChild?.className).not.toContain("hover:");
	});

	it("still opens a disabled row's detail", async () => {
		const { container } = render(
			<Pick
				label="AGENTS.md"
				variant="draft"
				checked={false}
				disabled
				onToggle={() => {}}
				value="8 slots"
				explainer="Every poll pays double."
			/>
		);

		await userEvent.click(screen.getByText("8 slots"));

		expect(container.querySelector("details")).toHaveAttribute("open");
	});
});
