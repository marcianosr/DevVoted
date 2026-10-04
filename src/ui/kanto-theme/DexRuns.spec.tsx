import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
	dexRunDetail,
	dexRunRows,
	dexRunsProps,
} from "~/test/dexRegistry.factory";

import { DexRuns, heldOutcomeOf } from "./DexRuns.ui";

const paneAt = (container: HTMLElement, index: number) => {
	const pane = container.querySelectorAll("section")[index];
	if (!(pane instanceof HTMLElement)) throw new Error(`no pane at ${index}`);

	return pane;
};

const list = (container: HTMLElement) => paneAt(container, 0);
const detail = (container: HTMLElement) => paneAt(container, 1);

const rowDated = (container: HTMLElement, date: string) => {
	const row = within(list(container)).getByText(date).closest("button");
	if (!(row instanceof HTMLElement)) throw new Error(`no row on ${date}`);

	return row;
};

describe("heldOutcomeOf", () => {
	it("names the gate that stopped the run", () => {
		expect(heldOutcomeOf("Lavender")).toBe("Lavender held");
	});
});

describe("DexRuns", () => {
	it("names the collection and counts the climbs", () => {
		render(<DexRuns {...dexRunsProps()} />);

		expect(screen.getByRole("heading", { name: "Run history" })).toBeVisible();
		expect(screen.getByText("3 runs")).toBeVisible();
	});

	it("lists every run it was given, holding none back", () => {
		const { container } = render(<DexRuns {...dexRunsProps()} />);

		expect(within(list(container)).getAllByRole("button")).toHaveLength(
			dexRunRows.length
		);
	});

	it("shows each run's date, outcome and coverage on its row", () => {
		const { container } = render(<DexRuns {...dexRunsProps()} />);
		const row = rowDated(container, "11 Sep");

		expect(row).toHaveTextContent("Lavender held");
		expect(row).toHaveTextContent("56%");
	});

	it("bands each run by the one mapping the coverage bar uses", () => {
		const { container } = render(<DexRuns {...dexRunsProps()} />);
		const rows = within(list(container));

		expect(rows.getByText("HEALTHY")).toHaveAttribute(
			"data-screen-theme",
			"viridian"
		);
		expect(rows.getByText("DANGER")).toHaveAttribute(
			"data-screen-theme",
			"cinnabar"
		);
		expect(rows.getByText("SHAKY")).toHaveAttribute(
			"data-screen-theme",
			"vermillion"
		);
	});

	it("marks the picked row as the one the panel is reading", () => {
		const { container } = render(<DexRuns {...dexRunsProps()} />);

		expect(rowDated(container, "11 Sep")).toHaveAttribute(
			"aria-current",
			"true"
		);
		expect(rowDated(container, "28 Aug")).toHaveAttribute(
			"aria-current",
			"false"
		);
	});

	it("reports which row was pressed rather than moving the panel itself", async () => {
		const onSelect = vi.fn();
		const { container } = render(<DexRuns {...dexRunsProps({ onSelect })} />);

		await userEvent.click(rowDated(container, "28 Aug"));

		expect(onSelect).toHaveBeenCalledWith("2");
	});

	it("keeps the permalink on the panel, where a row is now a press", () => {
		const { container } = render(<DexRuns {...dexRunsProps()} />);

		expect(within(list(container)).queryAllByRole("link")).toHaveLength(0);
		expect(
			within(detail(container)).getByRole("link", { name: "Open the archive" })
		).toHaveAttribute("href", "/runs/1");
	});

	it("heads the panel with the day the run ended", () => {
		const { container } = render(
			<DexRuns
				{...dexRunsProps({
					selectedId: "3",
					detail: dexRunDetail(dexRunRows[2]),
				})}
			/>
		);
		const panel = within(detail(container));

		expect(panel.getByRole("heading", { name: "22 Jul" })).toBeVisible();
		expect(panel.getByText("Pewter held")).toBeVisible();
	});

	it("says so plainly when there is no run to read", () => {
		const { container } = render(
			<DexRuns
				{...dexRunsProps({ rows: [], selectedId: null, detail: null })}
			/>
		);

		expect(
			within(detail(container)).getByText("No run to read yet.")
		).toBeVisible();
	});

	it("draws every run against the full gate ladder", () => {
		const { container } = render(<DexRuns {...dexRunsProps()} />);

		expect(
			within(list(container)).getByLabelText("4 of 13 swatches discovered")
		).toBeInTheDocument();
	});
});
