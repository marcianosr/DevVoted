import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import {
	WeightTrack,
	upkeepAt,
	type UpkeepRung,
	type WeightTrackFill,
} from "./WeightTrack.ui";

const MAX = 20;

const FILLS = [
	{ name: ".ts", slots: 1 },
	{ name: "Code Coverage", slots: 2 },
	{ name: "Unit Tests", slots: 1 },
	{ name: "Moore's Law", slots: 1 },
	{ name: "Telemetry", slots: 2 },
] as const satisfies readonly WeightTrackFill[];

const RUNGS = [
	{ weight: 4, kb: 0 },
	{ weight: 6, kb: 16 },
	{ weight: 8, kb: 32 },
	{ weight: 12, kb: 64 },
	{ weight: 16, kb: 128 },
] as const satisfies readonly UpkeepRung[];

const CROWDED = [
	...RUNGS,
	{ weight: 24, kb: 256 },
	{ weight: 32, kb: 512 },
] as const satisfies readonly UpkeepRung[];

const trackOf = (container: HTMLElement) =>
	container.firstElementChild?.firstElementChild;

const blocksOf = (container: HTMLElement) =>
	Array.from(
		trackOf(container)?.querySelectorAll(".badge-theme, .bg-theme") ?? []
	);

const ticksOf = (container: HTMLElement) =>
	Array.from(trackOf(container)?.querySelectorAll(".w-px") ?? []);

const roomOf = (container: HTMLElement) =>
	trackOf(container)?.querySelector(".border-dashed");

const labelsOf = (container: HTMLElement) =>
	Array.from(container.querySelectorAll(".text-xxs")).map(
		(mark) => mark.textContent
	);

const captionOf = (container: HTMLElement) =>
	container.querySelector("p")?.textContent;

const leftOf = (node: Element) =>
	node instanceof HTMLElement ? node.style.left : "";

