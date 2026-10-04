import { readFileSync } from "node:fs";

import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import {
	COVERAGE_BAND_COLOR,
	CoverageBar,
	type CoverageBandId,
	CoverageReading,
} from "./CoverageBar.ui";

const appCss = readFileSync("src/styles/app.css", "utf8");

const CINNABAR = { floor: 55, ok: 65, healthy: 80 };
const PALLET = { floor: 0, ok: 0, healthy: 5 };

type Ladder = { floor: number; ok: number; healthy: number };

const bandOnLadder = (
	held: number,
	{ floor, ok, healthy }: Ladder
): CoverageBandId => {
	if (held >= 100) return "perfect";
	if (held >= healthy) return "healthy";
	if (held >= ok) return "ok";
	if (held >= floor) return "shaky";
	return "danger";
};

const cinnabar = (held: number) => ({
	...CINNABAR,
	held,
	band: bandOnLadder(held, CINNABAR),
});

const pallet = (held: number) => ({
	...PALLET,
	held,
	band: bandOnLadder(held, PALLET),
});

const zonesOf = (container: HTMLElement) =>
	Array.from(container.querySelectorAll(".coverage-bar-zone"));

const litZonesOf = (container: HTMLElement) =>
	Array.from(
		container.querySelectorAll(
			".coverage-bar-lit > span:not(.coverage-bar-cap)"
		)
	);

const columnsOf = (layer: Element | null) =>
	layer
		?.getAttribute("style")
		?.match(/grid-template-columns:\s*([^;]+)/)?.[1]
		.trim()
		.split(/\s+/)
		.map((column) => column.replace("fr", ""));

const themeOf = (node: Element | null) =>
	node?.getAttribute("data-screen-theme");

const heldOf = (container: HTMLElement) =>
	container
		.querySelector(".coverage-bar")
		?.getAttribute("style")
		?.match(/--coverage-held:\s*([\d.]+)%/)?.[1];

const ruleOf = (selector: string) => {
	const start = appCss.indexOf(`${selector} {`);
	return appCss.slice(start, appCss.indexOf("}", start));
};

const reducedMotionGuards = () =>
	appCss.match(/@media \(prefers-reduced-motion: reduce\) \{[^}]*\}[^}]*\}/g) ??
	[];

