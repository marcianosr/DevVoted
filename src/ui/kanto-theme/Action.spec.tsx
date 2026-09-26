import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { gateSwatchAt } from "~/test/swatchTrack.factory";

import { Action } from "./Action.ui";

const PALLET = gateSwatchAt(0);
const LABEL = "Pallet gate prep";
const READING = "2 configs · 3/4 weight";
const REFUSAL = "install at least one config";

const CURRENT = { state: "current", swatch: PALLET } as const;

describe("Action", () => {
	it("names itself by its label and the reading under it", () => {
		render(<Action label={LABEL} note={READING} onPress={() => undefined} />);

		expect(
			screen.getByRole("button", { name: `${LABEL} · ${READING}` })
		).toBeInTheDocument();
	});

	it("runs the press when it is pressed", async () => {
		const onPress = vi.fn();
		render(<Action label={LABEL} note={READING} onPress={onPress} />);

		await userEvent.click(screen.getByRole("button"));

		expect(onPress).toHaveBeenCalledOnce();
	});

	it("refuses the press when it is handed none, and states why", () => {
		render(<Action label={LABEL} note={REFUSAL} />);

		expect(screen.getByRole("button")).toBeDisabled();
		expect(screen.getByText(REFUSAL)).toBeInTheDocument();
	});

	it("wears the theme at full brightness while it is live", () => {
		render(<Action label={LABEL} onPress={() => undefined} />);

		expect(screen.getByRole("button")).toHaveClass("segment-theme");
	});

	it("keeps the screen's own ground while it is refused", () => {
		render(<Action label={LABEL} />);

		const press = screen.getByRole("button");
		expect(press).toHaveClass("bg-theme-faint");
		expect(press).not.toHaveClass("segment-theme");
	});

	it("draws the gate's mark for the bright ground while it is live", () => {
		const { container } = render(
			<Action label={LABEL} swatch={CURRENT} onPress={() => undefined} />
		);

		expect(container.querySelector("[data-swatch-theme='pallet']")).toHaveClass(
			"border-current"
		);
	});

	it("draws the gate's mark for the dark ground while it is refused", () => {
		const { container } = render(<Action label={LABEL} swatch={CURRENT} />);

		expect(container.querySelector("[data-swatch-theme='pallet']")).toHaveClass(
			"bg-theme-raised"
		);
	});

	it("carries no mark for a press that stands outside a run", () => {
		const { container } = render(
			<Action label={LABEL} onPress={() => undefined} />
		);

		expect(container.querySelector("[data-swatch-theme]")).toBeNull();
	});
});
