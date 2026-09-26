import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { dexSwatchesProps } from "~/test/dexRegistry.factory";

import { DexSwatches } from "./DexSwatches.ui";

describe("DexSwatches", () => {
	it("names the collection and counts what has been swept", () => {
		render(<DexSwatches {...dexSwatchesProps()} />);

		expect(screen.getByRole("heading", { name: "swatches" })).toBeVisible();
		expect(screen.getByText("4 of 13")).toBeVisible();
	});

	it("shows one card per gate in the roster", () => {
		render(<DexSwatches {...dexSwatchesProps()} />);

		expect(screen.getByText("Pallet")).toBeVisible();
		expect(screen.getByText("Champion")).toBeVisible();
	});

	it("uses the gym-badge names the run screens use, not colour names", () => {
		render(<DexSwatches {...dexSwatchesProps()} />);

		expect(screen.getByText("Thunder")).toBeVisible();
		expect(screen.queryByText("Vermilion")).not.toBeInTheDocument();
	});

	it("marks an earned gate swept and an unearned one by its number", () => {
		render(<DexSwatches {...dexSwatchesProps()} />);

		expect(screen.getAllByText("swept")).toHaveLength(4);
		expect(screen.getByText("gate 7")).toBeVisible();
	});

	it("states that clearing a gate alone does not mint its swatch", () => {
		render(
			<DexSwatches
				{...dexSwatchesProps({ note: "Clearing alone does not mint it." })}
			/>
		);

		expect(screen.getByText("Clearing alone does not mint it.")).toBeVisible();
	});
});
