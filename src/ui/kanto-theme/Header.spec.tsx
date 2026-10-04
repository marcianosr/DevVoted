import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import { gateSwatchAt, trackTo } from "~/test/swatchTrack.factory";

import { Header } from "./Header.ui";
import { NavRunContext } from "./useNavRun.hook";

const CINNABAR = gateSwatchAt(9);

const FUNDS = { label: "balance", kb: 843 } as const;

const COVERAGE = {
	label: "coverage",
	held: "92.5",
	demand: "375%",
	meter: { value: 92.5, max: 375 },
} as const;

const props = {
	swatch: CINNABAR,
	swatches: trackTo(9),
} as const;

describe("Header", () => {
	it("holds the coverage ring beside its rows rather than under them", () => {
		const { container } = render(
			<Header {...props} ring={{ held: 148, demand: 210 }} />
		);

		const ring = screen.getByRole("img", { name: /148% of 210% needed/ });
		expect(container.querySelector("header")).toContainElement(ring);
		expect(screen.getByText(/Cinnabar/)).toBeInTheDocument();
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

		expect(screen.getByText("Cinnabar Gate")).toBeInTheDocument();
	});

	it("quiets its note below the title", () => {
		render(<Header {...props} note="next gate 10" />);

		expect(screen.getByText("next gate 10")).toHaveClass("opacity-60");
	});

	it("pushes its note to the far end of the track row", () => {
		render(<Header {...props} note="next gate 10" />);

		expect(screen.getByText("next gate 10")).toHaveClass("ml-auto");
	});

	it("titles the page as its headline, with no margin of its own", () => {
		render(<Header {...props} />);

		const title = screen.getByRole("heading", { name: "Cinnabar Gate" });
		expect(title).toHaveClass("text-display", "font-extrabold");
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

	it("lets a screen rename the title without touching the gate", () => {
		render(<Header {...props} title="Shop · cleared Cinnabar" />);

		expect(screen.getByText("Shop · cleared Cinnabar")).toBeInTheDocument();
		expect(screen.queryByText("Cinnabar Gate")).not.toBeInTheDocument();
	});

	it("says nothing beside the track unless the screen gives it a note", () => {
		const { container } = render(<Header {...props} />);

		expect(container.querySelector(".ml-auto")).toBeNull();
	});

	it("carries the note a screen hands it, and only that", () => {
		render(<Header {...props} note="next gate 10 · Viridian · to pass 250%" />);

		expect(
			screen.getByText("next gate 10 · Viridian · to pass 250%")
		).toHaveClass("opacity-60", "ml-auto");
	});

	it("keeps a note at the row's end by default", () => {
		render(<Header {...props} note="next gate 10" />);

		expect(screen.getByText("next gate 10")).toHaveClass("ml-auto");
	});

	it("sits a note beside the track when the screen asks for it", () => {
		render(<Header {...props} note="thirteen gates" noteAt="track" />);

		expect(screen.getByText("thirteen gates")).not.toHaveClass("ml-auto");
	});

	it("badges what the gate carries with it", () => {
		render(<Header {...props} badges={[{ label: "1 audit" }]} />);

		expect(screen.getByText("1 audit")).toHaveClass("badge-theme");
	});

	it("badges each outcome in its own colour, one pill apiece", () => {
		render(
			<Header
				{...props}
				badges={[
					{ label: "3 of 5 right" },
					{ label: "swatch earned", color: "viridian" },
				]}
			/>
		);

		expect(screen.getByText("3 of 5 right")).toHaveClass("badge-theme");
		expect(screen.getByText("swatch earned")).toHaveAttribute(
			"data-screen-theme",
			"viridian"
		);
	});

	it("stacks a quiet line of subtext beneath the title, aligned past the swatch", () => {
		render(<Header {...props} title="New run" subtitle="gate 0 · Pallet" />);

		const subtitle = screen.getByText("gate 0 · Pallet");
		expect(subtitle).toHaveClass("text-sm", "text-theme-soft");
		expect(subtitle.parentElement).toHaveClass("col-start-2");
		expect(subtitle.parentElement?.parentElement).toContainElement(
			screen.getByText("New run")
		);
	});

	it("prefixes the title with the current gate's empty swatch", () => {
		render(<Header {...props} title="New run" />);

		const swatch = screen
			.getByText("New run")
			.previousElementSibling?.querySelector("[data-swatch-theme]");
		expect(swatch).toHaveAttribute("data-swatch-theme", props.swatch.theme);
		expect(swatch).toHaveClass("border-dashed");
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

	it("hands its track and balance to the nav rather than drawing them", () => {
		const publish = vi.fn();
		render(
			<NavRunContext.Provider value={publish}>
				<Header {...props} funds={FUNDS} />
			</NavRunContext.Provider>
		);

		expect(publish).toHaveBeenLastCalledWith({
			swatches: props.swatches,
			funds: FUNDS,
		});
		expect(
			screen.queryByRole("img", { name: /of 13 swatches discovered/ })
		).not.toBeInTheDocument();
		expect(
			screen.queryByRole("img", { name: "843 KB" })
		).not.toBeInTheDocument();
	});

	it("takes its track out of the nav when the screen leaves", () => {
		const publish = vi.fn();
		const { unmount } = render(
			<NavRunContext.Provider value={publish}>
				<Header {...props} />
			</NavRunContext.Provider>
		);

		unmount();

		expect(publish).toHaveBeenLastCalledWith(undefined);
	});
});
