import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
	dexPollDetail,
	dexPollFixtures,
	dexPollsProps,
} from "~/test/dexRegistry.factory";

import { DexPolls } from "./DexPolls.ui";

const pollNumbered = (number: string) => {
	const poll = dexPollFixtures.find((entry) => entry.number === number);
	if (poll === undefined) throw new Error(`no fixture poll ${number}`);

	return poll;
};

const grid = () => screen.getByRole("group", { name: "Every poll" });

const rowNumbered = (number: string) => {
	const row = screen
		.getAllByText(number)
		.map((cell) => cell.closest("button"))
		.find((button) => button?.hasAttribute("aria-current"));
	if (!(row instanceof HTMLElement)) throw new Error(`no row ${number}`);

	return row;
};

const detailHeading = () => screen.getByRole("heading", { level: 2 });

describe("DexPolls", () => {
	it("offers one strip item a category, each counting its own seen against its own total", () => {
		render(<DexPolls {...dexPollsProps()} />);

		expect(screen.getByRole("radio", { name: "all · 3 of 4" })).toBeChecked();
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

	it("lists only the polls you have seen, each with its number and question", () => {
		render(<DexPolls {...dexPollsProps()} />);

		expect(rowNumbered("#001")).toHaveTextContent(
			dexPollFixtures[0].question ?? ""
		);
		expect(screen.queryByText("#004")).not.toBeInTheDocument();
	});

	it("scores a caught poll green and a merely seen one yellow", () => {
		render(
			<DexPolls
				{...dexPollsProps({
					rows: [
						{
							id: "1",
							number: "#001",
							question: "q1",
							answered: 1,
							correct: 1,
							state: "caught",
						},
						{
							id: "3",
							number: "#003",
							question: "q3",
							answered: 1,
							correct: 0,
							state: "seen",
						},
					],
				})}
			/>
		);

		expect(screen.getByText("1/1")).toHaveAttribute(
			"data-screen-theme",
			"viridian"
		);
		expect(screen.getByText("0/1")).toHaveAttribute(
			"data-screen-theme",
			"saffron"
		);
	});

	it("reports nothing for a poll seen but never answered", () => {
		render(<DexPolls {...dexPollsProps()} />);

		expect(rowNumbered("#003")).toHaveTextContent("—");
	});

	it("marks the picked row as the one the entry is reading", () => {
		render(<DexPolls {...dexPollsProps()} />);

		expect(rowNumbered("#001")).toHaveAttribute("aria-current", "true");
		expect(rowNumbered("#002")).toHaveAttribute("aria-current", "false");
	});

	it("reports which row was pressed rather than moving the entry itself", async () => {
		const onSelect = vi.fn();
		render(<DexPolls {...dexPollsProps({ onSelect })} />);

		await userEvent.click(rowNumbered("#002"));

		expect(onSelect).toHaveBeenCalledWith("2");
	});

	it("draws every poll in the grid under a label that counts the seen", () => {
		render(<DexPolls {...dexPollsProps()} />);

		expect(within(grid()).getAllByRole("button")).toHaveLength(
			dexPollFixtures.length
		);
		expect(screen.getByText("all 4 polls")).toBeVisible();
		expect(screen.getByText("3 seen")).toBeVisible();
	});

	it("names each grid tile by its number and whether it is caught, seen or unseen", () => {
		render(<DexPolls {...dexPollsProps()} />);

		expect(
			within(grid()).getByRole("button", { name: "#1 caught" })
		).toHaveAttribute("data-screen-theme", "viridian");
		expect(
			within(grid()).getByRole("button", { name: "#3 seen" })
		).toHaveAttribute("data-screen-theme", "saffron");
		expect(
			within(grid()).getByRole("button", { name: "#4 unseen" })
		).not.toHaveAttribute("data-screen-theme");
	});

	it("opens an unseen poll from the grid, since the list never shows it", async () => {
		const onSelect = vi.fn();
		render(<DexPolls {...dexPollsProps({ onSelect })} />);

		await userEvent.click(
			within(grid()).getByRole("button", { name: "#4 unseen" })
		);

		expect(onSelect).toHaveBeenCalledWith("4");
	});

	it("heads the entry with the poll's number and category, then its question and record", () => {
		render(<DexPolls {...dexPollsProps()} />);

		expect(detailHeading()).toHaveTextContent("#001 · TypeScript");
		expect(screen.getAllByText(dexPollFixtures[0].question ?? "")).toHaveLength(
			2
		);
		expect(screen.getByText("dealt ×5")).toBeVisible();
		expect(screen.getByText("answered ×4")).toBeVisible();
		expect(screen.getByText("right · 3/4")).toHaveAttribute(
			"data-screen-theme",
			"viridian"
		);
	});

	it("keeps an unseen poll's category but withholds its question", () => {
		const unseen = pollNumbered("#004");
		render(
			<DexPolls
				{...dexPollsProps({
					selectedId: unseen.id,
					detail: dexPollDetail(unseen),
				})}
			/>
		);

		expect(detailHeading()).toHaveTextContent("#004 · TypeScript");
		expect(screen.getByText("Unseen poll")).toBeInTheDocument();
		expect(screen.queryByText("dealt ×5")).not.toBeInTheDocument();
	});

	it("says so plainly when nothing in the category has been seen", () => {
		render(
			<DexPolls
				{...dexPollsProps({ rows: [], selectedId: null, detail: null })}
			/>
		);

		expect(screen.getByText("Nothing seen here yet.")).toBeVisible();
		expect(screen.getByText("No poll in this category yet.")).toBeVisible();
	});
});
