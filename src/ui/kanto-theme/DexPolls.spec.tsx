import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { dexPollsProps } from "~/test/dexRegistry.factory";

import { DexPolls } from "./DexPolls.ui";

describe("DexPolls", () => {
	it("names the collection and counts it against the roster", () => {
		render(<DexPolls {...dexPollsProps()} />);

		expect(screen.getByRole("heading", { name: "polls seen" })).toBeVisible();
		expect(screen.getByText("187 of 423")).toBeVisible();
	});

	it("shows a seen poll's question with its repeats and score", () => {
		render(<DexPolls {...dexPollsProps()} />);

		expect(screen.getByText("answered ×4")).toBeVisible();
		expect(screen.getByText("3/4")).toBeVisible();
	});

	it("withholds a poll never dealt to you behind ??? alone, with no prose", () => {
		render(<DexPolls {...dexPollsProps()} />);

		expect(screen.getByText("Unseen poll")).toBeInTheDocument();
		expect(screen.queryByText(/not shown to you/)).not.toBeInTheDocument();
	});

	it("withholds the category of an unseen poll too", () => {
		render(<DexPolls {...dexPollsProps()} />);

		expect(screen.getByText("Unseen category")).toBeInTheDocument();
		expect(screen.queryByText("HTML")).not.toBeInTheDocument();
	});

	it("scores a flawless record apart from a patchy one", () => {
		render(<DexPolls {...dexPollsProps()} />);

		expect(screen.getByText("2/2")).toHaveAttribute(
			"data-screen-theme",
			"viridian"
		);
		expect(screen.getByText("3/4")).toHaveAttribute(
			"data-screen-theme",
			"saffron"
		);
	});

	it("reports nothing for a poll seen but never answered", () => {
		render(<DexPolls {...dexPollsProps()} />);

		expect(screen.getAllByText("—")).toHaveLength(2);
	});

	it("states how a poll enters the dex", () => {
		render(
			<DexPolls {...dexPollsProps({ note: "A poll enters when dealt." })} />
		);

		expect(screen.getByText("A poll enters when dealt.")).toBeVisible();
	});
});
