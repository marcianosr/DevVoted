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

const CSS_CARRIER = "title-answered-css";
const TESTER = "title-legacy-tester";

const MOCK_ACCOUNT: TitleShelfInput = {
	ownedTitleIds: ["title-rank-poll-newbie", CSS_CARRIER, TESTER],
	equippedTitleIds: [TESTER],
	counts: [
		{ metric: "polls-answered", count: 34 },
		{ metric: "category-answered:css", count: 10 },
		{ metric: "category-correct:css", count: 14 },
		{ metric: "gates-reordered", count: 20 },
	],
	filter: "all",
	moreCategories: false,
};

const onToggle = vi.fn();
const onFilter = vi.fn();
const onMoreCategories = vi.fn();

const renderShelf = (input: Partial<TitleShelfInput> = {}) =>
	render(
		<TitleShelf
			{...titleShelfFor({ ...MOCK_ACCOUNT, ...input })}
			isMutating={false}
			onToggle={onToggle}
			onFilter={onFilter}
			onMoreCategories={onMoreCategories}
		/>
	);

describe("TitleShelf", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("offers every free worn slot as a dashed place to fill", () => {
		renderShelf();

		const empty = screen.getAllByText(COPY.emptySlot);

		expect(empty).toHaveLength(2);
		expect(empty[0].closest("span")).toHaveClass("border-dashed");
	});

	it("takes a worn title off from its slot", () => {
		renderShelf();

		fireEvent.click(
			screen.getByRole("button", { name: COPY.takeOff("Legacy Tester") })
		);

		expect(onToggle).toHaveBeenCalledWith(TESTER, true);
	});

	it("wears an earned category title from its cell", () => {
		renderShelf();

		fireEvent.click(
			screen.getByRole("button", { name: COPY.wearName("CSS Carrier") })
		);

		expect(onToggle).toHaveBeenCalledWith(CSS_CARRIER, false);
	});

	it("refuses a wear press once every slot is taken", () => {
		renderShelf({
			ownedTitleIds: [...MOCK_ACCOUNT.ownedTitleIds, "title-bikeshedder"],
			equippedTitleIds: [TESTER, "title-rank-poll-newbie", "title-bikeshedder"],
		});

		expect(
			screen.getByRole("button", { name: COPY.wearName("CSS Carrier") })
		).toBeDisabled();
	});

	it("names the next poll-count threshold and how far off it is", () => {
		renderShelf();

		expect(screen.getByText(COPY.nextPolls(36))).toBeInTheDocument();
		expect(screen.getByText(COPY.toGo(2))).toBeInTheDocument();
	});

	it("hides an unearned special title's name but states how to earn it", () => {
		renderShelf();

		expect(screen.queryByText("Bikeshedder")).not.toBeInTheDocument();
		expect(screen.getByText("Reorder the gates 25 times")).toBeInTheDocument();
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
		expect(screen.getByText("Reorder the gates 25 times")).toBeInTheDocument();
		expect(screen.getByText(COPY.toGo(5))).toBeInTheDocument();
	});

	it("reports the chosen filter", () => {
		renderShelf();

		fireEvent.click(screen.getByRole("radio", { name: COPY.filters.closest }));

		expect(onFilter).toHaveBeenCalledWith("closest");
	});
});
