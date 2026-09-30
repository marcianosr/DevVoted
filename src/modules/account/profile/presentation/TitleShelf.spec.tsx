import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import {
	titleShelfFor,
	type TitleShelfInput,
} from "~/modules/account/profile/application/titleShelf.viewmodel";
import {
	COPY,
	TitleShelf,
} from "~/modules/account/profile/presentation/TitleShelf.ui";

const TESTER = "title-legacy-tester";

const MOCK_ACCOUNT: TitleShelfInput = {
	ownedTitleIds: ["title-rank-poll-newbie", "title-answered-css", TESTER],
	counts: [
		{ metric: "polls-answered", count: 34 },
		{ metric: "category-seen:css", count: 50 },
		{ metric: "category-mastered:css", count: 28 },
	],
	filter: "all",
	moreCategories: false,
};

const onFilter = vi.fn();
const onMoreCategories = vi.fn();

const renderShelf = (input: Partial<TitleShelfInput> = {}) =>
	render(
		<TitleShelf
			{...titleShelfFor({ ...MOCK_ACCOUNT, ...input })}
			onFilter={onFilter}
			onMoreCategories={onMoreCategories}
		/>
	);

describe("TitleShelf", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("states an earned title without offering to wear it, because wearing lives in appearance", () => {
		renderShelf();

		expect(screen.getByText("CSS Carrier")).toBeInTheDocument();
		expect(
			screen.queryByRole("button", { name: /wear/i })
		).not.toBeInTheDocument();
	});

	it("names the next poll-count threshold and how far off it is", () => {
		renderShelf();

		expect(screen.getByText(COPY.nextPolls(36))).toBeInTheDocument();
		expect(screen.getByText(COPY.toGo(2))).toBeInTheDocument();
	});

	it("hides an unearned special title's name but states how to earn it", () => {
		renderShelf();

		expect(screen.queryByText("It Compiles")).not.toBeInTheDocument();
		expect(screen.getByText("Win a run")).toBeInTheDocument();
	});

	it("asks for the held-back categories", () => {
		renderShelf();

		fireEvent.click(
			screen.getByRole("button", { name: COPY.moreCategories(4) })
		);

		expect(onMoreCategories).toHaveBeenCalledOnce();
	});

	it("swaps the three sections for a ranked list under closest", () => {
		renderShelf({ filter: "closest" });

		expect(screen.queryByText(COPY.sections.category)).not.toBeInTheDocument();
		expect(
			screen.getByText("50 distinct CSS polls answered correctly")
		).toBeInTheDocument();
		expect(screen.getByText(COPY.toGo(22))).toBeInTheDocument();
	});

	it("reports the chosen filter", () => {
		renderShelf();

		fireEvent.click(screen.getByRole("radio", { name: COPY.filters.closest }));

		expect(onFilter).toHaveBeenCalledWith("closest");
	});
});
