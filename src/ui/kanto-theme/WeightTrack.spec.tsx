import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { KANTO_COLORS } from "./colors";
import {
	WeightTrack,
	roomLineOf,
	segmentColorOf,
	type WeightTrackFill,
} from "./WeightTrack.ui";

const appCss = readFileSync("src/styles/app.css", "utf8");

const HELD = 8;

const FILLS = [
	{ name: ".ts", slots: 1 },
	{ name: "Code Coverage", slots: 2 },
	{ name: "Unit Tests", slots: 1 },
	{ name: "Moore's Law", slots: 1 },
	{ name: "Telemetry", slots: 2 },
] as const satisfies readonly WeightTrackFill[];

const trackOf = (container: HTMLElement) =>
	container.firstElementChild?.firstElementChild;

const segmentsOf = (container: HTMLElement) =>
	Array.from(trackOf(container)?.querySelectorAll("li.segment-theme") ?? []);

const roomOf = (container: HTMLElement) =>
	trackOf(container)?.querySelector(".border-dashed");

const captionOf = (container: HTMLElement) =>
	container.querySelector("p")?.textContent;

const growOf = (node: Element) =>
	node instanceof HTMLElement ? node.style.flexGrow : "";

const visibleTextOf = (node: Element) =>
	Array.from(node.querySelectorAll("[aria-hidden]"))
		.filter((part) => part.querySelector(".segment-theme") === null)
		.map((part) => part.textContent)
		.join(" ");

describe("WeightTrack", () => {
	it("draws one segment per config, grown by the weight it carries", () => {
		const { container } = render(<WeightTrack fills={FILLS} held={HELD} />);

		expect(segmentsOf(container).map(growOf)).toEqual([
			"1",
			"2",
			"1",
			"1",
			"2",
		]);
	});

	it("sizes every segment from its grow alone, so padding cannot widen one", () => {
		const { container } = render(<WeightTrack fills={FILLS} held={HELD} />);

		for (const segment of segmentsOf(container)) {
			expect(segment).toHaveClass("basis-0");
		}
	});

	it("prints the name and the weight inside a segment wide enough for both", () => {
		const { container } = render(<WeightTrack fills={FILLS} held={HELD} />);

		expect(visibleTextOf(segmentsOf(container)[1])).toBe("Code Coverage 2");
	});

	it("drops the name but keeps the weight when the segment narrows", () => {
		const { container } = render(
			<WeightTrack
				fills={[
					{ name: "Freemium", slots: 15 },
					{ name: "Telemetry", slots: 1 },
				]}
				held={HELD}
			/>
		);

		expect(visibleTextOf(segmentsOf(container)[1])).toBe("1");
	});

	it("leaves a sliver too thin to read carrying no visible text at all", () => {
		const { container } = render(
			<WeightTrack
				fills={[
					{ name: "Freemium", slots: 40 },
					{ name: "Telemetry", slots: 1 },
				]}
				held={HELD}
			/>
		);

		expect(visibleTextOf(segmentsOf(container)[1])).toBe("");
	});

	it("drops the padding of a segment with nothing to print, so it draws nothing", () => {
		const { container } = render(
			<WeightTrack
				fills={[
					{ name: "Freemium", slots: 40 },
					{ name: "Telemetry", slots: 1 },
				]}
				held={HELD}
			/>
		);

		expect(segmentsOf(container)[1]).not.toHaveClass("px-1.5");
		expect(segmentsOf(container)[0]).toHaveClass("px-1.5");
	});

	it("reads every config and its weight out in full however narrow it drew", () => {
		render(<WeightTrack fills={FILLS} held={HELD} />);

		for (const fill of FILLS) {
			expect(
				screen.getByText(`${fill.name} · ${fill.slots} weight`)
			).toBeInTheDocument();
		}
	});

	it("still names a config minified to nothing, rather than going quiet", () => {
		render(
			<WeightTrack
				fills={[
					{ name: "Minified", slots: 0 },
					{ name: ".ts", slots: 1 },
				]}
				held={HELD}
			/>
		);

		expect(screen.getByText("Minified · 0 weight")).toBeInTheDocument();
	});

	it("dims every segment but the highlighted one", () => {
		const { container } = render(
			<WeightTrack fills={FILLS} held={HELD} highlight="Unit Tests" />
		);
		const [first, , lit] = segmentsOf(container);

		expect(lit).not.toHaveClass("opacity-35");
		expect(first).toHaveClass("opacity-35");
	});

	it("dims nothing when the highlight names no config in the build", () => {
		const { container } = render(
			<WeightTrack fills={FILLS} held={HELD} highlight="Cron" />
		);

		for (const segment of segmentsOf(container)) {
			expect(segment).not.toHaveClass("opacity-35");
		}
	});

	it("rounds the bar at its ends alone, leaving the inner joins square", () => {
		const { container } = render(<WeightTrack fills={FILLS} held={HELD} />);

		for (const segment of segmentsOf(container)) {
			expect(segment).toHaveClass("first:rounded-l-md", "last:rounded-r-md");
		}
	});
});

