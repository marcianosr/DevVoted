import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
	dexAuditDetail,
	dexAuditRows,
	dexAuditsProps,
} from "~/test/dexRegistry.factory";

import { DexAudits, firesAtLabelOf, gatesLabelOf } from "./DexAudits.ui";

const paneAt = (container: HTMLElement, index: number) => {
	const pane = container.querySelectorAll("section")[index];
	if (!(pane instanceof HTMLElement)) throw new Error(`no pane at ${index}`);

	return pane;
};

const list = (container: HTMLElement) => paneAt(container, 0);
const detail = (container: HTMLElement) => paneAt(container, 1);

const lockedRow = () => {
	const row = dexAuditRows.find((candidate) => candidate.locked === true);
	if (row === undefined) throw new Error("no locked fixture audit");

	return row;
};

describe("gatesLabelOf", () => {
	it("names a single gate", () => {
		expect(gatesLabelOf([3])).toBe("gate 3");
	});

	it("names a span by its ends", () => {
		expect(gatesLabelOf([8, 9, 10])).toBe("gates 8–10");
	});

	it("reports nothing when an audit lands nowhere certain", () => {
		expect(gatesLabelOf([])).toBe("—");
	});
});

describe("DexAudits", () => {
	it("names the collection and counts what has been met", () => {
		render(<DexAudits {...dexAuditsProps()} />);

		expect(screen.getByRole("heading", { name: "Audits" })).toBeVisible();
		expect(screen.getByText("7 of 16")).toBeVisible();
	});

	it("lists every audit it was given, holding none back", () => {
		const { container } = render(<DexAudits {...dexAuditsProps()} />);

		expect(within(list(container)).getAllByRole("button")).toHaveLength(
			dexAuditRows.length
		);
	});

	it("offers one chip a gate, each counting what fires there", () => {
		render(<DexAudits {...dexAuditsProps()} />);

		expect(screen.getByRole("radio", { name: "all" })).toBeChecked();
		expect(screen.getByRole("radio", { name: "3 · 1 of 2" })).toBeVisible();
	});

	it("reports the chosen gate rather than narrowing on its own", async () => {
		const onFilter = vi.fn();
		render(<DexAudits {...dexAuditsProps({ onFilter })} />);

		await userEvent.click(screen.getByRole("radio", { name: "4 · 1 of 3" }));

		expect(onFilter).toHaveBeenCalledWith("4");
	});

	it("shows a met audit's code, name and rule on its row", () => {
		const { container } = render(<DexAudits {...dexAuditsProps()} />);
		const rows = within(list(container));

		expect(rows.getByText("402")).toBeVisible();
		expect(rows.getByText("Payment Required")).toBeVisible();
		expect(rows.getByText("paid actions cost double this gate")).toBeVisible();
	});

	it("withholds an unmet audit, code included", () => {
		const { container } = render(<DexAudits {...dexAuditsProps()} />);

		expect(
			within(list(container)).getByText("Locked audit")
		).toBeInTheDocument();
		expect(screen.queryByText("451")).not.toBeInTheDocument();
	});

	it("says where a rule can land rather than how often it has fired", () => {
		const { container } = render(<DexAudits {...dexAuditsProps()} />);

		expect(within(list(container)).getByText("gates 8–10")).toBeVisible();
		expect(screen.queryByText(/fired/)).not.toBeInTheDocument();
	});

	it("heads the panel with the audit's own HTTP code", () => {
		const { container } = render(<DexAudits {...dexAuditsProps()} />);

		expect(
			within(detail(container)).getByRole("heading", { name: "402" })
		).toBeVisible();
	});

	it("states where an audit you have not met can still catch you", () => {
		const locked = lockedRow();
		const { container } = render(
			<DexAudits
				{...dexAuditsProps({
					selectedId: locked.id,
					detail: dexAuditDetail(locked),
				})}
			/>
		);
		const panel = within(detail(container));

		expect(panel.getByRole("heading", { name: "???" })).toBeVisible();
		expect(panel.getByText(firesAtLabelOf(locked.gates))).toBeVisible();
	});

	it("reports which row was pressed rather than moving the panel itself", async () => {
		const onSelect = vi.fn();
		const { container } = render(
			<DexAudits {...dexAuditsProps({ onSelect })} />
		);

		await userEvent.click(within(list(container)).getAllByRole("button")[1]);

		expect(onSelect).toHaveBeenCalledWith(dexAuditRows[1].id);
	});

	it("says so plainly when no audit fires at the chosen gate", () => {
		const { container } = render(
			<DexAudits
				{...dexAuditsProps({ rows: [], selectedId: null, detail: null })}
			/>
		);

		expect(
			within(detail(container)).getByText("No audit fires at this gate.")
		).toBeVisible();
	});
});
