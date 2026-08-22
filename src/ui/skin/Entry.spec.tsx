import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Entry } from "./Entry.ui";

const facts = [{ term: "resets on", detail: "the next poll" }];

describe("Entry", () => {
	it("speaks its mark rather than leaving a bare glyph", () => {
		render(<Entry mark="pass" label="Intellisense" />);

		expect(screen.getByRole("img", { name: "passing" })).toBeInTheDocument();
	});

	it("tones the trailing value", () => {
		render(
			<Entry
				mark="fail"
				label="Freemium"
				value="-128 KB"
				valueTone="cinnabar"
			/>
		);

		expect(screen.getByText("-128 KB")).toHaveClass("text-cinnabar");
	});

	it("stays a plain line when it has no facts", () => {
		render(<Entry mark="pass" label="IndexedDB" />);

		expect(screen.queryByRole("group")).not.toBeInTheDocument();
	});

	it("renders no fold for an empty facts list", () => {
		render(<Entry mark="pass" label="IndexedDB" facts={[]} />);

		expect(screen.queryByRole("group")).not.toBeInTheDocument();
	});

	it("folds its facts away by default", () => {
		render(<Entry mark="part" label="ESLint" facts={facts} />);

		expect(screen.getByRole("group")).not.toHaveAttribute("open");
	});

	it("opens when the caller says the facts matter", () => {
		render(<Entry mark="part" label="ESLint" facts={facts} defaultOpen />);

		expect(screen.getByRole("group")).toHaveAttribute("open");
		expect(screen.getByRole("term")).toHaveTextContent("resets on");
	});

	it("opens on a click anywhere along the row", async () => {
		render(
			<Entry
				mark="part"
				label="ESLint"
				detail="1 use on poll 3"
				facts={facts}
			/>
		);

		await userEvent.click(screen.getByText("1 use on poll 3"));

		expect(screen.getByRole("group")).toHaveAttribute("open");
	});
});
