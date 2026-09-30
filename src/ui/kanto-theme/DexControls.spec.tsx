import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
	dexControlDetail,
	dexControlRows,
	dexControlsProps,
} from "~/test/dexRegistry.factory";

import { DexControls } from "./DexControls.ui";

const paneAt = (container: HTMLElement, index: number) => {
	const pane = container.querySelectorAll("section")[index];
	if (!(pane instanceof HTMLElement)) throw new Error(`no pane at ${index}`);

	return pane;
};

const list = (container: HTMLElement) => paneAt(container, 0);
const detail = (container: HTMLElement) => paneAt(container, 1);

const rowTitled = (title: string) => {
	const row = dexControlRows.find((candidate) => candidate.title === title);
	if (row === undefined) throw new Error(`no fixture service ${title}`);

	return row;
};

describe("DexControls", () => {
	it("heads one section with what the account has earned of the whole roster", () => {
		render(<DexControls {...dexControlsProps()} />);

		expect(screen.getByRole("heading", { name: "services" })).toBeVisible();
		expect(screen.getByText("1 of 8")).toBeVisible();
		expect(screen.getByText("earned once · carried per run")).toBeVisible();
	});

	it("lists every service on the roster in one list, by name", () => {
		const { container } = render(<DexControls {...dexControlsProps()} />);

		for (const row of dexControlRows) {
			expect(within(list(container)).getByText(row.title)).toBeVisible();
		}
	});

	it("offers no filter: eight rows need no narrowing (ADR-115 D10)", () => {
		render(<DexControls {...dexControlsProps()} />);

		expect(screen.queryByRole("radio")).not.toBeInTheDocument();
	});

	it("shows an earned service's name, where it is bought and what it costs", () => {
		const { container } = render(<DexControls {...dexControlsProps()} />);
		const rows = within(list(container));

		expect(rows.getByText("Rebuild the registry")).toBeVisible();
		expect(rows.getAllByText("Every shop · this visit").length).toBeGreaterThan(
			0
		);
		expect(rows.getByText("from 4 KB, doubling")).toBeVisible();
	});

	it("names a locked service and states how it is earned, in place of a price", () => {
		const { container } = render(<DexControls {...dexControlsProps()} />);
		const rows = within(list(container));

		expect(rows.getByText("Boot Cache")).toBeVisible();
		expect(rows.getByText("unlock · Bank 256 KB in one run")).toBeVisible();
		expect(screen.queryByText("not for sale yet")).not.toBeInTheDocument();
	});

	it("marks every locked service with a ? where its glyph would be", () => {
		const { container } = render(<DexControls {...dexControlsProps()} />);

		expect(within(list(container)).getAllByText("?")).toHaveLength(
			dexControlRows.filter((row) => row.locked === true).length
		);
	});

	it("names no gate on a row, since the shop is what stages a service", () => {
		const { container } = render(<DexControls {...dexControlsProps()} />);

		expect(
			within(list(container)).queryByText(/^gates? \d/)
		).not.toBeInTheDocument();
	});

	it("heads the panel with the service's own title", () => {
		const { container } = render(<DexControls {...dexControlsProps()} />);

		expect(
			within(detail(container)).getByRole("heading", {
				name: "Rebuild the registry",
			})
		).toBeVisible();
	});

	it("states when a service can be bought, which no row has room for", () => {
		const { container } = render(<DexControls {...dexControlsProps()} />);

		expect(
			within(detail(container)).getByText(
				"On sale in every shop from the first gate."
			)
		).toBeVisible();
	});

	it("states how a locked service is earned in the panel too", () => {
		const bootCache = rowTitled("Boot Cache");
		const { container } = render(
			<DexControls
				{...dexControlsProps({
					selectedId: bootCache.id,
					detail: dexControlDetail(bootCache),
				})}
			/>
		);

		expect(
			within(detail(container)).getByText("unlock · Bank 256 KB in one run")
		).toBeVisible();
	});

	it("reports which row was pressed rather than moving the panel itself", async () => {
		const onSelect = vi.fn();
		const { container } = render(
			<DexControls {...dexControlsProps({ onSelect })} />
		);

		await userEvent.click(within(list(container)).getAllByRole("button")[1]);

		expect(onSelect).toHaveBeenCalledWith(dexControlRows[1].id);
	});

	it("keeps one footer for the whole roster", () => {
		const props = dexControlsProps();
		render(<DexControls {...props} />);

		expect(screen.getByText(props.note)).toBeVisible();
	});
});
