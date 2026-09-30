import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";

import { BandLadder, type LadderRung } from "./BandLadder.ui";
import { COVERAGE_BAND_COLOR, type CoverageLadder } from "./CoverageBar.ui";

const LAVENDER_LINES: CoverageLadder = { floor: 48, ok: 56, healthy: 62 };

const LAVENDER: readonly LadderRung[] = [
	{ band: "danger", from: 0, to: 48, pays: "the run ends" },
	{ band: "shaky", from: 48, to: 56, pays: "−64 KB peel" },
	{ band: "ok", from: 56, to: 62, pays: "+40 KB" },
	{ band: "healthy", from: 62, to: 100, pays: "+58 KB" },
	{ band: "perfect", from: 100, to: 100, pays: "+96 KB" },
];

const PALLET_LINES: CoverageLadder = { floor: 0, ok: 40, healthy: 60 };

const PALLET: readonly LadderRung[] = [
	{ band: "shaky", from: 0, to: 40, pays: "no peel" },
	{ band: "ok", from: 40, to: 60, pays: "+13 KB" },
	{ band: "healthy", from: 60, to: 100, pays: "+19 KB" },
	{ band: "perfect", from: 100, to: 100, pays: "+32 KB" },
];

const rowsOf = (container: HTMLElement) => [
	...container.querySelectorAll<HTMLElement>(".band-ladder-row"),
];

const themeOf = (node: Element | null | undefined) =>
	node?.getAttribute("data-screen-theme");

const standingOf = (container: HTMLElement) =>
	rowsOf(container).filter(
		(row) => row.getAttribute("aria-current") === "true"
	);

const zonesOf = (container: HTMLElement) => [
	...container.querySelectorAll<HTMLElement>(".coverage-bar-zone"),
];

describe("BandLadder", () => {
	it("draws the bar at true scale, so each band is as wide as the coverage it spans", () => {
		const { container } = render(
			<BandLadder held={0} lines={LAVENDER_LINES} rungs={LAVENDER} />
		);

		expect(zonesOf(container).map((zone) => zone.style.flexBasis)).toEqual([
			"48%",
			"8%",
			"6%",
			"38%",
		]);
	});

	it("lists a row per rung, worst first, with the full bar last", () => {
		const { container } = render(
			<BandLadder held={0} lines={LAVENDER_LINES} rungs={LAVENDER} />
		);

		expect(rowsOf(container).map(themeOf)).toEqual([
			COVERAGE_BAND_COLOR.danger,
			COVERAGE_BAND_COLOR.shaky,
			COVERAGE_BAND_COLOR.ok,
			COVERAGE_BAND_COLOR.healthy,
			COVERAGE_BAND_COLOR.perfect,
		]);
	});

	it("writes each band's range out, so the room between the lines reads as numbers", () => {
		const { container } = render(
			<BandLadder held={0} lines={LAVENDER_LINES} rungs={LAVENDER} />
		);

		const [danger, shaky, , , perfect] = rowsOf(container);

		expect(within(danger).getByText("0 – 48")).toBeInTheDocument();
		expect(within(shaky).getByText("48 – 56")).toBeInTheDocument();
		expect(within(perfect).getByText("100")).toBeInTheDocument();
	});

	it("badges each band's name and what finishing there pays", () => {
		const { container } = render(
			<BandLadder held={0} lines={LAVENDER_LINES} rungs={LAVENDER} />
		);

		const ok = within(rowsOf(container)[2]);

		expect(ok.getByText("OK")).toHaveClass("badge-theme");
		expect(ok.getByText("+40 KB")).toHaveClass("badge-theme");
	});

	it("rings the rung the run stands in and no other", () => {
		const { container } = render(
			<BandLadder held={58} lines={LAVENDER_LINES} rungs={LAVENDER} />
		);

		expect(standingOf(container)).toHaveLength(1);
		expect(standingOf(container)[0]).toHaveClass("ring-2");
		expect(themeOf(standingOf(container)[0])).toBe(COVERAGE_BAND_COLOR.ok);
	});

	it("rings the full bar at a full bar", () => {
		const { container } = render(
			<BandLadder held={100} lines={LAVENDER_LINES} rungs={LAVENDER} />
		);

		expect(themeOf(standingOf(container)[0])).toBe(COVERAGE_BAND_COLOR.perfect);
	});

	it("pins the reading on the bar where the run stands", () => {
		const { container } = render(
			<BandLadder held={59} lines={LAVENDER_LINES} rungs={LAVENDER} />
		);

		const pin = container.querySelector<HTMLElement>(".coverage-bar-pin");

		expect(pin).toHaveStyle({ left: "59%" });
		expect(pin).toHaveTextContent("OK");
	});

	it("lists neither DANGER nor a floor at a gate with nothing under it", () => {
		const { container } = render(
			<BandLadder held={0} lines={PALLET_LINES} rungs={PALLET} />
		);

		expect(rowsOf(container)).toHaveLength(4);
		expect(screen.queryByText("DANGER")).toBeNull();
		expect(themeOf(standingOf(container)[0])).toBe(COVERAGE_BAND_COLOR.shaky);
	});
});
