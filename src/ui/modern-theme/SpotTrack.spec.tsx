import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { SpotTrack, type SpotTrackConfig } from "./SpotTrack.ui";

const coldStart: SpotTrackConfig = {
	id: "cold-start",
	label: "Cold Start",
	spots: 2,
	rarity: "crumb",
};
const js: SpotTrackConfig = {
	id: "js",
	label: ".js",
	spots: 1,
	rarity: "bit",
};
const freemium: SpotTrackConfig = {
	id: "freemium",
	label: "Freemium",
	spots: 8,
	rarity: "byte",
};

const widthsIn = (track: HTMLElement): string[] =>
	Array.from(track.children).map((cell) =>
		cell instanceof HTMLElement ? cell.style.width : ""
	);

const track = () => screen.getByRole("meter");

describe(SpotTrack, () => {
	it("gives each config a bar as wide as the spots it takes", () => {
		render(<SpotTrack configs={[coldStart, js]} spots={4} />);

		const [crumb, bit] = widthsIn(track());
		expect(crumb).toBe("40%");
		expect(bit).toBe("20%");
	});

	it("draws the free room as a single region however wide it is", () => {
		render(<SpotTrack configs={[coldStart, js]} spots={4} />);

		expect(track().children).toHaveLength(4);
		expect(widthsIn(track())[2]).toBe("20%");
	});

	it("ends in a one-spot stub while the ladder still sells room", () => {
		render(<SpotTrack configs={[js]} spots={4} />);

		expect(widthsIn(track())).toEqual(["20%", "60%", "20%"]);
	});

	it("keeps the stub one spot wide however much is left to rent", () => {
		render(<SpotTrack configs={[js]} spots={2} maxSpots={24} />);

		expect(new Set(widthsIn(track())).size).toBe(1);
	});

	it("drops the stub once there is nothing left to rent", () => {
		render(<SpotTrack configs={[]} spots={8} maxSpots={8} />);

		expect(track().children).toHaveLength(1);
		expect(
			screen.queryByText("Clear a gate for more room, or rent a spot now")
		).not.toBeInTheDocument();
	});

	it("dashes the free room and hatches the room it cannot reach", () => {
		render(<SpotTrack configs={[js]} spots={4} maxSpots={24} />);

		const [, free, stub] = Array.from(track().children);
		expect(free).toHaveClass("border-dashed");
		expect(free).not.toHaveClass("bg-hatched");

		const hatched = stub?.querySelector("[aria-hidden]");
		expect(hatched).toHaveClass("bg-hatched");
		expect(hatched).not.toHaveClass("border-dashed");
	});

	it("prints nothing inside the hatching — no gate, no figure", () => {
		render(<SpotTrack configs={[js]} spots={4} maxSpots={24} />);

		const stub = Array.from(track().children)[2];
		expect(stub?.querySelector("[aria-hidden]")?.textContent).toBe("");
	});

	it("explains on the stub where the room comes from", () => {
		render(<SpotTrack configs={[js]} spots={4} />);

		const said = screen.getAllByText(
			"Clear a gate for more room, or rent a spot now"
		);
		expect(said).toHaveLength(2);
		expect(said.some((node) => node.className.includes("sr-only"))).toBe(true);
	});

	it("widens past a byte when rented spots take it there", () => {
		render(<SpotTrack configs={[freemium]} spots={16} maxSpots={16} />);

		expect(widthsIn(track())[0]).toBe("50%");
		expect(track()).toHaveAttribute("aria-valuemax", "16");
	});

	it("counts the free room and names the biggest grade that still fits", () => {
		render(<SpotTrack configs={[coldStart, js]} spots={8} fits="nibble" />);

		expect(
			screen.getByText("5 spots free · a nibble fits")
		).toBeInTheDocument();
	});

	it("counts one free spot in the singular", () => {
		render(<SpotTrack configs={[coldStart, js]} spots={4} fits="bit" />);

		expect(screen.getByText("1 spot free · a bit fits")).toBeInTheDocument();
	});

	it("says how to make room once nothing fits", () => {
		render(<SpotTrack configs={[freemium]} spots={8} fits={null} />);

		expect(
			screen.getByText("full · minify or uninstall to make room")
		).toBeInTheDocument();
	});

	it("names the overflow when the build outgrew its capacity", () => {
		render(<SpotTrack configs={[freemium]} spots={4} />);

		expect(
			screen.getByText(
				"over capacity by 4 · minify, uninstall, or rent more room"
			)
		).toBeInTheDocument();
		expect(track()).toHaveAttribute("aria-valuenow", "8");
		expect(track()).toHaveAttribute("aria-valuemax", "4");
	});

	it("colours each bar by the grade it holds", () => {
		render(<SpotTrack configs={[coldStart, js]} spots={4} />);

		const [crumb, bit] = Array.from(track().children);
		expect(crumb.className).toContain("text-cerulean");
		expect(bit.className).toContain("text-pewter");
	});

	it("rings a byte the way the legendary tier was always drawn", () => {
		render(<SpotTrack configs={[freemium]} spots={8} />);

		const [byte] = Array.from(track().children);
		expect(byte.className).toContain("legendary-ring");
		expect(byte.className).toContain("border-transparent");
	});

	it("leaves every lesser grade on its own coloured edge", () => {
		render(<SpotTrack configs={[coldStart, js]} spots={4} />);

		Array.from(track().children).forEach((bar) =>
			expect(bar.className).not.toContain("legendary-ring")
		);
	});

	it("trades the ring for the dotted edge once a byte is minified", () => {
		render(
			<SpotTrack
				configs={[{ ...freemium, spots: 4, minified: true }]}
				spots={4}
			/>
		);

		const [minified] = Array.from(track().children);
		expect(minified.className).toContain("border-dotted");
		expect(minified.className).not.toContain("legendary-ring");
	});

	it("gives the excess bar the losing colour rather than its grade's", () => {
		render(<SpotTrack configs={[freemium]} spots={4} />);

		const [excess] = Array.from(track().children);
		expect(excess.className).toContain("border-cinnabar");
		expect(excess.className).not.toContain("text-saffron");
	});

	it("marks a minified config apart from a whole one", () => {
		render(
			<SpotTrack
				configs={[{ ...freemium, spots: 4, minified: true }, js]}
				spots={8}
			/>
		);

		const [minified, whole] = Array.from(track().children);
		expect(minified.className).toContain("border-dotted");
		expect(whole.className).not.toContain("border-dotted");
	});

	it("states the occupancy on the meter rather than in a header", () => {
		render(<SpotTrack configs={[coldStart, js]} spots={4} />);

		expect(track()).toHaveAttribute("aria-label", "3 of 4 spots used");
		expect(screen.queryByText("3 of 4 spots")).not.toBeInTheDocument();
	});
});
