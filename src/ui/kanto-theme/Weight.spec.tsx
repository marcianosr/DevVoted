import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { configSizes } from "~/test/kantoPoll.factory";

import { Weight } from "./Weight.ui";
import { SLOTS_AT_CAP, weightLadder, weightWidth } from "./weights";

const appCss = readFileSync("src/styles/app.css", "utf8");

const CAPPED_WIDTH = "w-13";
const RING = "ring-theme-soft";

describe("Weight", () => {
	it.each(configSizes)("reads %i as its figure", (slots) => {
		render(<Weight slots={slots} />);

		expect(screen.getByText(String(slots))).toBeInTheDocument();
	});

	it.each([
		[1, "w-6"],
		[2, "w-7"],
		[4, "w-9"],
		[8, "w-13"],
		[12, "w-13"],
		[16, "w-13"],
	])("draws a %i-slot config's block %s wide", (slots, width) => {
		render(<Weight slots={slots} />);

		expect(screen.getByText(String(slots))).toHaveClass(width);
	});

	it("never shortens the block as the slot count climbs", () => {
		const steps = configSizes.map((slots) =>
			weightLadder.indexOf(weightWidth(slots))
		);

		expect(steps).toStrictEqual([...steps].sort((a, b) => a - b));
	});

	it("stops growing past the cap, so the widest block is the capped one", () => {
		expect(weightWidth(SLOTS_AT_CAP)).toBe(CAPPED_WIDTH);
		expect(weightLadder.at(-1)).toBe(CAPPED_WIDTH);
	});

	it.each([0, 6])("draws a minified config's %i slots", (slots) => {
		render(<Weight slots={slots} />);

		expect(screen.getByText(String(slots))).toBeInTheDocument();
	});

	it.each([12, 16])(
		"rings a %i-slot block, whose length is clamped",
		(slots) => {
			render(<Weight slots={slots} />);

			expect(screen.getByText(String(slots))).toHaveClass(RING);
		}
	);

	it.each([1, 2, 4, 8])(
		"leaves a %i-slot block unringed, since its length is the truth",
		(slots) => {
			render(<Weight slots={slots} />);

			expect(screen.getByText(String(slots))).not.toHaveClass(RING);
		}
	);

	it("keeps the figure exact where the length is clamped", () => {
		const { container: twelve } = render(<Weight slots={12} />);
		const { container: sixteen } = render(<Weight slots={16} />);

		expect(twelve.textContent).toBe("12");
		expect(sixteen.textContent).toBe("16");
	});

	it("reads as one figure rather than a row that grows with the count", () => {
		const { container: one } = render(<Weight slots={1} />);
		const { container: sixteen } = render(<Weight slots={16} />);

		expect(one.querySelectorAll("span")).toHaveLength(
			sixteen.querySelectorAll("span").length
		);
	});

	it.each(configSizes)(
		"leaves a %i-slot block untinted, so length is the only size cue",
		(slots) => {
			const { container } = render(<Weight slots={slots} />);

			expect(container.querySelector("[data-screen-theme]")).toBeNull();
		}
	);

	it("takes the screen's own accent rather than a neutral surface", () => {
		render(<Weight slots={4} />);

		const block = screen.getByText("4");
		expect(block).toHaveClass("badge-theme");
		expect(block).not.toHaveClass("bg-surface-raised", "text-pewter");
		expect(appCss).toContain("@utility badge-theme");
	});

	it("follows the screen it sits on rather than carrying a colour", () => {
		const { container } = render(<Weight slots={4} />);

		expect(container.querySelector("[data-screen-theme]")).toBeNull();
	});

	it("holds the figure on one line", () => {
		const { container } = render(<Weight slots={16} />);

		expect(container.firstChild).toHaveClass("inline-flex", "items-center");
	});
});
