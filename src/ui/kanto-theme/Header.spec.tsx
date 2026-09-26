import { afterEach, describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";

import { gateSwatchAt, trackTo } from "~/test/swatchTrack.factory";

import { BALANCE_PILL_HOLD_MS, Header } from "./Header.ui";

const VOLCANO = gateSwatchAt(9);

const FUNDS = {
	amount: "1843",
	unit: "KB",
	label: "balance",
	kb: 1843,
} as const;

const figureOf = (reading = "1843 KB") =>
	screen.getByRole("img", { name: reading });

const countOf = () => document.querySelector(".balance-count");

const countAt = () =>
	countOf()
		?.getAttribute("style")
		?.match(/--balance-count:\s*(-?\d+)/)?.[1];

const COVERAGE = {
	label: "coverage",
	held: "92.5",
	demand: "375%",
	meter: { value: 92.5, max: 375 },
} as const;

const props = {
	swatch: VOLCANO,
	swatches: trackTo(9),
} as const;

describe("Header", () => {
	it("holds the coverage ring beside its rows rather than under them", () => {
		const { container } = render(
			<Header {...props} ring={{ held: 148, demand: 210 }} />
		);

		const ring = screen.getByRole("img", { name: /148% of 210% needed/ });
		expect(container.querySelector("header")).toContainElement(ring);
		expect(screen.getByText(/Volcano/)).toBeInTheDocument();
	});

	it("draws no ring when the header is given no coverage to read", () => {
		render(<Header {...props} />);

		expect(
			screen.queryByRole("img", { name: /needed/ })
		).not.toBeInTheDocument();
	});

	it("keeps the bar for a header that reads coverage the older way", () => {
		render(<Header {...props} coverage={COVERAGE} />);

		expect(screen.getByText("coverage")).toBeInTheDocument();
		expect(
			screen.queryByRole("img", { name: /needed/ })
		).not.toBeInTheDocument();
	});

	it("names the gate from the roster rather than a passed-in string", () => {
		render(<Header {...props} />);

		expect(screen.getByText("#9 - Volcano Gate")).toBeInTheDocument();
	});

	it("leads with a swatch already filled in the gate's own colour", () => {
		const { container } = render(<Header {...props} />);

		const lead = container.querySelector("header > div > span");
		expect(lead).toHaveAttribute("data-swatch-theme", "volcano");
		expect(lead).toHaveClass("bg-theme");
	});

	it("keeps every swatch at the small size, lead and track alike", () => {
		const { container } = render(<Header {...props} />);

		const swatches = Array.from(container.querySelectorAll("span.size-3\\.5"));
		expect(swatches).toHaveLength(props.swatches.length + 1);
		expect(container.querySelector("span.size-7")).toBeNull();
	});

	it("quiets its note below the title", () => {
		render(<Header {...props} note="next gate 10" />);

		expect(screen.getByText("next gate 10")).toHaveClass("opacity-60");
	});

	it("pushes its note to the far end of the track row", () => {
		render(<Header {...props} note="next gate 10" />);

		expect(screen.getByText("next gate 10")).toHaveClass("ml-auto");
	});

	it("carries the swatch track, one swatch per gate in the run", () => {
		render(<Header {...props} />);

		expect(
			screen.getByRole("img", { name: /of 13 swatches discovered/ })
		).toBeInTheDocument();
	});

	it("titles at 16px, with no margin to offset the swatch", () => {
		render(<Header {...props} />);

		const title = screen.getByText("#9 - Volcano Gate");
		expect(title).toHaveClass("text-base", "font-extrabold");
		expect(title).not.toHaveClass("mb-5");
	});

	it("sets its note at 12px, below every Typography variant", () => {
		render(<Header {...props} note="next gate 10" />);

		expect(screen.getByText("next gate 10")).toHaveClass("text-xs");
	});

	it("stacks the two rows tighter than the screen's own gap", () => {
		const { container } = render(<Header {...props} />);

		expect(container.firstChild).toHaveClass("gap-4");
		expect(container.firstChild).not.toHaveClass("gap-6");
	});

	it("reads the funds as a figure over the word it is measured in", () => {
		render(<Header {...props} funds={FUNDS} />);

		expect(figureOf()).toBeInTheDocument();
		expect(screen.getByText("KB")).toBeInTheDocument();
		expect(screen.getByText("balance")).toBeInTheDocument();
	});

	it("leads with the figure and drops the label beneath it", () => {
		render(<Header {...props} funds={FUNDS} />);

		const block = screen.getByText("balance").parentElement;

		expect(block).toHaveClass("flex-col");
		expect(block?.firstElementChild).toBe(figureOf());
		expect(block?.lastElementChild).toHaveTextContent("balance");
	});

	it("marks the label with the floppy, so the figure needs no unit spelled out", () => {
		render(<Header {...props} funds={FUNDS} />);

		expect(
			screen.getByText("balance").querySelector("svg")
		).toBeInTheDocument();
	});

	it("sizes the amount to lead and quiets the unit beside it", () => {
		render(<Header {...props} funds={FUNDS} />);

		expect(countOf()?.parentElement).toHaveClass("text-display");
		expect(screen.getByText("KB")).toHaveClass("text-theme-muted");
	});

	it("quiets the label below the figure it names", () => {
		render(<Header {...props} funds={FUNDS} />);

		expect(screen.getByText("balance")).toHaveClass("text-xs");
	});

	it("puts the funds opposite the gate name, on the title row", () => {
		const { container } = render(<Header {...props} funds={FUNDS} />);

		const titleRow = container.querySelector("header > div");
		expect(titleRow).toContainElement(figureOf());
		expect(screen.getByText("balance").parentElement).toHaveClass("ml-auto");
	});

	it("holds the amount in tabular figures, so it cannot jitter poll to poll", () => {
		render(<Header {...props} funds={FUNDS} />);

		expect(figureOf()).toHaveClass("tabular-nums");
	});

	it("gives the label the full theme colour", () => {
		render(<Header {...props} funds={FUNDS} />);

		expect(screen.getByText("balance")).toHaveClass("text-theme");
	});

	it("states what an install would leave, beside the balance it would leave it in", () => {
		render(
			<Header
				{...props}
				funds={{
					...FUNDS,
					preview: {
						label: "after install",
						figure: "1811 KB",
						color: "vermillion",
					},
				}}
			/>
		);

		expect(screen.getByText("1811 KB")).toHaveAttribute(
			"data-screen-theme",
			"vermillion"
		);
		expect(screen.getByText(/after install/)).toBeInTheDocument();
	});

	it("says nothing about an install when nothing is pointed at", () => {
		render(<Header {...props} funds={FUNDS} />);

		expect(screen.queryByText(/after install/)).not.toBeInTheDocument();
	});

	it("shows no funds at all when none are given", () => {
		render(<Header {...props} />);

		expect(screen.queryByText("balance")).not.toBeInTheDocument();
	});

	it("lets a screen rename the title without touching the gate", () => {
		render(<Header {...props} title="Shop · cleared Volcano" />);

		expect(screen.getByText("Shop · cleared Volcano")).toBeInTheDocument();
		expect(screen.queryByText("#9 - Volcano Gate")).not.toBeInTheDocument();
	});

	it("says nothing beside the track unless the screen gives it a note", () => {
		const { container } = render(<Header {...props} />);

		expect(container.querySelector(".ml-auto")).toBeNull();
	});

	it("carries the note a screen hands it, and only that", () => {
		render(<Header {...props} note="next gate 10 · Earth · to pass 250%" />);

		expect(screen.getByText("next gate 10 · Earth · to pass 250%")).toHaveClass(
			"opacity-60",
			"ml-auto"
		);
	});

	it("keeps a note at the row's end by default", () => {
		render(<Header {...props} note="next gate 10" />);

		expect(screen.getByText("next gate 10")).toHaveClass("ml-auto");
	});

	it("sits a note beside the track when the screen asks for it", () => {
		render(<Header {...props} note="thirteen gates" noteAt="track" />);

		expect(screen.getByText("thirteen gates")).not.toHaveClass("ml-auto");
	});

	it("names the purse the amount came from, at whatever unit it rolled to", () => {
		render(
			<Header
				{...props}
				funds={{ amount: "1.9", unit: "MB", label: "archive", kb: 1946 }}
			/>
		);

		expect(figureOf("1.9 MB")).toBeInTheDocument();
		expect(screen.getByText("MB")).toBeInTheDocument();
		expect(screen.getByText("archive")).toBeInTheDocument();
		expect(screen.queryByText("balance")).not.toBeInTheDocument();
	});

	it("badges what the gate carries with it", () => {
		render(<Header {...props} badge="1 audit" />);

		expect(screen.getByText("1 audit")).toHaveClass("badge-theme");
	});

	it("outlines the lead swatch of a gate not yet cleared", () => {
		const { container } = render(<Header {...props} swatchState="current" />);

		const lead = container.querySelector("header > div > span");
		expect(lead).toHaveClass("border-2", "border-dashed", "border-theme");
		expect(lead).not.toHaveClass("bg-theme");
	});

	it("carries a quiet clause beside the title", () => {
		render(<Header {...props} title="New run" subtitle="gate 0 · Pallet" />);

		const subtitle = screen.getByText("gate 0 · Pallet");
		expect(subtitle).toHaveClass("text-xs", "text-theme-muted");
		expect(subtitle.closest("div")).toContainElement(
			screen.getByText("New run")
		);
	});

	it("shows no subtitle when none is given", () => {
		render(<Header {...props} />);

		expect(screen.queryByText("gate 0 · Pallet")).not.toBeInTheDocument();
	});
	it("reads the coverage the gate asks and what is held against it", () => {
		render(<Header {...props} coverage={COVERAGE} />);

		expect(screen.getByText("coverage")).toBeInTheDocument();
		expect(screen.getByText("92.5")).toBeInTheDocument();
		expect(screen.getByText("of")).toBeInTheDocument();
		expect(screen.getByText("375%")).toHaveClass("badge-theme");
	});

	it("holds the coverage figure in tabular figures, so it cannot jitter", () => {
		render(<Header {...props} coverage={COVERAGE} />);

		expect(screen.getByText("92.5")).toHaveClass("tabular-nums");
	});

	it("reads the coverage at the far end of the track row", () => {
		render(<Header {...props} coverage={COVERAGE} />);

		expect(screen.getByText("coverage").parentElement).toHaveClass("ml-auto");
	});

	it("draws the bar under both rows, out of the reading", () => {
		const { container } = render(<Header {...props} coverage={COVERAGE} />);

		expect(container.querySelector("header > [aria-hidden]")).toHaveClass(
			"h-1"
		);
	});

	it("draws no bar at all on a screen that asks for no coverage", () => {
		const { container } = render(<Header {...props} />);

		expect(container.querySelector("header > [aria-hidden]")).toBeNull();
	});
});

describe("Header funds, as the balance moves", () => {
	const props = { swatch: VOLCANO, swatches: trackTo(9) };

	const fundsAt = (kb: number, amount: string, unit = "KB") => ({
		amount,
		unit,
		label: "balance",
		kb,
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("counts to the new reading when the balance climbs", () => {
		const { rerender } = render(<Header {...props} funds={FUNDS} />);

		rerender(<Header {...props} funds={fundsAt(1875, "1875")} />);

		expect(countAt()).toBe("1875");
		expect(countOf()).toHaveAttribute("data-counts", "true");
	});

	it("tints the figure as it climbs, so a gain reads before it is parsed", () => {
		const { rerender } = render(<Header {...props} funds={FUNDS} />);

		rerender(<Header {...props} funds={fundsAt(1875, "1875")} />);

		expect(figureOf("1875 KB")).toHaveAttribute(
			"data-screen-theme",
			"viridian"
		);
	});

	it("tints the figure the other way when the balance falls", () => {
		const { rerender } = render(<Header {...props} funds={FUNDS} />);

		rerender(<Header {...props} funds={fundsAt(1811, "1811")} />);

		expect(figureOf("1811 KB")).toHaveAttribute(
			"data-screen-theme",
			"cinnabar"
		);
	});

	it("names the change in a pill, signed the way it went", () => {
		const { rerender } = render(<Header {...props} funds={FUNDS} />);

		rerender(<Header {...props} funds={fundsAt(1875, "1875")} />);

		expect(screen.getByRole("status")).toHaveTextContent("+32 KB");
	});

	it("names a loss with a minus rather than a plus", () => {
		const { rerender } = render(<Header {...props} funds={FUNDS} />);

		rerender(<Header {...props} funds={fundsAt(1811, "1811")} />);

		expect(screen.getByRole("status")).toHaveTextContent("\u221232 KB");
	});

	it("says nothing on arrival, so mounting a screen names no gain", () => {
		render(<Header {...props} funds={FUNDS} />);

		expect(screen.queryByRole("status")).not.toBeInTheDocument();
		expect(countOf()).toHaveAttribute("data-counts", "false");
	});

	it("drops the pill once the change has had time to be read", () => {
		vi.useFakeTimers();
		const { rerender } = render(<Header {...props} funds={FUNDS} />);

		rerender(<Header {...props} funds={fundsAt(1875, "1875")} />);
		expect(screen.getByRole("status")).toBeInTheDocument();

		act(() => {
			vi.advanceTimersByTime(BALANCE_PILL_HOLD_MS);
		});

		expect(screen.queryByRole("status")).not.toBeInTheDocument();
	});

	it("clears the tint with the pill, leaving the figure the screen's own", () => {
		vi.useFakeTimers();
		const { rerender } = render(<Header {...props} funds={FUNDS} />);

		rerender(<Header {...props} funds={fundsAt(1875, "1875")} />);

		act(() => {
			vi.advanceTimersByTime(BALANCE_PILL_HOLD_MS);
		});

		expect(figureOf("1875 KB")).not.toHaveAttribute("data-screen-theme");
	});

	it("refuses to count across a unit roll, which would climb downwards", () => {
		const { rerender } = render(
			<Header {...props} funds={fundsAt(999, "999")} />
		);

		rerender(<Header {...props} funds={fundsAt(1946, "1.9", "MB")} />);

		expect(countOf()).toHaveAttribute("data-counts", "false");
		expect(countAt()).toBe("1");
		expect(figureOf("1.9 MB")).toHaveTextContent(".9");
	});

	it("still names the change across a unit roll, where the digits cannot", () => {
		const { rerender } = render(
			<Header {...props} funds={fundsAt(999, "999")} />
		);

		rerender(<Header {...props} funds={fundsAt(1946, "1.9", "MB")} />);

		expect(screen.getByRole("status")).toHaveTextContent("+947 KB");
	});
});
