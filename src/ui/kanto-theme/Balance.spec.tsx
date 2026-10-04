import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { STORAGE_BALANCE } from "~/shared/lib/copy";

import { BALANCE_PILL_HOLD_MS, Balance } from "./Balance.ui";

const FUNDS = { label: "balance", kb: 843 } as const;

const figureOf = (reading = "843 KB") =>
	screen.getByRole("img", { name: reading });

const countOf = () => document.querySelector(".balance-count");

const countAt = () =>
	countOf()
		?.getAttribute("style")
		?.match(/--balance-count:\s*(-?\d+)/)?.[1];

const readoutIn = (container: HTMLElement) =>
	container.querySelector(".balance-readout");

describe("Balance, inline", () => {
	it("states the figure without spending a line on the word", () => {
		render(<Balance label={STORAGE_BALANCE} kb={10} layout="inline" />);

		expect(screen.getByRole("img", { name: "10 KB" })).toBeInTheDocument();
	});

	it("states its tag beside the figure, so the bar says which wallet it is", () => {
		render(
			<Balance label={STORAGE_BALANCE} kb={10} layout="inline" tag="run" />
		);

		expect(screen.getByText("run")).toBeInTheDocument();
	});

	it("states no tag when it is handed none", () => {
		const { container } = render(
			<Balance label={STORAGE_BALANCE} kb={10} layout="inline" />
		);

		expect(container.querySelector(".balance-tag")).toBeNull();
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

describe("Balance, stacked", () => {
	it("reads the funds as a figure over the word it is measured in", () => {
		render(<Balance {...FUNDS} />);

		expect(figureOf()).toBeInTheDocument();
		expect(screen.getByText("KB")).toBeInTheDocument();
		expect(screen.getByText("balance")).toBeInTheDocument();
	});

	it("leads with the figure and drops the label beneath it", () => {
		render(<Balance {...FUNDS} />);

		const block = screen.getByText("balance").parentElement;

		expect(block).toHaveClass("flex-col");
		expect(block?.firstElementChild).toBe(figureOf());
		expect(block?.lastElementChild).toHaveTextContent("balance");
	});

	it("marks the label with the floppy, so the figure needs no unit spelled out", () => {
		render(<Balance {...FUNDS} />);

		expect(
			screen.getByText("balance").querySelector("svg")
		).toBeInTheDocument();
	});

	it("sizes the amount to lead and quiets the unit beside it", () => {
		render(<Balance {...FUNDS} />);

		expect(countOf()?.parentElement).toHaveClass("text-display");
		expect(screen.getByText("KB")).toHaveClass("text-theme-muted");
	});

	it("quiets the label below the figure it names", () => {
		render(<Balance {...FUNDS} />);

		expect(screen.getByText("balance")).toHaveClass("text-xs");
	});

	it("holds the amount in tabular figures, so it cannot jitter poll to poll", () => {
		render(<Balance {...FUNDS} />);

		expect(figureOf()).toHaveClass("tabular-nums");
	});

	it("gives the label the full theme colour", () => {
		render(<Balance {...FUNDS} />);

		expect(screen.getByText("balance")).toHaveClass("text-theme");
	});

	it("states what an install would leave, beside the balance it would leave it in", () => {
		render(
			<Balance
				{...FUNDS}
				preview={{
					label: "after install",
					figure: "811 KB",
					color: "vermillion",
				}}
			/>
		);

		expect(screen.getByText("811 KB")).toHaveAttribute(
			"data-screen-theme",
			"vermillion"
		);
		expect(screen.getByText(/after install/)).toBeInTheDocument();
	});

	it("says nothing about an install when nothing is pointed at", () => {
		render(<Balance {...FUNDS} />);

		expect(screen.queryByText(/after install/)).not.toBeInTheDocument();
	});

	it("names the purse the amount came from, at whatever unit it rolled to", () => {
		render(<Balance {...{ label: "archive", kb: 1946 }} />);

		expect(figureOf("1.9 MB")).toBeInTheDocument();
		expect(screen.getByText("MB")).toBeInTheDocument();
		expect(screen.getByText("archive")).toBeInTheDocument();
		expect(screen.queryByText("balance")).not.toBeInTheDocument();
	});
});

describe("Balance, as it moves", () => {
	const fundsAt = (kb: number) => ({ label: "balance", kb });

	afterEach(() => {
		vi.useRealTimers();
	});

	it("counts to the new reading when the balance climbs", () => {
		const { rerender } = render(<Balance {...FUNDS} />);

		rerender(<Balance {...fundsAt(875)} />);

		expect(countAt()).toBe("875");
		expect(countOf()).toHaveAttribute("data-counts", "true");
	});

	it("tints the figure as it climbs, so a gain reads before it is parsed", () => {
		const { rerender } = render(<Balance {...FUNDS} />);

		rerender(<Balance {...fundsAt(875)} />);

		expect(figureOf("875 KB")).toHaveAttribute("data-screen-theme", "viridian");
	});

	it("tints the figure the other way when the balance falls", () => {
		const { rerender } = render(<Balance {...FUNDS} />);

		rerender(<Balance {...fundsAt(811)} />);

		expect(figureOf("811 KB")).toHaveAttribute("data-screen-theme", "cinnabar");
	});

	it("names the change in a pill, signed the way it went", () => {
		const { rerender } = render(<Balance {...FUNDS} />);

		rerender(<Balance {...fundsAt(875)} />);

		expect(screen.getByRole("status")).toHaveTextContent("+32 KB");
	});

	it("names a loss with a minus rather than a plus", () => {
		const { rerender } = render(<Balance {...FUNDS} />);

		rerender(<Balance {...fundsAt(811)} />);

		expect(screen.getByRole("status")).toHaveTextContent("\u221232 KB");
	});

	it("says nothing on arrival, so mounting a screen names no gain", () => {
		render(<Balance {...FUNDS} />);

		expect(screen.queryByRole("status")).not.toBeInTheDocument();
		expect(countOf()).toHaveAttribute("data-counts", "false");
	});

	it("drops the pill once the change has had time to be read", () => {
		vi.useFakeTimers();
		const { rerender } = render(<Balance {...FUNDS} />);

		rerender(<Balance {...fundsAt(875)} />);
		expect(screen.getByRole("status")).toBeInTheDocument();

		act(() => {
			vi.advanceTimersByTime(BALANCE_PILL_HOLD_MS);
		});

		expect(screen.queryByRole("status")).not.toBeInTheDocument();
	});

	it("clears the tint with the pill, leaving the figure the screen's own", () => {
		vi.useFakeTimers();
		const { rerender } = render(<Balance {...FUNDS} />);

		rerender(<Balance {...fundsAt(875)} />);

		act(() => {
			vi.advanceTimersByTime(BALANCE_PILL_HOLD_MS);
		});

		expect(figureOf("875 KB")).not.toHaveAttribute("data-screen-theme");
	});

	it("refuses to count across a unit roll, which would climb downwards", () => {
		const { rerender } = render(<Balance {...fundsAt(999)} />);

		rerender(<Balance {...fundsAt(1946)} />);

		expect(countOf()).toHaveAttribute("data-counts", "false");
		expect(countAt()).toBe("1");
		expect(figureOf("1.9 MB")).toHaveTextContent(".9");
	});

	it("still names the change across a unit roll, where the digits cannot", () => {
		const { rerender } = render(<Balance {...fundsAt(999)} />);

		rerender(<Balance {...fundsAt(1946)} />);

		expect(screen.getByRole("status")).toHaveTextContent("+947 KB");
	});

	it("names the first change before the second, when both land inside one hold", () => {
		vi.useFakeTimers();
		const { rerender } = render(<Balance {...FUNDS} />);

		rerender(<Balance {...fundsAt(875)} />);
		rerender(<Balance {...fundsAt(827)} />);

		expect(screen.getByRole("status")).toHaveTextContent("+32 KB");

		act(() => {
			vi.advanceTimersByTime(BALANCE_PILL_HOLD_MS);
		});

		expect(screen.getByRole("status")).toHaveTextContent("−48 KB");
	});

	it("holds the figure on the first reading until its change has been read", () => {
		vi.useFakeTimers();
		const { rerender } = render(<Balance {...FUNDS} />);

		rerender(<Balance {...fundsAt(875)} />);
		rerender(<Balance {...fundsAt(827)} />);

		expect(figureOf("875 KB")).toBeInTheDocument();
		expect(countAt()).toBe("875");
	});

	it("tints a gain then a spend green then red, never one tint for both", () => {
		vi.useFakeTimers();
		const { rerender } = render(<Balance {...FUNDS} />);

		rerender(<Balance {...fundsAt(875)} />);
		rerender(<Balance {...fundsAt(827)} />);

		expect(figureOf("875 KB")).toHaveAttribute("data-screen-theme", "viridian");

		act(() => {
			vi.advanceTimersByTime(BALANCE_PILL_HOLD_MS);
		});

		expect(figureOf("827 KB")).toHaveAttribute("data-screen-theme", "cinnabar");
	});

	it("measures each change from the one before it, not from what is showing", () => {
		vi.useFakeTimers();
		const { rerender } = render(<Balance {...FUNDS} />);

		rerender(<Balance {...fundsAt(875)} />);
		rerender(<Balance {...fundsAt(827)} />);
		rerender(<Balance {...fundsAt(859)} />);

		act(() => {
			vi.advanceTimersByTime(BALANCE_PILL_HOLD_MS);
		});
		act(() => {
			vi.advanceTimersByTime(BALANCE_PILL_HOLD_MS);
		});

		expect(screen.getByRole("status")).toHaveTextContent("+32 KB");
	});

	it("lands on the true balance once the last change has played", () => {
		vi.useFakeTimers();
		const { rerender } = render(<Balance {...FUNDS} />);

		rerender(<Balance {...fundsAt(875)} />);
		rerender(<Balance {...fundsAt(827)} />);

		act(() => {
			vi.advanceTimersByTime(BALANCE_PILL_HOLD_MS);
		});
		act(() => {
			vi.advanceTimersByTime(BALANCE_PILL_HOLD_MS);
		});

		expect(figureOf("827 KB")).toBeInTheDocument();
		expect(screen.queryByRole("status")).not.toBeInTheDocument();
	});

	it("plays a repeated change again rather than leaving the first pill up", () => {
		vi.useFakeTimers();
		const { rerender } = render(<Balance {...FUNDS} />);

		rerender(<Balance {...fundsAt(875)} />);
		const first = screen.getByRole("status");

		rerender(<Balance {...fundsAt(907)} />);

		act(() => {
			vi.advanceTimersByTime(BALANCE_PILL_HOLD_MS);
		});

		const second = screen.getByRole("status");
		expect(second).toHaveTextContent("+32 KB");
		expect(second).not.toBe(first);
	});

	it("withholds the after-install preview while a change is still playing", () => {
		vi.useFakeTimers();
		const pointed = (kb: number) => ({
			...fundsAt(kb),
			preview: {
				label: "after install",
				figure: "811 KB",
				color: "vermillion",
			} as const,
		});
		const { rerender } = render(<Balance {...pointed(843)} />);

		expect(screen.getByText(/after install/)).toBeInTheDocument();

		rerender(<Balance {...pointed(875)} />);

		expect(screen.queryByText(/after install/)).not.toBeInTheDocument();

		act(() => {
			vi.advanceTimersByTime(BALANCE_PILL_HOLD_MS);
		});

		expect(screen.getByText(/after install/)).toBeInTheDocument();
	});
});
