import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
	EMPTY_FILTER,
	type PollListChoices,
	type PollRow,
} from "~/modules/polls/authoring/application/pollList.viewmodel";
import {
	COPY,
	PollList,
	type PollListProps,
} from "~/modules/polls/authoring/presentation/PollList.ui";

const flex: PollRow = {
	id: 2,
	href: "/polls/2",
	number: 2,
	category: "CSS",
	question: [
		{ kind: "text", text: "What does " },
		{ kind: "code", text: "flex: 1" },
		{ kind: "text", text: " expand to?" },
	],
	facts: "single answer",
	author: { name: "Misty" },
	status: "published",
	reviewed: true,
};

const log: PollRow = {
	id: 9,
	href: "/polls/9",
	number: 9,
	category: "JavaScript",
	question: [{ kind: "text", text: "What does this log?" }],
	facts: "single answer · code",
	status: "draft",
	reviewed: false,
};

const choices: PollListChoices = {
	status: [
		{ value: "all", label: "all", count: 96 },
		{ value: "published", label: "published", count: 92 },
		{ value: "draft", label: "draft", count: 3 },
		{ value: "archived", label: "archived", count: 1 },
	],
	answerType: [
		{ value: "all", label: "any", count: 96 },
		{ value: "single", label: "single", count: 80 },
		{ value: "multiple", label: "multiple", count: 16 },
	],
	category: [
		{ value: "all", label: "All", count: 96 },
		{ value: "css", label: "CSS", count: 8 },
	],
	withCode: 12,
	withExplanation: 30,
	dealt: [
		{ value: "all", label: "any", count: 96 },
		{ value: "never", label: "never", count: 40 },
		{ value: "once", label: "once", count: 50 },
		{ value: "often", label: "2+ times", count: 6 },
	],
	reviewed: [
		{ value: "all", label: "any", count: 96 },
		{ value: "yes", label: "yes", count: 30 },
		{ value: "no", label: "no", count: 66 },
	],
};

const defaults: PollListProps = {
	admin: true,
	total: 96,
	matching: 96,
	shown: 2,
	rows: [flex, log],
	filter: EMPTY_FILTER,
	choices,
	suggestHref: "/polls/new",
	activeFilters: [],
	onClearFilter: vi.fn(),
	onClearAll: vi.fn(),
	onFilterChange: vi.fn(),
	onLoadMore: vi.fn(),
};

const showing = (whole: string) => (_: string, element: Element | null) =>
	element?.textContent === whole &&
	!Array.from(element.children).some((child) => child.textContent === whole);

const renderList = (props: Partial<PollListProps> = {}) =>
	render(<PollList {...defaults} {...props} />);