describe("CoverageBar", () => {
	it("cuts the track into the four rungs the gate asks for", () => {
		render(<CoverageBar {...cinnabar(70)} />);

		expect(columnsOf(screen.getByRole("img"))).toEqual([
			"55",
			"10",
			"15",
			"20",
		]);
	});

	it("lays the lit layer on the same band grid as the track", () => {
		const { container } = render(<CoverageBar {...cinnabar(70)} />);

		expect(columnsOf(container.querySelector(".coverage-bar-lit"))).toEqual(
			columnsOf(screen.getByRole("img"))
		);
	});

	it.each([NaN, Infinity, -Infinity])(
		"reads a non-finite %s as nothing rather than looping",
		(held) => {
			const { container } = render(<CoverageBar {...pallet(held)} />);

			expect(heldOf(container)).toBe("0");
		}
	);

	it("paints each rung of the track the colour its band answers to", () => {
		const { container } = render(<CoverageBar {...cinnabar(70)} />);

		expect(zonesOf(container).map(themeOf)).toEqual([
			COVERAGE_BAND_COLOR.danger,
			COVERAGE_BAND_COLOR.shaky,
			COVERAGE_BAND_COLOR.ok,
			COVERAGE_BAND_COLOR.healthy,
		]);
	});

	it("caps the end of both layers in PERFECT's colour, since PERFECT is the full bar and has no width", () => {
		const { container } = render(<CoverageBar {...cinnabar(70)} />);

		const caps = Array.from(container.querySelectorAll(".coverage-bar-cap"));

		expect(caps.map(themeOf)).toEqual([
			COVERAGE_BAND_COLOR.perfect,
			COVERAGE_BAND_COLOR.perfect,
		]);
		expect(
			container.querySelector(".coverage-bar-lit .coverage-bar-cap")
		).not.toBeNull();
	});

	it("lights each band it has reached in that band's own colour", () => {
		const { container } = render(<CoverageBar {...cinnabar(70)} />);

		expect(litZonesOf(container).map(themeOf)).toEqual(
			zonesOf(container).map(themeOf)
		);
	});

	it("hands the sheet the share of the build that is covered", () => {
		const { container } = render(<CoverageBar {...cinnabar(70)} />);

		expect(heldOf(container)).toBe("70");
	});

	it("keeps the reading on the track when it runs past full", () => {
		const { container } = render(<CoverageBar {...cinnabar(140)} />);

		expect(heldOf(container)).toBe("100");
	});

	it("empties the reading rather than running it backwards off the track", () => {
		const { container } = render(<CoverageBar {...cinnabar(-20)} />);

		expect(heldOf(container)).toBe("0");
	});

	describe("a gate with no floor", () => {
		it("marks only the lines it actually asks for", () => {
			render(<CoverageBar {...pallet(2.5)} />);

			expect(screen.queryByText("SHAKY")).not.toBeInTheDocument();
			expect(screen.queryByText("OK")).not.toBeInTheDocument();
			expect(screen.getByText("HEALTHY")).toBeInTheDocument();
			expect(screen.getByText("5%")).toBeInTheDocument();
		});

		it("collapses the rungs it has no room for rather than dropping them", () => {
			render(<CoverageBar {...pallet(2.5)} />);

			expect(columnsOf(screen.getByRole("img"))).toEqual(["0", "0", "5", "95"]);
		});
	});

	it("ticks each boundary under the track with its figure and its band", () => {
		render(<CoverageBar {...cinnabar(70)} />);

		["55%", "SHAKY", "65%", "OK", "80%", "HEALTHY", "100%", "PERFECT"].forEach(
			(text) => expect(screen.getByText(text)).toBeInTheDocument()
		);
	});

	it("stands each tick where its boundary falls", () => {
		render(<CoverageBar {...cinnabar(70)} />);

		expect(screen.getByText("55%").parentElement).toHaveStyle({ left: "55%" });
		expect(screen.getByText("80%").parentElement).toHaveStyle({ left: "80%" });
		expect(screen.getByText("100%").parentElement).toHaveStyle({
			left: "100%",
		});
	});

	it("drops the band words from a narrow bar, keeping the figures", () => {
		render(<CoverageBar {...cinnabar(70)} />);

		expect(screen.getByText("SHAKY")).toHaveClass("@max-[500px]:hidden");
		expect(screen.getByText("55%")).not.toHaveClass("@max-[500px]:hidden");
	});

	it("reads the whole state aloud, since the bands are only colour", () => {
		render(<CoverageBar {...cinnabar(70)} />);

		expect(
			screen.getByRole("img", { name: "70% of 80% needed · OK" })
		).toBeInTheDocument();
	});

	it("keeps a fractional reading exact in what it announces", () => {
		render(<CoverageBar {...cinnabar(12.5)} />);

		expect(
			screen.getByRole("img", { name: "12.5% of 80% needed · DANGER" })
		).toBeInTheDocument();
	});

	it("announces a running reading, since the marker is drawn for the eye", () => {
		render(<CoverageBar {...cinnabar(47.5)} />);

		expect(screen.getByRole("status")).toHaveTextContent("47.5%");
	});

	it("carries its caption above the track when one is given", () => {
		render(<CoverageBar {...cinnabar(70)} note="Five polls to go." />);

		expect(screen.getByText("Five polls to go.")).toBeInTheDocument();
	});

	it("heads a panel with the percent held, then the band", () => {
		render(
			<CoverageReading floor={0} ok={40} healthy={60} held={42} band="ok" />
		);

		expect(screen.getByText("42%")).toBeInTheDocument();
		expect(screen.getByText("OK")).toBeInTheDocument();
	});

	describe("the ghost of an earlier reading", () => {
		const ghostOf = (container: HTMLElement) =>
			container.querySelector(".coverage-bar-ghost");

		it("stays out of sight when no earlier reading is given", () => {
			const { container } = render(<CoverageBar {...cinnabar(70)} />);

			expect(ghostOf(container)).toHaveAttribute("data-shown", "false");
		});

		it("fades in where the earlier reading stood", () => {
			const { container } = render(
				<CoverageBar {...cinnabar(70)} ghostAt={42} />
			);

			expect(ghostOf(container)).toHaveAttribute("data-shown", "true");
			expect(ghostOf(container)).toHaveStyle({ left: "42%" });
		});

		it("stays on the track when the earlier reading ran past full", () => {
			const { container } = render(
				<CoverageBar {...cinnabar(70)} ghostAt={130} />
			);

			expect(ghostOf(container)).toHaveStyle({ left: "100%" });
		});
	});

	describe("settling on a reading", () => {
		const gaugeOf = (container: HTMLElement) =>
			container.querySelector(".coverage-bar-lit")?.parentElement;

		it("does not bounce a bar that was never told to settle", () => {
			const { container } = render(<CoverageBar {...cinnabar(70)} />);

			expect(gaugeOf(container)).not.toHaveClass("coverage-bar-settle");
		});

		it("bounces when given a settle key", () => {
			const { container } = render(
				<CoverageBar {...cinnabar(70)} settleKey="close-4" />
			);

			expect(gaugeOf(container)).toHaveClass("coverage-bar-settle");
		});

		it("replays the bounce each time the settle key moves", () => {
			const { container, rerender } = render(
				<CoverageBar {...cinnabar(70)} settleKey="one" />
			);
			const play = vi.fn();
			const cancel = vi.fn();
			const gauge = gaugeOf(container)!;
			Object.defineProperty(gauge, "getAnimations", {
				value: () => [{ play, cancel }],
			});

			rerender(<CoverageBar {...cinnabar(70)} settleKey="two" />);

			expect(cancel).toHaveBeenCalledTimes(1);
			expect(play).toHaveBeenCalledTimes(1);
		});
	});

	describe("the motion app.css gives it", () => {
		it("registers the shown reading so the browser can tween it", () => {
			expect(appCss).toContain("@property --coverage-shown");
			expect(ruleOf("@property --coverage-shown")).toContain(
				'syntax: "<percentage>"'
			);
		});

		it("tweens the shown reading toward the held one", () => {
			expect(ruleOf(".coverage-bar")).toContain(
				"--coverage-shown: var(--coverage-held"
			);
			expect(ruleOf(".coverage-bar")).toContain(
				"transition: --coverage-shown 550ms cubic-bezier(0.3, 0.7, 0.2, 1)"
			);
		});

		it("clips the lit layer back to the shown reading", () => {
			expect(ruleOf(".coverage-bar-lit")).toContain(
				"clip-path: inset(0 calc(100% - var(--coverage-shown)) 0 0 round 8px)"
			);
		});

		it("rides the marker on the same reading as the clip", () => {
			expect(appCss).toContain(
				".coverage-bar-marker,\n.coverage-bar-pin {\n\tleft: var(--coverage-shown);"
			);
		});

		it("sweeps up from empty on arrival", () => {
			const rule = appCss.indexOf(".coverage-bar {");
			const starting = appCss.indexOf("@starting-style {", rule);

			expect(appCss.slice(starting, starting + 80)).toContain(
				"--coverage-shown: 0%"
			);
		});

		it("settles through the gauge-settle keyframe", () => {
			expect(ruleOf(".coverage-bar-settle")).toContain(
				"animation: gauge-settle 500ms"
			);
		});

		it("jumps straight to its reading for a player who asked for less motion", () => {
			const ours = reducedMotionGuards().find((guard) =>
				guard.includes(".coverage-bar,")
			);

			expect(ours).toContain("transition: none;");
		});

		it("does not bounce for a player who asked for less motion", () => {
			const ours = reducedMotionGuards().find((guard) =>
				guard.includes(".coverage-bar-settle")
			);

			expect(ours).toContain("animation: none;");
		});

		it("leaves the ring's duration to the ring, whose spec counts its uses", () => {
			expect(appCss.match(/var\(--coverage-duration\)/g)).toHaveLength(2);
		});
	});

	describe("the pin that marks where a closed gate landed", () => {
		const pinOf = (container: HTMLElement) =>
			container.querySelector(".coverage-bar-pin");

		it("draws no pin while the meter is still running", () => {
			const { container } = render(<CoverageBar {...cinnabar(70)} />);

			expect(pinOf(container)).toBeNull();
		});

		it("names the reading and the band it stands in, in that band's colour", () => {
			const { container } = render(<CoverageBar {...cinnabar(72.35)} pin />);

			expect(pinOf(container)).toHaveTextContent("72.4%");
			expect(pinOf(container)).toHaveTextContent("OK");
			expect(themeOf(pinOf(container))).toBe(COVERAGE_BAND_COLOR.ok);
		});

		it("says nothing aloud, since the track already reads the figure", () => {
			const { container } = render(<CoverageBar {...cinnabar(70)} pin />);

			expect(pinOf(container)?.closest("[aria-hidden]")).not.toBeNull();
			expect(screen.queryByRole("status")).not.toBeInTheDocument();
		});

		it("leaves the ticks their own row underneath the track", () => {
			const { container } = render(<CoverageBar {...cinnabar(70)} pin />);
			const rows = Array.from(
				container.querySelector(".coverage-bar")!.children
			);
			const trackAt = rows.findIndex((row) =>
				row.querySelector(".coverage-bar-lit")
			);

			expect(
				rows.findIndex((row) => row.querySelector(".coverage-bar-pin"))
			).toBeLessThan(trackAt);
			expect(
				rows.findIndex((row) => row.textContent?.includes("SHAKY"))
			).toBeGreaterThan(trackAt);
		});
	});
});

