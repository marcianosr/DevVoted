import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import {
	kantoShopBuild,
	kantoTrackFills,
	usedSlotsOf,
} from "~/test/kantoPoll.factory";

import { SlotTrack, type SlotTrackFill } from "./SlotTrack.ui";

const appCss = readFileSync("src/styles/app.css", "utf8");

const CAPACITY = 10;

const FILLS = [
	{ name: ".ts", slots: 1 },
	{ name: "Code Coverage", slots: 2 },
	{ name: "Unit Tests", slots: 1 },
	{ name: "Moore's Law", slots: 1 },
	{ name: "Telemetry", slots: 2 },
] as const satisfies readonly SlotTrackFill[];

const trackOf = (container: HTMLElement) =>
	container.firstElementChild?.firstElementChild;

const boxesOf = (container: HTMLElement) =>
	Array.from(trackOf(container)?.querySelectorAll("span") ?? []);

const growOf = (box: HTMLElement) => box.style.flexGrow;

const captionOf = (container: HTMLElement) =>
	container.querySelector("p")?.textContent;

describe("SlotTrack", () => {
	it("draws one box per config, as many slots wide as the config takes", () => {
		const { container } = render(
			<SlotTrack fills={FILLS} capacity={CAPACITY} />
		);

		expect(boxesOf(container).slice(0, FILLS.length).map(growOf)).toEqual([
			"1",
			"2",
			"1",
			"1",
			"2",
		]);
	});

	it("sizes every box from its grow alone, so an edge cannot widen one", () => {
		const { container } = render(
			<SlotTrack fills={FILLS} capacity={CAPACITY} offered />
		);

		for (const box of boxesOf(container)) {
			expect(box).toHaveClass("basis-0");
		}
	});

	it("opens one dashed box per slot the build has not filled", () => {
		const { container } = render(
			<SlotTrack fills={FILLS} capacity={CAPACITY} />
		);

		expect(container.querySelectorAll(".border-dashed")).toHaveLength(3);
	});

	it("opens no boxes over capacity, rather than counting backwards", () => {
		const { container } = render(<SlotTrack fills={FILLS} capacity={4} />);

		expect(container.querySelectorAll(".border-dashed")).toHaveLength(0);
	});

	it("stands the room for sale only while there is room for sale", () => {
		const { container } = render(
			<SlotTrack fills={FILLS} capacity={CAPACITY} />
		);

		expect(container.querySelector(".bg-hatched-theme-fine")).toBeNull();
	});

	it("hatches the room for sale rather than dashing it", () => {
		const { container } = render(
			<SlotTrack fills={FILLS} capacity={CAPACITY} offered />
		);

		const unbought = container.querySelector(".bg-hatched-theme-fine");
		expect(unbought).not.toBeNull();
		expect(unbought).not.toHaveClass("border-dashed");
	});

	it("leaves the room standing open undashed by no hatch", () => {
		const { container } = render(
			<SlotTrack fills={FILLS} capacity={CAPACITY} offered />
		);

		for (const open of container.querySelectorAll(".border-dashed")) {
			expect(open).not.toHaveClass("bg-hatched-theme-fine");
		}
	});

	it("paints a filled box in the weight block's own colour", () => {
		const { container } = render(
			<SlotTrack fills={FILLS} capacity={CAPACITY} />
		);

		expect(boxesOf(container)[0]).toHaveClass("badge-theme");
	});

	it("lights the highlighted config's box in the screen's own colour", () => {
		const { container } = render(
			<SlotTrack fills={FILLS} capacity={CAPACITY} highlight="Code Coverage" />
		);

		const lit = boxesOf(container)[1];
		expect(lit).toHaveClass("bg-theme");
		expect(lit).not.toHaveClass("badge-theme");
	});

	it("leaves every other box unlit, so the highlight points at one config", () => {
		const { container } = render(
			<SlotTrack fills={FILLS} capacity={CAPACITY} highlight="Code Coverage" />
		);

		expect(
			container.querySelectorAll(".bg-theme:not(.bg-hatched-theme-fine)")
		).toHaveLength(1);
	});

	it("asks for a hover while nothing is highlighted", () => {
		render(<SlotTrack fills={FILLS} capacity={CAPACITY} />);

		expect(
			screen.getByText("hover a config to find its room on the track")
		).toBeInTheDocument();
	});

	it("names the highlighted config's cost in slots", () => {
		const { container } = render(
			<SlotTrack fills={FILLS} capacity={CAPACITY} highlight="Code Coverage" />
		);

		expect(captionOf(container)).toBe("Code Coverage takes 2 slots of 10");
	});

	it("says one slot rather than one slots", () => {
		const { container } = render(
			<SlotTrack fills={FILLS} capacity={CAPACITY} highlight=".ts" />
		);

		expect(captionOf(container)).toBe(".ts takes 1 slot of 10");
	});

	it("draws no box for a config too small to take a slot", () => {
		const { container } = render(
			<SlotTrack fills={[{ name: "Minified", slots: 0 }]} capacity={CAPACITY} />
		);

		expect(container.querySelectorAll(".badge-theme")).toHaveLength(0);
	});

	it("still names a config too small to draw, rather than going quiet", () => {
		const { container } = render(
			<SlotTrack
				fills={[{ name: "Minified", slots: 0 }]}
				capacity={CAPACITY}
				highlight="Minified"
			/>
		);

		expect(captionOf(container)).toBe("Minified takes 0 slots of 10");
	});

	it("counts a config too small to draw as taking no room", () => {
		const { container } = render(
			<SlotTrack fills={[{ name: "Minified", slots: 0 }]} capacity={4} />
		);

		expect(container.querySelectorAll(".border-dashed")).toHaveLength(4);
	});

	it("leaves the count to the band rather than announcing itself", () => {
		const { container } = render(
			<SlotTrack fills={FILLS} capacity={CAPACITY} />
		);

		expect(trackOf(container)).toHaveAttribute("aria-hidden");
	});

	it("draws exactly the slots the build reports as spent", () => {
		const drawn = kantoTrackFills.reduce((sum, fill) => sum + fill.slots, 0);

		expect(drawn).toBe(usedSlotsOf(kantoShopBuild));
	});
});

