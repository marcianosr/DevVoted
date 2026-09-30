import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Segmented, type SegmentedItem } from "./Segmented.ui";

const WEIGHTS: readonly SegmentedItem<"all" | "one" | "two">[] = [
	{ value: "all", label: "everything" },
	{ value: "one", label: "5 of 19", mark: "1" },
	{ value: "two", label: "3 of 13", mark: "2" },
];

const STATUSES: readonly SegmentedItem<"all" | "published" | "draft">[] = [
	{ value: "all", label: "all", count: 96 },
	{ value: "published", label: "published", count: 92 },
	{ value: "draft", label: "draft", count: 3 },
];

describe("Segmented", () => {
	it("names the group and checks only the item that is picked", () => {
		render(
			<Segmented
				label="Status"
				items={STATUSES}
				value="published"
				onSelect={vi.fn()}
			/>
		);

		expect(
			screen.getByRole("radiogroup", { name: "Status" })
		).toBeInTheDocument();
		expect(screen.getAllByRole("radio")).toHaveLength(3);
		expect(screen.getByRole("radio", { checked: true })).toHaveAccessibleName(
			"published · 92"
		);
	});

	it("fills the picked item with the contrast-paired segment fill, so a pale theme keeps its ink", () => {
		render(
			<Segmented
				label="Status"
				items={STATUSES}
				value="published"
				onSelect={vi.fn()}
			/>
		);

		const picked = screen.getByRole("radio", { checked: true });
		expect(picked).toHaveClass("segment-theme");
		expect(picked).not.toHaveClass("bg-theme", "text-theme-faint");
	});

	it("folds the count into the name and keeps the figure out of the label", () => {
		render(
			<Segmented
				label="Status"
				items={STATUSES}
				value="all"
				onSelect={vi.fn()}
			/>
		);

		const draft = screen.getByRole("radio", { name: "draft · 3" });
		expect(draft).toHaveTextContent("draft");
		expect(screen.getByText("3")).toHaveAttribute("aria-hidden");
		expect(screen.getByText("3")).toHaveClass("badge-theme");
	});

	it("answers to its label alone when it carries no count", () => {
		render(
			<Segmented
				label="Answer type"
				items={[
					{ value: "single", label: "single" },
					{ value: "multiple", label: "multiple" },
				]}
				value="single"
				onSelect={vi.fn()}
			/>
		);

		expect(screen.getByRole("radio", { name: "multiple" })).not.toBeChecked();
	});

	it("selects on press", async () => {
		const onSelect = vi.fn();
		render(
			<Segmented
				label="Status"
				items={STATUSES}
				value="all"
				onSelect={onSelect}
			/>
		);

		await userEvent.click(screen.getByRole("radio", { name: "draft · 3" }));

		expect(onSelect).toHaveBeenCalledExactlyOnceWith("draft");
	});

	it("joins its items into one ringed box unless asked to stand loose", () => {
		const { rerender } = render(
			<Segmented
				label="Status"
				items={STATUSES}
				value="all"
				onSelect={vi.fn()}
			/>
		);

		expect(screen.getByRole("radiogroup")).toHaveClass("ring-1", "rounded-md");
		expect(screen.getByRole("radio", { name: "draft · 3" })).not.toHaveClass(
			"ring-1"
		);

		rerender(
			<Segmented
				label="Status"
				items={STATUSES}
				value="all"
				look="loose"
				onSelect={vi.fn()}
			/>
		);

		expect(screen.getByRole("radiogroup")).toHaveClass("flex-wrap");
		expect(screen.getByRole("radiogroup")).not.toHaveClass("ring-1");
		expect(screen.getByRole("radio", { name: "draft · 3" })).toHaveClass(
			"ring-1"
		);
	});

	it("speaks its mark before its label, and draws the mark as a leading badge", async () => {
		render(
			<Segmented
				label="Weight"
				items={WEIGHTS}
				value="all"
				onSelect={vi.fn()}
			/>
		);

		const weightOne = screen.getByRole("radio", { name: "1 · 5 of 19" });

		expect(weightOne).toHaveTextContent("15 of 19");
		expect(weightOne.firstElementChild).toHaveClass("badge-theme");
	});

	it("names an item by its label alone when it carries neither mark nor count", () => {
		render(
			<Segmented
				label="Weight"
				items={WEIGHTS}
				value="all"
				onSelect={vi.fn()}
			/>
		);

		expect(screen.getByRole("radio", { name: "everything" })).toBeVisible();
	});
});
