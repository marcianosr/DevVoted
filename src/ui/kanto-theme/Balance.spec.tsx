import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { STORAGE_BALANCE } from "~/shared/lib/copy";

import { Balance } from "./Balance.ui";

const readoutIn = (container: HTMLElement) =>
	container.querySelector(".balance-readout");

describe("Balance, inline", () => {
	it("states the figure without spending a line on the word", () => {
		render(<Balance label={STORAGE_BALANCE} kb={10} layout="inline" />);

		expect(screen.getByRole("img", { name: "10 KB" })).toBeInTheDocument();
	});

	it("keeps the word for a reader who cannot see the floppy", () => {
		render(<Balance label={STORAGE_BALANCE} kb={10} layout="inline" />);

		expect(screen.getByText(STORAGE_BALANCE)).toHaveClass("sr-only");
	});

	it("reads as one row, so it fits the bar it hangs in", () => {
		const { container } = render(
			<Balance label={STORAGE_BALANCE} kb={10} layout="inline" />
		);

		expect(readoutIn(container)).toHaveClass("items-center");
		expect(readoutIn(container)).not.toHaveClass("flex-col");
	});

	it("wears the green badge by default, so the figure reads as a chip on a busy bar", () => {
		const { container } = render(
			<Balance label={STORAGE_BALANCE} kb={10} layout="inline" />
		);

		expect(readoutIn(container)).toHaveClass("badge-theme");
		expect(readoutIn(container)).toHaveAttribute(
			"data-screen-theme",
			"viridian"
		);
	});

	it("wears a colour it is handed over the default green", () => {
		const { container } = render(
			<Balance
				label={STORAGE_BALANCE}
				kb={10}
				layout="inline"
				color="saffron"
			/>
		);

		expect(readoutIn(container)).toHaveAttribute(
			"data-screen-theme",
			"saffron"
		);
	});

	it("stays the ground its change pill stands on", () => {
		const { container } = render(
			<Balance label={STORAGE_BALANCE} kb={10} layout="inline" />
		);

		expect(readoutIn(container)).toHaveClass("relative");
	});

	it("still names a change, which is the whole reason the bar follows you", () => {
		const { container, rerender } = render(
			<Balance label={STORAGE_BALANCE} kb={96} layout="inline" />
		);
		rerender(<Balance label={STORAGE_BALANCE} kb={64} layout="inline" />);

		expect(screen.getByRole("status")).toHaveTextContent("−32 KB");
		expect(readoutIn(container)).toContainElement(screen.getByRole("status"));
	});

	it("still previews what an offer would leave, which is what the shop asks it", () => {
		render(
			<Balance
				label={STORAGE_BALANCE}
				kb={410}
				layout="inline"
				preview={{
					label: "after install",
					figure: "378 KB",
					color: "cinnabar",
				}}
			/>
		);

		expect(screen.getByText("378 KB")).toBeInTheDocument();
	});
});

describe("Balance, stacked", () => {
	it("is what a screen gets when it asks for nothing", () => {
		const { container } = render(<Balance label={STORAGE_BALANCE} kb={10} />);

		expect(readoutIn(container)).toHaveClass("flex-col");
		expect(readoutIn(container)).not.toHaveClass("border");
	});

	it("states the word beside the floppy, where there is room for it", () => {
		render(<Balance label={STORAGE_BALANCE} kb={10} />);

		expect(screen.getByText(STORAGE_BALANCE)).not.toHaveClass("sr-only");
	});
});