describe("the track's hatch", () => {
	it("hatches four times finer than the row-sized original", () => {
		const utility = appCss.slice(
			appCss.indexOf("@utility bg-hatched-theme-fine {")
		);
		const body = utility.slice(0, utility.indexOf("}"));

		expect(body).toContain("3px 6px");
		expect(body).not.toContain("12px 24px");
	});

	it("keeps the original's opaque, chroma-clamped ground step", () => {
		const utility = appCss.slice(
			appCss.indexOf("@utility bg-hatched-theme-fine {")
		);
		const body = utility.slice(0, utility.indexOf("}"));

		expect(body).toContain("--theme-color");
		expect(body).toContain("--theme-ground-chroma");
		expect(body).not.toMatch(/\/\s*0\./);
	});

	it("leaves the row-sized hatch at the period it was measured for", () => {
		const utility = appCss.slice(appCss.indexOf("@utility bg-hatched-theme {"));
		const body = utility.slice(0, utility.indexOf("}"));

		expect(body).toContain("12px 24px");
	});

	it("rests on the line the screen gives it", () => {
		render(
			<SlotTrack
				fills={[]}
				capacity={4}
				resting="pick one config and you can play"
			/>
		);

		expect(
			screen.getByText("pick one config and you can play")
		).toBeInTheDocument();
		expect(
			screen.queryByText("hover a config to find its room on the track")
		).not.toBeInTheDocument();
	});

	it("still names a highlighted config's room over its resting line", () => {
		render(
			<SlotTrack
				fills={[{ name: "Cache", slots: 2 }]}
				capacity={4}
				highlight="Cache"
				resting="pick one config and you can play"
			/>
		);

		expect(screen.getByText(/takes 2 slots of 4/)).toBeInTheDocument();
		expect(
			screen.queryByText("pick one config and you can play")
		).not.toBeInTheDocument();
	});

	it("drops its caption when the screen asks for the bar alone", () => {
		render(
			<SlotTrack
				fills={[{ name: "build", slots: 7 }]}
				capacity={8}
				caption={false}
			/>
		);

		expect(
			screen.queryByText("hover a config to find its room on the track")
		).not.toBeInTheDocument();
	});

	it("still draws the room itself with no caption", () => {
		const { container } = render(
			<SlotTrack
				fills={[{ name: "build", slots: 7 }]}
				capacity={8}
				caption={false}
			/>
		);

		expect(container.querySelectorAll(".badge-theme")).toHaveLength(1);
		expect(container.querySelectorAll(".border-dashed")).toHaveLength(1);
	});
});
