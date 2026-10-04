import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
	dexPollDetail,
	dexPollFixtures,
	dexPollsProps,
} from "~/test/dexRegistry.factory";

import { DexPolls } from "./DexPolls.ui";

const paneAt = (container: HTMLElement, index: number) => {
	const pane = container.querySelectorAll("section")[index];
	if (!(pane instanceof HTMLElement)) throw new Error(`no pane at ${index}`);

	return pane;
};

const list = (container: HTMLElement) => paneAt(container, 0);
const detail = (container: HTMLElement) => paneAt(container, 1);

const pollNumbered = (number: string) => {
	const poll = dexPollFixtures.find((entry) => entry.number === number);
	if (poll === undefined) throw new Error(`no fixture poll ${number}`);

	return poll;
};

const rowNumbered = (container: HTMLElement, number: string) => {
	const row = within(list(container)).getByText(number).closest("button");
	if (!(row instanceof HTMLElement)) throw new Error(`no row ${number}`);

	return row;
};

describe("DexPolls", () => {
	it("names the collection and counts it against the roster", () => {
		render(<DexPolls {...dexPollsProps()} />);

		expect(screen.getByRole("heading", { name: "Polls seen" })).toBeVisible();
		expect(screen.getByText("187 of 423")).toBeVisible();
	});

	it("lists every poll it was given, holding none back", () => {
		const { container } = render(<DexPolls {...dexPollsProps()} />);

		expect(within(list(container)).getAllByRole("button")).toHaveLength(
			dexPollFixtures.length
		);
	});

	it("offers one chip a category, each counting its own seen against its own total", () => {
		render(<DexPolls {...dexPollsProps()} />);

		expect(screen.getByRole("radio", { name: "all" })).toBeChecked();
		expect(
			screen.getByRole("radio", { name: "TypeScript · 1 of 2" })
		).toBeVisible();
	});

	it("reports the chosen category rather than narrowing on its own", async () => {
		const onFilter = vi.fn();
		render(<DexPolls {...dexPollsProps({ onFilter })} />);

		await userEvent.click(
			screen.getByRole("radio", { name: "JavaScript · 2 of 2" })
		);

		expect(onFilter).toHaveBeenCalledWith("js");
	});

	it("leads a row with its dex number, so the list reads as a roster", () => {
		const { container } = render(<DexPolls {...dexPollsProps()} />);

		expect(rowNumbered(container, "#001").firstElementChild).toHaveTextContent(
			"#001"
		);
	});

	it("shows a seen poll's repeats and score on its row", () => {
		const { container } = render(<DexPolls {...dexPollsProps()} />);
		const row = rowNumbered(container, "#001");

		expect(row).toHaveTextContent("answered ×4");
		expect(row).toHaveTextContent("3/4");
	});

	it("withholds a poll never dealt to you behind ??? alone, with no prose", () => {
		const { container } = render(<DexPolls {...dexPollsProps()} />);

		expect(
			within(list(container)).getByText("Unseen poll")
		).toBeInTheDocument();
		expect(screen.queryByText(/not shown to you/)).not.toBeInTheDocument();
	});

	it("scores a flawless record apart from a patchy one", () => {
		const { container } = render(<DexPolls {...dexPollsProps()} />);

		expect(within(list(container)).getByText("2/2")).toHaveAttribute(
			"data-screen-theme",
			"viridian"
		);
		expect(within(list(container)).getByText("3/4")).toHaveAttribute(
			"data-screen-theme",
			"saffron"
		);
	});

	it("reports nothing for a poll seen but never answered", () => {
		const { container } = render(<DexPolls {...dexPollsProps()} />);

		expect(within(list(container)).getAllByText("—")).toHaveLength(2);
	});

	it("marks the picked row as the one the panel is reading", () => {
		const { container } = render(<DexPolls {...dexPollsProps()} />);

		expect(rowNumbered(container, "#001")).toHaveAttribute(
			"aria-current",
			"true"
		);
		expect(rowNumbered(container, "#002")).toHaveAttribute(
			"aria-current",
			"false"
		);
	});

	it("reports which row was pressed rather than moving the panel itself", async () => {
		const onSelect = vi.fn();
		const { container } = render(<DexPolls {...dexPollsProps({ onSelect })} />);

		await userEvent.click(rowNumbered(container, "#002"));

		expect(onSelect).toHaveBeenCalledWith("2");
	});

	it("heads the panel with the poll's own dex number", () => {
		const { container } = render(<DexPolls {...dexPollsProps()} />);

		expect(
			within(detail(container)).getByRole("heading", { name: "#001" })
		).toBeVisible();
	});

	it("states a seen poll's question, category and whole record", () => {
		const { container } = render(<DexPolls {...dexPollsProps()} />);
		const panel = within(detail(container));

		expect(panel.getByText(dexPollFixtures[0].question ?? "")).toBeVisible();
		expect(panel.getByText("TypeScript")).toBeVisible();
		expect(panel.getByText("dealt ×5")).toBeVisible();
		expect(panel.getByText("75%")).toBeVisible();
	});

	it("names the category of a poll you have not been dealt, so a target has a place", () => {
		const unseen = pollNumbered("#004");
		const { container } = render(
			<DexPolls
				{...dexPollsProps({
					selectedId: unseen.id,
					detail: dexPollDetail(unseen),
				})}
			/>
		);
		const panel = within(detail(container));

		expect(panel.getByText("TypeScript")).toBeVisible();
		expect(panel.getByText("Unseen poll")).toBeInTheDocument();
		expect(panel.queryByText("dealt ×5")).not.toBeInTheDocument();
	});

	it("says so plainly when the chosen category holds nothing", () => {
		const { container } = render(
			<DexPolls
				{...dexPollsProps({ rows: [], selectedId: null, detail: null })}
			/>
		);

		expect(
			within(detail(container)).getByText("No poll in this category yet.")
		).toBeVisible();
	});

	it("states how a poll enters the dex", () => {
		render(
			<DexPolls {...dexPollsProps({ note: "A poll enters when dealt." })} />
		);

		expect(screen.getByText("A poll enters when dealt.")).toBeVisible();
	});
});