describe("the room the build has not filled", () => {
	it("opens the room ahead where the build stops, grown by what is left", () => {
		const { container } = render(
			<WeightTrack fills={[{ name: ".ts", slots: 2 }]} held={HELD} />
		);

		expect(growOf(roomOf(container) as Element)).toBe("6");
	});

	it("dashes the room rather than hatching it, it being the build's to fill", () => {
		const { container } = render(
			<WeightTrack fills={[{ name: ".ts", slots: 2 }]} held={HELD} />
		);

		expect(roomOf(container)).not.toHaveClass("bg-hatched-theme-fine");
	});

	it("draws no room ahead once the build fills the axis", () => {
		const { container } = render(
			<WeightTrack fills={[{ name: "Freemium", slots: 8 }]} held={HELD} />
		);

		expect(roomOf(container)).toBeNull();
	});

	it("grows the axis to hold a build heavier than the space it rents", () => {
		const { container } = render(
			<WeightTrack fills={[{ name: "Freemium", slots: 16 }]} held={HELD} />
		);

		expect(roomOf(container)).toBeNull();
		expect(captionOf(container)).toBe("16 of 8 weight · over by 8");
	});
});

describe("the config's facts", () => {
	it("hangs no panel off a segment, the card beside the track stating them", () => {
		const { container } = render(<WeightTrack fills={FILLS} held={HELD} />);

		expect(trackOf(container)?.querySelector(".fixed")).toBeNull();
	});
});

describe("the caption", () => {
	it("counts the room the rented space still has open", () => {
		const { container } = render(<WeightTrack fills={FILLS} held={HELD} />);

		expect(captionOf(container)).toBe("7 of 8 weight · 1 free");
	});

	it("names the overshoot once the build outweighs its space", () => {
		expect(roomLineOf(9, 8)).toBe("9 of 8 weight · over by 1");
	});

	it("reads nothing free when the build fills its space exactly", () => {
		expect(roomLineOf(8, 8)).toBe("8 of 8 weight · 0 free");
	});

	it("names a hovered config's room and quotes it no bill", () => {
		const { container } = render(
			<WeightTrack fills={FILLS} held={HELD} highlight="Telemetry" />
		);

		expect(captionOf(container)).toBe("Telemetry · 2 weight");
	});

	it("drops its caption when the screen asks for the bar alone", () => {
		const { container } = render(
			<WeightTrack fills={FILLS} held={HELD} caption={false} />
		);

		expect(container.querySelector("p")).toBeNull();
	});

	it("asks for nothing when the build is empty", () => {
		const { container } = render(<WeightTrack fills={[]} held={HELD} />);

		expect(segmentsOf(container)).toHaveLength(0);
		expect(captionOf(container)).toBe("0 of 8 weight · 8 free");
	});

	it("never divides by a space of nothing", () => {
		render(<WeightTrack fills={[]} held={0} />);

		expect(screen.getByText("0 of 0 weight · 0 free")).toBeInTheDocument();
	});
});