describe("PollList", () => {
	it("heads the page with the count and a link to suggest a poll", () => {
		renderList();

		expect(screen.getByRole("heading", { level: 1 })).toHaveAccessibleName(
			"Polls 96"
		);
		expect(
			screen.getByRole("link", { name: "Suggest a poll" })
		).toHaveAttribute("href", "/polls/new");
	});

	it("calls the page your suggested polls when it is not the admin view", () => {
		renderList({ admin: false });

		expect(screen.getByRole("heading", { level: 1 })).toHaveAccessibleName(
			"Your suggested polls 96"
		);
	});

	it("tells a player what each poll that gets published pays them", () => {
		renderList({ admin: false, reward: "+16 KB" });

		expect(screen.getByText(COPY.reward("+16 KB"))).toBeInTheDocument();
	});

	it("leaves the reward off the admin view", () => {
		renderList({ admin: true, reward: "+16 KB" });

		expect(screen.queryByText(COPY.reward("+16 KB"))).not.toBeInTheDocument();
	});

	it("reports a search as a filter change", async () => {
		const onFilterChange = vi.fn();
		renderList({ onFilterChange });

		await userEvent.type(
			screen.getByRole("searchbox", { name: "Search questions" }),
			"f"
		);

		expect(onFilterChange).toHaveBeenCalledWith({
			...EMPTY_FILTER,
			search: "f",
		});
	});

	it("offers status, answer and dealt as selects, and category as counted tabs", async () => {
		const onFilterChange = vi.fn();
		renderList({ onFilterChange });

		await userEvent.selectOptions(
			screen.getByRole("combobox", { name: "status" }),
			"draft"
		);
		expect(onFilterChange).toHaveBeenLastCalledWith({
			...EMPTY_FILTER,
			status: "draft",
		});

		await userEvent.selectOptions(
			screen.getByRole("combobox", { name: "answer" }),
			"multiple"
		);
		expect(onFilterChange).toHaveBeenLastCalledWith({
			...EMPTY_FILTER,
			answerType: "multiple",
		});

		await userEvent.selectOptions(
			screen.getByRole("combobox", { name: "dealt" }),
			"never"
		);
		expect(onFilterChange).toHaveBeenLastCalledWith({
			...EMPTY_FILTER,
			dealt: "never",
		});

		await userEvent.click(
			within(screen.getByRole("radiogroup", { name: "Category" })).getByRole(
				"radio",
				{ name: "CSS · 8" }
			)
		);
		expect(onFilterChange).toHaveBeenLastCalledWith({
			...EMPTY_FILTER,
			category: "css",
		});
	});

	it("switches the code and explanation filters, each with its count", async () => {
		const onFilterChange = vi.fn();
		renderList({ onFilterChange });

		const withCode = screen.getByRole("switch", { name: "with code 12" });
		expect(withCode).toHaveAttribute("aria-checked", "false");
		await userEvent.click(withCode);
		expect(onFilterChange).toHaveBeenLastCalledWith({
			...EMPTY_FILTER,
			withCode: true,
		});

		await userEvent.click(
			screen.getByRole("switch", { name: "with explanation 30" })
		);
		expect(onFilterChange).toHaveBeenLastCalledWith({
			...EMPTY_FILTER,
			withExplanation: true,
		});
	});

	it("offers the creators only once they are known", () => {
		const { rerender } = renderList();
		expect(
			screen.queryByRole("combobox", { name: "creator" })
		).not.toBeInTheDocument();

		rerender(
			<PollList
				{...defaults}
				choices={{
					...choices,
					creator: [
						{ value: "all", label: "all creators" },
						{ value: "misty", label: "Misty" },
					],
				}}
			/>
		);

		expect(screen.getByRole("combobox", { name: "creator" })).toHaveValue(
			"all"
		);
	});

	it("lists each active filter as a chip that clears it, then a way to clear them all", async () => {
		const onClearFilter = vi.fn();
		const onClearAll = vi.fn();
		renderList({
			activeFilters: [{ key: "category", label: "React" }],
			onClearFilter,
			onClearAll,
		});

		await userEvent.click(screen.getByRole("button", { name: "Clear React" }));
		expect(onClearFilter).toHaveBeenCalledWith("category");

		await userEvent.click(screen.getByRole("button", { name: "clear all" }));
		expect(onClearAll).toHaveBeenCalledOnce();
	});

	it("offers no clear all while no filter is set", () => {
		renderList();

		expect(
			screen.queryByRole("button", { name: "clear all" })
		).not.toBeInTheDocument();
	});

	it("links every row to its poll and marks code in the question", () => {
		renderList();

		const row = screen.getByRole("link", { name: /flex: 1/ });
		expect(row).toHaveAttribute("href", "/polls/2");
		expect(within(row).getByText("flex: 1").tagName).toBe("CODE");
		expect(within(row).getByText("single answer")).toBeInTheDocument();
		expect(within(row).getByText("published")).toBeInTheDocument();
	});

	it("names the author, or shows nothing where the author is still unknown", () => {
		renderList();

		expect(
			within(screen.getByRole("link", { name: /flex: 1/ })).getByText("Misty")
		).toBeInTheDocument();
		expect(
			within(screen.getByRole("link", { name: /this log/ })).getByText("—")
		).toBeInTheDocument();
	});

	it("drops the by column when the list is a player's own", () => {
		renderList({ admin: false });

		expect(screen.queryByText("by")).not.toBeInTheDocument();
		expect(screen.queryByText("Misty")).not.toBeInTheDocument();
	});

	it("counts what is shown and loads more only while more is left", async () => {
		const onLoadMore = vi.fn();
		const { rerender } = renderList({ onLoadMore });

		expect(screen.getByText(showing("showing 2 of 96"))).toBeInTheDocument();
		await userEvent.click(screen.getByRole("button", { name: "load more" }));
		expect(onLoadMore).toHaveBeenCalledOnce();

		rerender(<PollList {...defaults} onLoadMore={undefined} />);
		expect(
			screen.queryByRole("button", { name: "load more" })
		).not.toBeInTheDocument();
	});

	it("says so when nothing matches", () => {
		renderList({ rows: [], shown: 0, matching: 0 });

		expect(
			screen.getByText("No polls match these filters.")
		).toBeInTheDocument();
		expect(screen.getByText(showing("showing 0 of 0"))).toBeInTheDocument();
	});

	it("filters on reviewed and marks a reviewed row, for an admin", async () => {
		const onFilterChange = vi.fn();
		renderList({ onFilterChange });

		await userEvent.selectOptions(
			screen.getByRole("combobox", { name: "reviewed" }),
			"no"
		);

		expect(onFilterChange).toHaveBeenCalledWith(
			expect.objectContaining({ reviewed: "no" })
		);
		expect(
			within(screen.getByRole("link", { name: /flex: 1/ })).getByText(
				"reviewed"
			)
		).toBeInTheDocument();
		expect(
			within(screen.getByRole("link", { name: /this log/ })).queryByText(
				"reviewed"
			)
		).toBeNull();
	});

	it("keeps the reviewed filter off a player's own list", () => {
		renderList({ admin: false });

		expect(screen.queryByRole("combobox", { name: "reviewed" })).toBeNull();
	});
});
