import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
	dexConfigCards,
	dexConfigDetail,
	dexConfigsProps,
} from "~/test/dexRegistry.factory";

import { DexConfigs } from "./DexConfigs.ui";

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

const cardNamed = (id: string) => {
	const card = dexConfigCards.find((entry) => entry.id === id);
	if (card === undefined) throw new Error(`no fixture card ${id}`);

	return card;
};

describe("DexConfigs", () => {
	it("names the collection and counts the deck against the roster", () => {
		render(<DexConfigs {...dexConfigsProps()} />);

		expect(screen.getByRole("heading", { name: "configs" })).toBeVisible();
		expect(screen.getByText("6 of 8")).toBeVisible();
	});

	it("lists every entry it was given, holding none back", () => {
		const { container } = render(<DexConfigs {...dexConfigsProps()} />);

		expect(within(list(container)).getAllByRole("button")).toHaveLength(
			dexConfigCards.length
		);
	});

	it("arrives on the filter that shows everything", () => {
		render(<DexConfigs {...dexConfigsProps()} />);

		expect(screen.getByRole("radio", { name: "all" })).toBeChecked();
	});

	it("offers one chip a weight, each counting its own held against its own total", () => {
		render(<DexConfigs {...dexConfigsProps()} />);

		expect(screen.getByRole("radio", { name: "1 · 2 of 3" })).toBeVisible();
		expect(screen.getByRole("radio", { name: "2 · 4 of 5" })).toBeVisible();
	});

	it("reports the chosen weight rather than narrowing on its own", async () => {
		const onFilter = vi.fn();
		render(<DexConfigs {...dexConfigsProps({ onFilter })} />);

		await userEvent.click(screen.getByRole("radio", { name: "2 · 4 of 5" }));

		expect(onFilter).toHaveBeenCalledWith("2");
	});

	it("leads a row with its weight block and trails it with its figure and ladder", () => {
		const { container } = render(<DexConfigs {...dexConfigsProps()} />);
		const row = rowNamed(container, ".js");

		expect(row.firstElementChild).toHaveTextContent("1");
		expect(row).toHaveTextContent("×1.25");
		expect(row).toHaveTextContent("v5");
	});

	it("withholds the name of a config you have not earned", () => {
		const { container } = render(<DexConfigs {...dexConfigsProps()} />);

		expect(within(list(container)).getAllByText("???")).toHaveLength(2);
	});

	it("marks the picked row as the one the panel is reading", () => {
		const { container } = render(<DexConfigs {...dexConfigsProps()} />);

		expect(rowNamed(container, ".js")).toHaveAttribute("aria-current", "true");
		expect(rowNamed(container, "ESLint")).toHaveAttribute(
			"aria-current",
			"false"
		);
	});

	it("reports which row was pressed rather than moving the panel itself", async () => {
		const onSelect = vi.fn();
		const { container } = render(
			<DexConfigs {...dexConfigsProps({ onSelect })} />
		);

		await userEvent.click(rowNamed(container, "ESLint"));

		expect(onSelect).toHaveBeenCalledWith("eslint");
	});

	it("heads the panel with the config's own name", () => {
		const { container } = render(<DexConfigs {...dexConfigsProps()} />);

		expect(
			within(detail(container)).getByRole("heading", { name: ".js" })
		).toBeVisible();
	});

	it("states a granted config's effect and where it came from, with no press", () => {
		const { container } = render(<DexConfigs {...dexConfigsProps()} />);
		const panel = within(detail(container));

		expect(panel.getByText(/polls reward/)).toBeVisible();
		expect(panel.getByText("Starter config · v1 of 5")).toBeVisible();
		expect(
			panel.queryByRole("button", { name: /Expand/ })
		).not.toBeInTheDocument();
	});

	it("states both unlock paths of a config you have not earned", () => {
		const { container } = render(
			<DexConfigs
				{...dexConfigsProps({
					selectedId: "lock",
					detail: dexConfigDetail(cardNamed("lock")),
				})}
			/>
		);
		const panel = within(detail(container));

		expect(panel.getByText("unlock · Lock 5 shop offers")).toBeVisible();
		expect(panel.getByText("2/5")).toBeVisible();
		expect(panel.getByText("43/550")).toBeVisible();
	});

	it("withholds the name of a config you have not earned from the panel too", () => {
		const { container } = render(
			<DexConfigs
				{...dexConfigsProps({
					selectedId: "lock",
					detail: dexConfigDetail(cardNamed("lock")),
				})}
			/>
		);

		expect(
			within(detail(container)).getByRole("heading", { name: "???" })
		).toBeVisible();
	});

	it("says so plainly when the chosen weight holds nothing", () => {
		const { container } = render(
			<DexConfigs
				{...dexConfigsProps({
					filter: "8",
					rows: [],
					selectedId: null,
					detail: null,
				})}
			/>
		);

		expect(
			within(detail(container)).getByText("No config at this weight yet.")
		).toBeVisible();
	});

	it("states the collection's rule in the footer", () => {
		render(<DexConfigs {...dexConfigsProps()} />);

		expect(
			screen.getByText(
				"Configs in the deck can be dealt into a hand or offered in the shop."
			)
		).toBeVisible();
	});
});
