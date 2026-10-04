import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
	dexSwatchDetail,
	dexSwatchRows,
	dexSwatchesProps,
} from "~/test/dexRegistry.factory";

import { DexSwatches } from "./DexSwatches.ui";

const paneAt = (container: HTMLElement, index: number) => {
	const pane = container.querySelectorAll("section")[index];
	if (!(pane instanceof HTMLElement)) throw new Error(`no pane at ${index}`);

	return pane;
};

const list = (container: HTMLElement) => paneAt(container, 0);
const detail = (container: HTMLElement) => paneAt(container, 1);

const rowNamed = (container: HTMLElement, name: string) => {
	const row = within(list(container)).getByText(name).closest("button");
	if (!(row instanceof HTMLElement)) throw new Error(`no row named ${name}`);

	return row;
};

describe("DexSwatches", () => {
	it("names the collection and counts what has been swept", () => {
		render(<DexSwatches {...dexSwatchesProps()} />);

		expect(screen.getByRole("heading", { name: "swatches" })).toBeVisible();
		expect(screen.getByText("4 of 13")).toBeVisible();
	});

	it("shows one row per gate in the roster", () => {
		const { container } = render(<DexSwatches {...dexSwatchesProps()} />);

		expect(within(list(container)).getAllByRole("button")).toHaveLength(
			dexSwatchRows().length
		);
	});

	it("names each swatch after the Kanto city its gate is named for", () => {
		const { container } = render(<DexSwatches {...dexSwatchesProps()} />);

		expect(within(list(container)).getByText("Vermilion")).toBeVisible();
	});

	it("marks an earned gate swept and an unearned one by its number", () => {
		const { container } = render(<DexSwatches {...dexSwatchesProps()} />);

		expect(within(list(container)).getAllByText("swept")).toHaveLength(4);
		expect(within(list(container)).getByText("gate 7")).toBeVisible();
	});

	it("reports which row was pressed rather than moving the panel itself", async () => {
		const onSelect = vi.fn();
		const { container } = render(
			<DexSwatches {...dexSwatchesProps({ onSelect })} />
		);

		await userEvent.click(rowNamed(container, "Vermilion"));

		expect(onSelect).toHaveBeenCalledWith("3");
	});

	it("states how an unearned swatch is minted, which is the whole of its rule", () => {
		const unearned = dexSwatchRows()[7];
		const { container } = render(
			<DexSwatches
				{...dexSwatchesProps({
					selectedId: unearned.id,
					detail: dexSwatchDetail(unearned),
				})}
			/>
		);

		expect(
			within(detail(container)).getByText(
				"Cover every change this gate ships to mint it."
			)
		).toBeVisible();
	});

	it("says a swatch is minted once its gate has been swept", () => {
		const { container } = render(<DexSwatches {...dexSwatchesProps()} />);

		expect(
			within(detail(container)).getByText("Minted. You covered every change.")
		).toBeVisible();
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