describe("WeightTrack's preview", () => {
	const PREVIEW = { name: "AGENTS.md", slots: 2, held: 12 };
	const incomingOf = (container: HTMLElement) =>
		trackOf(container)?.querySelector(".bg-hatched-theme");

	it("draws the armed config hatched after the build, sized by its weight", () => {
		const { container } = render(
			<WeightTrack fills={FILLS} held={HELD} preview={PREVIEW} />
		);

		const incoming = incomingOf(container);
		expect(incoming).toHaveAttribute("data-screen-theme", "saffron");
		expect(growOf(incoming as Element)).toBe("2");
		expect(segmentsOf(container)).toHaveLength(FILLS.length);
	});

	it("opens the room the grown build leaves after it", () => {
		const { container } = render(
			<WeightTrack fills={FILLS} held={HELD} preview={PREVIEW} />
		);

		expect(growOf(roomOf(container) as Element)).toBe("3");
	});

	it("says what the config takes and what the build grows to", () => {
		render(<WeightTrack fills={FILLS} held={HELD} preview={PREVIEW} />);

		expect(
			screen.getByText(
				"preview · AGENTS.md takes 2 weight, the build grows to 12"
			)
		).toBeInTheDocument();
	});

	it("names no growth when the build keeps its space", () => {
		render(
			<WeightTrack
				fills={[{ name: ".ts", slots: 1 }]}
				held={HELD}
				preview={{ ...PREVIEW, held: HELD }}
			/>
		);

		expect(
			screen.getByText("preview · AGENTS.md takes 2 weight")
		).toBeInTheDocument();
	});

	it("still states the preview on a screen that asks for the bar alone", () => {
		render(
			<WeightTrack
				fills={FILLS}
				held={HELD}
				preview={PREVIEW}
				caption={false}
			/>
		);

		expect(screen.getByText(/^preview · AGENTS.md/)).toBeInTheDocument();
	});
});

describe("the segment ramp", () => {
	it("gives neighbouring segments colours far enough apart to tell apart", () => {
		const walked = KANTO_COLORS.map((_, index) => segmentColorOf(index));

		for (const [index, color] of walked.entries()) {
			expect(color).not.toBe(walked[index - 1]);
		}
	});

	it("spends every Kanto colour before it repeats one", () => {
		const walked = KANTO_COLORS.map((_, index) => segmentColorOf(index));

		expect(new Set(walked).size).toBe(KANTO_COLORS.length);
	});

	it("wraps back to the first colour once the palette runs out", () => {
		expect(segmentColorOf(KANTO_COLORS.length)).toBe(segmentColorOf(0));
	});

	it("paints each segment with the colour its position earns", () => {
		const { container } = render(<WeightTrack fills={FILLS} held={HELD} />);

		expect(
			segmentsOf(container).map((segment) =>
				segment.getAttribute("data-screen-theme")
			)
		).toEqual(FILLS.map((_, index) => segmentColorOf(index)));
	});
});

describe("the segment's fill and ink", () => {
	const utility = appCss.slice(appCss.indexOf("@utility segment-theme {"));
	const body = utility.slice(0, utility.indexOf("}"));

	it("ships the ground and the ink together, so neither can be taken alone", () => {
		expect(body).toContain("background-color:");
		expect(body).toContain("color:");
	});

	it("inverts badge-theme rather than repeating it", () => {
		const badge = appCss.slice(appCss.indexOf("@utility badge-theme {"));
		const badgeBody = badge.slice(0, badge.indexOf("}"));

		expect(body).toContain("0.78");
		expect(badgeBody).toContain("0.3)");
		expect(body).not.toBe(badgeBody);
	});

	it("holds both lightnesses fixed so a row of segments reads as one bar", () => {
		expect(body).toMatch(/background-color:[^;]*\)\s*0\.78\s/);
		expect(body).toMatch(/color:[^;]*\)\s*0\.3\s/);
	});

	it("keeps chroma proportional so each hue stays itself", () => {
		expect(body).toContain("calc(c* 0.65)");
		expect(body).toContain("calc(c* 0.6)");
	});

	it("draws the build it opens on without slotting it in", () => {
		const { container } = render(
			<WeightTrack fills={FILLS.slice(0, 2)} held={HELD} />
		);

		expect(trackOf(container)).toHaveClass("weight-track");
		expect(container.querySelector(".weight-fill-new")).toBeNull();
	});

	it("slots in only the config that arrives after the bar is drawn", () => {
		const { container, rerender } = render(
			<WeightTrack fills={FILLS.slice(0, 2)} held={HELD} />
		);

		rerender(<WeightTrack fills={FILLS.slice(0, 3)} held={HELD} />);

		const arrived = segmentsOf(container).filter((segment) =>
			segment.classList.contains("weight-fill-new")
		);
		expect(arrived).toHaveLength(1);
		expect(arrived[0]).toHaveTextContent(FILLS[2].name);
	});

	it("slides its shares as the build changes", () => {
		expect(appCss).toMatch(
			/\.weight-track > li\s*\{[^}]*transition:\s*flex-grow/
		);
		expect(appCss).toMatch(/\.weight-fill-new\s*\{[^}]*animation:\s*slot-in/);
	});
});
