import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { gateSwatchAt, trackTo } from "~/test/swatchTrack.factory";

import { Header } from "./Header.ui";

const VOLCANO = gateSwatchAt(9);

const FUNDS = { amount: "1843", unit: "KB", label: "balance" } as const;

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

		expect(screen.getByText("Gate 9 · Volcano")).toBeInTheDocument();
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

		const title = screen.getByText("Gate 9 · Volcano");
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

	it("reads the funds as one badged figure beside its label", () => {
		render(<Header {...props} funds={FUNDS} />);

		expect(screen.getByText("1843 KB")).toHaveClass("badge-theme");
		expect(screen.getByText("balance")).toBeInTheDocument();
	});

	it("puts the funds opposite the gate name, on the title row", () => {
		const { container } = render(<Header {...props} funds={FUNDS} />);

		const titleRow = container.querySelector("header > div");
		expect(titleRow).toContainElement(screen.getByText("1843 KB"));
		expect(screen.getByText("1843 KB").parentElement).toHaveClass("ml-auto");
	});

	it("holds the amount in tabular figures, so it cannot jitter poll to poll", () => {
		render(<Header {...props} funds={FUNDS} />);

		expect(screen.getByText("1843 KB")).toHaveClass("tabular-nums");
	});

	it("gives the label the full theme colour", () => {
		render(<Header {...props} funds={FUNDS} />);

		expect(screen.getByText("balance")).toHaveClass("text-theme");
	});

	it("shows no funds at all when none are given", () => {
		render(<Header {...props} />);

		expect(screen.queryByText("balance")).not.toBeInTheDocument();
	});

	it("lets a screen rename the title without touching the gate", () => {
		render(<Header {...props} title="Shop · cleared Volcano" />);

		expect(screen.getByText("Shop · cleared Volcano")).toBeInTheDocument();
		expect(screen.queryByText("Gate 9 · Volcano")).not.toBeInTheDocument();
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
				funds={{ amount: "1.9", unit: "MB", label: "archive" }}
			/>
		);

		expect(screen.getByText("1.9 MB")).toBeInTheDocument();
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