describe("boundary ticks that would otherwise collide", () => {
	it("drops the OK tick where OK has collapsed onto the gate's line", () => {
		render(
			<CoverageBar floor={0} ok={20} healthy={20} held={0} band="shaky" />
		);

		expect(screen.queryByText("OK")).not.toBeInTheDocument();
		expect(screen.getByText("HEALTHY")).toBeInTheDocument();
	});

	it("grows each tick away from its neighbours", () => {
		render(<CoverageBar {...cinnabar(70)} />);

		expect(screen.getByText("SHAKY").parentElement).toHaveClass(
			"-translate-x-full"
		);
		expect(screen.getByText("OK").parentElement).toHaveClass(
			"-translate-x-1/2"
		);
		expect(screen.getByText("HEALTHY").parentElement).not.toHaveClass(
			"-translate-x-1/2",
			"-translate-x-full"
		);
		expect(screen.getByText("PERFECT").parentElement).toHaveClass(
			"-translate-x-full"
		);
	});
});

describe("CoverageBar with a pointer instead of the pin", () => {
	const pinOf = (container: HTMLElement) =>
		container.querySelector(".coverage-bar-pin");

	it("points at the reading in the band it stands in, with no figure on it", () => {
		const { container } = render(<CoverageBar {...cinnabar(70)} pointer />);

		expect(pinOf(container)).toHaveTextContent("");
		expect(themeOf(pinOf(container))).toBe(COVERAGE_BAND_COLOR.ok);
	});

	it("names no boundary under the track", () => {
		render(<CoverageBar {...cinnabar(70)} pointer />);

		expect(screen.queryByText("SHAKY")).not.toBeInTheDocument();
	});

	it("still reads the whole state aloud", () => {
		render(<CoverageBar {...cinnabar(70)} pointer />);

		expect(screen.getByRole("img")).toHaveAccessibleName(/OK/);
	});
});
