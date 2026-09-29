import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
	EMPTY_FILTER,
	type PollListChoices,
	type PollRow,
} from "~/modules/polls/authoring/application/pollList.viewmodel";
import {
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
};

const log: PollRow = {
	id: 9,
	href: "/polls/9",
	number: 9,
	category: "JavaScript",
	question: [{ kind: "text", text: "What does this log?" }],
	facts: "single answer · code",
	status: "draft",
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
	onFilterChange: vi.fn(),
	onLoadMore: vi.fn(),
};

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

	it("offers status, answer type and category as counted radio groups", async () => {
		const onFilterChange = vi.fn();
		renderList({ onFilterChange });

		const status = screen.getByRole("radiogroup", { name: "Status" });
		expect(
			within(status).getByRole("radio", { checked: true })
		).toHaveAccessibleName("all · 96");
		await userEvent.click(
			within(status).getByRole("radio", { name: "draft · 3" })
		);
		expect(onFilterChange).toHaveBeenLastCalledWith({
			...EMPTY_FILTER,
			status: "draft",
		});

		await userEvent.click(
			within(screen.getByRole("radiogroup", { name: "Answer type" })).getByRole(
				"radio",
				{ name: "multiple · 16" }
			)
		);
		expect(onFilterChange).toHaveBeenLastCalledWith({
			...EMPTY_FILTER,
			answerType: "multiple",
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

	it("toggles the code filter with its count beside it", async () => {
		const onFilterChange = vi.fn();
		renderList({ onFilterChange });

		const withCode = screen.getByRole("button", { name: "with code" });
		expect(withCode).toHaveAttribute("aria-pressed", "false");
		expect(withCode).toHaveTextContent("12");

		await userEvent.click(withCode);

		expect(onFilterChange).toHaveBeenCalledWith({
			...EMPTY_FILTER,
			withCode: true,
		});
	});

	it("offers the creators only once they are known", () => {
		const { rerender } = renderList();
		expect(screen.queryByRole("combobox")).not.toBeInTheDocument();

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

		expect(screen.getByRole("combobox", { name: "Creator" })).toHaveValue(
			"all"
		);
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

		expect(screen.getByText("showing 2 of 96")).toBeInTheDocument();
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
		expect(screen.getByText("showing 0 of 0")).toBeInTheDocument();
	});
});