describe("WeightTrack", () => {
	it("places a block where its weight falls, not where it sits in the list", () => {
		const { container } = render(
			<WeightTrack fills={FILLS} rungs={RUNGS} max={MAX} />
		);

		expect(blocksOf(container).map(leftOf)).toEqual([
			"0%",
			"5%",
			"15%",
			"20%",
			"25%",
		]);
	});

	it("takes the gap out of the block's own width, so a tick stays on its threshold", () => {
		const { container } = render(
			<WeightTrack fills={FILLS} rungs={RUNGS} max={MAX} />
		);

		const [first, second] = blocksOf(container);
		expect(first).toHaveStyle({ width: "calc(5% - 3px)" });
		expect(second).toHaveStyle({ width: "calc(10% - 3px)" });
	});

	it("opens the room ahead where the build stops", () => {
		const { container } = render(
			<WeightTrack fills={FILLS} rungs={RUNGS} max={MAX} />
		);

		expect(leftOf(roomOf(container) as Element)).toBe("35%");
	});

	it("draws a tick at every rung, including the one that costs nothing", () => {
		const { container } = render(
			<WeightTrack fills={FILLS} rungs={RUNGS} max={MAX} />
		);

		expect(ticksOf(container).map(leftOf)).toEqual([
			"20%",
			"30%",
			"40%",
			"60%",
			"80%",
		]);
	});

	it("never labels the free rung, because no bill has a figure to print", () => {
		const { container } = render(
			<WeightTrack fills={FILLS} rungs={RUNGS} max={MAX} />
		);

		expect(labelsOf(container)).toEqual(["16 KB", "32 KB", "64 KB", "128 KB"]);
	});

	it("keeps a crowded rung's tick and drops only its label", () => {
		const { container } = render(
			<WeightTrack fills={FILLS} rungs={CROWDED} max={32} />
		);

		expect(ticksOf(container)).toHaveLength(CROWDED.length);
		expect(labelsOf(container)).toEqual([
			"16 KB",
			"64 KB",
			"128 KB",
			"256 KB",
			"512 KB",
		]);
	});

	it("paints a block in the weight block's own colour", () => {
		const { container } = render(
			<WeightTrack fills={FILLS} rungs={RUNGS} max={MAX} />
		);

		expect(blocksOf(container)[0]).toHaveClass("badge-theme");
	});

	it("lights the highlighted config's block in the screen's own colour", () => {
		const { container } = render(
			<WeightTrack
				fills={FILLS}
				rungs={RUNGS}
				max={MAX}
				highlight="Code Coverage"
			/>
		);

		const lit = blocksOf(container)[1];
		expect(lit).toHaveClass("bg-theme");
		expect(lit).not.toHaveClass("badge-theme");
	});

	it("names the bill and the room left before the next one", () => {
		const { container } = render(
			<WeightTrack fills={FILLS} rungs={RUNGS} max={MAX} />
		);

		expect(captionOf(container)).toBe("7 weight · 16 KB a gate · 1 to 32 KB");
	});

	it("says free under the first paid rung rather than nought bytes", () => {
		const { container } = render(
			<WeightTrack
				fills={[{ name: "Cache", slots: 3 }]}
				rungs={RUNGS}
				max={MAX}
			/>
		);

		expect(captionOf(container)).toBe("3 weight · free · 3 to 16 KB");
	});

	it("stops promising a next rung once the build is past the last one", () => {
		const { container } = render(
			<WeightTrack
				fills={[{ name: "Everything", slots: 34 }]}
				rungs={RUNGS}
				max={MAX}
			/>
		);

		expect(captionOf(container)).toBe("34 weight · 128 KB a gate");
	});

	it("prices a hovered config by the bill it would leave behind", () => {
		const { container } = render(
			<WeightTrack fills={FILLS} rungs={RUNGS} max={MAX} highlight=".ts" />
		);

		expect(captionOf(container)).toBe(
			".ts · 1 weight · without it, 16 KB a gate"
		);
	});

	it("says a hovered config is the whole bill when dropping it clears one", () => {
		const { container } = render(
			<WeightTrack
				fills={FILLS}
				rungs={RUNGS}
				max={MAX}
				highlight="Code Coverage"
			/>
		);

		expect(captionOf(container)).toBe(
			"Code Coverage · 2 weight · without it, free"
		);
	});

	it("grows the axis to hold a build heavier than the ladder", () => {
		const { container } = render(
			<WeightTrack
				fills={[{ name: "Everything", slots: 40 }]}
				rungs={RUNGS}
				max={MAX}
			/>
		);

		expect(blocksOf(container)[0]).toHaveStyle({ width: "calc(100% - 3px)" });
	});

	it("draws no room ahead once the build fills the axis", () => {
		const { container } = render(
			<WeightTrack
				fills={[{ name: "Everything", slots: MAX }]}
				rungs={RUNGS}
				max={MAX}
			/>
		);

		expect(roomOf(container)).toBeNull();
	});

	it("draws no block for a config too small to carry weight", () => {
		const { container } = render(
			<WeightTrack
				fills={[{ name: "Minified", slots: 0 }]}
				rungs={RUNGS}
				max={MAX}
			/>
		);

		expect(blocksOf(container)).toHaveLength(0);
	});

	it("still prices a config too small to draw, rather than going quiet", () => {
		const { container } = render(
			<WeightTrack
				fills={[{ name: "Minified", slots: 0 }]}
				rungs={RUNGS}
				max={MAX}
				highlight="Minified"
			/>
		);

		expect(captionOf(container)).toBe("Minified · 0 weight · without it, free");
	});

	it("leaves the reading to the caption rather than announcing itself", () => {
		const { container } = render(
			<WeightTrack fills={FILLS} rungs={RUNGS} max={MAX} />
		);

		expect(trackOf(container)).toHaveAttribute("aria-hidden");
	});

	it("hides the tick labels too, since the caption carries the bill", () => {
		const { container } = render(
			<WeightTrack fills={FILLS} rungs={RUNGS} max={MAX} />
		);

		for (const label of container.querySelectorAll(".text-xxs")) {
			expect(label.closest("[aria-hidden]")).not.toBeNull();
		}
	});

	it("drops its caption when the screen asks for the bar alone", () => {
		const { container } = render(
			<WeightTrack fills={FILLS} rungs={RUNGS} max={MAX} caption={false} />
		);

		expect(container.querySelector("p")).toBeNull();
		expect(blocksOf(container)).toHaveLength(FILLS.length);
	});

	it("reads a ladder handed to it out of order", () => {
		const { container } = render(
			<WeightTrack fills={FILLS} rungs={[...RUNGS].reverse()} max={MAX} />
		);

		expect(captionOf(container)).toBe("7 weight · 16 KB a gate · 1 to 32 KB");
	});
});

describe("upkeepAt", () => {
	it("bills the highest rung the build has passed, not the one it is nearing", () => {
		expect(upkeepAt(RUNGS, 7)).toBe(16);
	});

	it("bills nothing below the first rung", () => {
		expect(upkeepAt(RUNGS, 3)).toBe(0);
	});

	it("bills the rung exactly, standing on it", () => {
		expect(upkeepAt(RUNGS, 8)).toBe(32);
	});

	it("holds the top rung for every weight above it", () => {
		expect(upkeepAt(RUNGS, 40)).toBe(128);
	});

	it("steps rather than interpolating between two rungs", () => {
		expect(upkeepAt(RUNGS, 9)).toBe(upkeepAt(RUNGS, 11));
	});
});

describe("the track under a screen", () => {
	it("asks for nothing when the build is empty", () => {
		render(<WeightTrack fills={[]} rungs={RUNGS} max={MAX} />);

		expect(
			screen.getByText("0 weight · free · 6 to 16 KB")
		).toBeInTheDocument();
	});
});
