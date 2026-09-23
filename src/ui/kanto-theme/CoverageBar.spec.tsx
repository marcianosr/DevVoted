import { readFileSync } from "node:fs";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";

import {
	COVERAGE_BAND_COLOR,
	COVERAGE_PIN_HOLD_MS,
	CoverageBar,
	coverageBandOf,
} from "./CoverageBar.ui";

const appCss = readFileSync("src/styles/app.css", "utf8");

const VOLCANO = { floor: 55, ok: 65, healthy: 80 };
const PALLET = { floor: 0, ok: 0, healthy: 5 };

const zonesOf = (container: HTMLElement) =>
	Array.from(container.querySelectorAll(".coverage-bar-zone"));

const fillOf = (container: HTMLElement) =>
	container.querySelector(".coverage-bar-fill");

const basisOf = (zone: Element) =>
	zone.getAttribute("style")?.match(/flex-basis:\s*([\d.]+)%/)?.[1];

const themeOf = (node: Element | null) =>
	node?.getAttribute("data-screen-theme");

const heldOf = (container: HTMLElement) =>
	container
		.querySelector(".coverage-bar")
		?.getAttribute("style")
		?.match(/--coverage-held:\s*([\d.]+)%/)?.[1];

describe("CoverageBar", () => {
	it("cuts the track into the four rungs the gate asks for", () => {
		const { container } = render(<CoverageBar {...VOLCANO} held={70} />);

		expect(zonesOf(container).map(basisOf)).toEqual(["55", "10", "15", "20"]);
	});

	/**
	 * DVTD-znsu. The bar settles its reading during render, and NaN never equals
	 * itself, so a non-finite `held` used to re-render until React gave up with
	 * "Too many re-renders" — a blank screen, not a wrong number.
	 */
	it.each([NaN, Infinity, -Infinity])(
		"reads a non-finite %s as nothing rather than looping",
		(held) => {
			const { container } = render(<CoverageBar {...PALLET} held={held} />);

			expect(heldOf(container)).toBe("0");
		}
	);

	it("paints each rung the colour its band answers to", () => {
		const { container } = render(<CoverageBar {...VOLCANO} held={70} />);

		expect(zonesOf(container).map(themeOf)).toEqual([
			COVERAGE_BAND_COLOR.danger,
			COVERAGE_BAND_COLOR.shaky,
			COVERAGE_BAND_COLOR.ok,
			COVERAGE_BAND_COLOR.healthy,
		]);
	});

	it("fills to the share of the build that is covered", () => {
		const { container } = render(<CoverageBar {...VOLCANO} held={70} />);

		expect(heldOf(container)).toBe("70");
	});

	it("keeps the fill on the track when the reading runs past full", () => {
		const { container } = render(<CoverageBar {...VOLCANO} held={140} />);

		expect(heldOf(container)).toBe("100");
	});

	it("empties the fill rather than running it backwards off the track", () => {
		const { container } = render(<CoverageBar {...VOLCANO} held={-20} />);

		expect(heldOf(container)).toBe("0");
	});

	describe("the band the fill wears", () => {
		const bandAt = (held: number) => {
			const { container } = render(<CoverageBar {...VOLCANO} held={held} />);
			return themeOf(fillOf(container));
		};

		it("reads danger below the floor", () => {
			expect(bandAt(40)).toBe(COVERAGE_BAND_COLOR.danger);
		});

		it("reads shaky from the floor up to the ok line", () => {
			expect(bandAt(55)).toBe(COVERAGE_BAND_COLOR.shaky);
			expect(bandAt(64.9)).toBe(COVERAGE_BAND_COLOR.shaky);
		});

		it("reads ok from the ok line up to the gate's own line", () => {
			expect(bandAt(65)).toBe(COVERAGE_BAND_COLOR.ok);
			expect(bandAt(79.9)).toBe(COVERAGE_BAND_COLOR.ok);
		});

		it("reads healthy once the gate's line is met", () => {
			expect(bandAt(80)).toBe(COVERAGE_BAND_COLOR.healthy);
		});

		it("turns blue only at a fully covered build", () => {
			expect(bandAt(99.9)).toBe(COVERAGE_BAND_COLOR.healthy);
			expect(bandAt(100)).toBe(COVERAGE_BAND_COLOR.perfect);
		});
	});

	describe("a gate with no floor", () => {
		it("marks only the line it actually asks for", () => {
			render(<CoverageBar {...PALLET} held={2.5} />);

			expect(screen.queryByText("survive")).not.toBeInTheDocument();
			expect(screen.queryByText("OK")).not.toBeInTheDocument();
			expect(screen.getByText("HEALTHY 5%")).toBeInTheDocument();
		});

		it("collapses the rungs it has no room for rather than dropping them", () => {
			const { container } = render(<CoverageBar {...PALLET} held={2.5} />);

			expect(zonesOf(container).map(basisOf)).toEqual(["0", "0", "5", "95"]);
		});

		it("cannot read as danger, since nothing answered can close it", () => {
			const { container } = render(<CoverageBar {...PALLET} held={0} />);

			expect(themeOf(fillOf(container))).not.toBe(COVERAGE_BAND_COLOR.danger);
		});
	});

	it("names each boundary under the track, the gate's line with its figure", () => {
		render(<CoverageBar {...VOLCANO} held={70} />);

		expect(screen.getByText("survive")).toBeInTheDocument();
		expect(screen.getByText("OK")).toBeInTheDocument();
		expect(screen.getByText("HEALTHY 80%")).toBeInTheDocument();
	});

	it("stands each mark where its boundary falls", () => {
		render(<CoverageBar {...VOLCANO} held={70} />);

		expect(screen.getByText("survive")).toHaveStyle({ left: "55%" });
		expect(screen.getByText("HEALTHY 80%")).toHaveStyle({ left: "80%" });
	});

	it("reads the whole state aloud, since the bands are only colour", () => {
		render(<CoverageBar {...VOLCANO} held={70} />);

		expect(
			screen.getByRole("img", { name: "70% of 80% needed · OK" })
		).toBeInTheDocument();
	});

	it("keeps a fractional reading exact in what it announces", () => {
		render(<CoverageBar {...VOLCANO} held={12.5} />);

		expect(
			screen.getByRole("img", { name: "12.5% of 80% needed · DANGER" })
		).toBeInTheDocument();
	});

	it("draws the bare track when nothing is given to caption it", () => {
		render(<CoverageBar {...VOLCANO} held={70} />);

		expect(screen.queryByText(/Coverage starts/)).not.toBeInTheDocument();
	});

	it("carries its caption above the track when one is given", () => {
		render(<CoverageBar {...VOLCANO} held={70} note="Five polls to go." />);

		expect(screen.getByText("Five polls to go.")).toBeInTheDocument();
	});

	it("holds the band colours rather than wearing the screen's", () => {
		const { container } = render(<CoverageBar {...VOLCANO} held={70} />);

		expect(zonesOf(container)).toHaveLength(4);
		expect(zonesOf(container).map(themeOf)).not.toContain(null);
	});

	it("resolves its fill to an animation app.css declares", () => {
		expect(appCss).toContain(".coverage-bar-fill {");
		expect(appCss).toContain("--coverage-bar-duration");
	});

	it("leaves the fill's width to the sheet, so a starting style can outrank it", () => {
		const { container } = render(<CoverageBar {...VOLCANO} held={70} />);

		expect(fillOf(container)).not.toHaveAttribute("style");
		expect(appCss).toContain("width: var(--coverage-held");
	});

	it("animates on arrival, so the first paint is not already settled", () => {
		const rule = appCss.indexOf("width: var(--coverage-held");
		const starting = appCss.indexOf("@starting-style {", rule);

		expect(appCss.slice(starting)).toContain(".coverage-bar-fill");
		expect(starting).toBeGreaterThan(rule);
	});

	it("stops for a player who asked for less motion", () => {
		const guards = appCss.match(
			/@media \(prefers-reduced-motion: reduce\) \{[^}]*\}[^}]*\}/g
		);
		const ours = guards?.find((guard) => guard.includes(".coverage-bar-fill"));

		expect(ours).toContain("transition: none;");
	});
	describe("the pin that marks where the run landed", () => {
		const pinOf = (container: HTMLElement) =>
			container.querySelector(".coverage-bar-pin");

		it("stays out of sight while the meter is still running", () => {
			const { container } = render(<CoverageBar {...VOLCANO} held={70} />);

			expect(pinOf(container)).toHaveAttribute("data-shown", "false");
		});

		it("holds itself up for good once the gate has closed on it", () => {
			const { container } = render(<CoverageBar {...VOLCANO} held={70} pin />);

			expect(pinOf(container)).toHaveAttribute("data-shown", "true");
		});

		it("stands where the reading closed", () => {
			const { container } = render(<CoverageBar {...VOLCANO} held={70} pin />);

			expect(pinOf(container)).toHaveStyle({ left: "70%" });
		});

		it("states the figure it stands on", () => {
			const { container } = render(
				<CoverageBar {...VOLCANO} held={72.35} pin />
			);

			expect(pinOf(container)).toHaveTextContent("72.4%");
		});

		it("wears the band it closed in, not the band above it", () => {
			const { container } = render(<CoverageBar {...VOLCANO} held={70} pin />);

			expect(themeOf(pinOf(container))).toBe(COVERAGE_BAND_COLOR.ok);
		});

		it("comes to rest on the track when the reading ran past full", () => {
			const { container } = render(<CoverageBar {...VOLCANO} held={140} pin />);

			expect(pinOf(container)).toHaveStyle({ left: "100%" });
		});

		it("says nothing aloud, since the track already reads the figure", () => {
			const { container } = render(<CoverageBar {...VOLCANO} held={70} pin />);

			expect(pinOf(container)?.closest("[aria-hidden]")).not.toBeNull();
		});

		it("leaves the boundary marks their own row underneath the track", () => {
			const { container } = render(<CoverageBar {...VOLCANO} held={70} pin />);
			const rows = Array.from(
				container.querySelector(".coverage-bar")!.children
			);
			const trackAt = rows.findIndex((row) =>
				row.querySelector(".coverage-bar-fill")
			);

			expect(
				rows.findIndex((row) => row.querySelector(".coverage-bar-pin"))
			).toBeLessThan(trackAt);
			expect(
				rows.findIndex((row) => row.textContent?.includes("survive"))
			).toBeGreaterThan(trackAt);
		});
	});

	describe("the pin while the meter is running", () => {
		const pinOf = (container: HTMLElement) =>
			container.querySelector(".coverage-bar-pin");

		const countOf = (container: HTMLElement) =>
			container.querySelector(".coverage-bar-count");

		const shown = (container: HTMLElement) =>
			pinOf(container)?.getAttribute("data-shown");

		beforeEach(() => {
			vi.useFakeTimers();
		});

		afterEach(() => {
			vi.useRealTimers();
		});

		const settle = () => {
			act(() => {
				vi.advanceTimersByTime(COVERAGE_PIN_HOLD_MS);
			});
		};

		it("says nothing about a bar that has only just arrived", () => {
			const { container } = render(<CoverageBar {...VOLCANO} held={42} />);

			expect(shown(container)).toBe("false");
		});

		it("calls out the reading the answer moved it to", () => {
			const { container, rerender } = render(
				<CoverageBar {...VOLCANO} held={42} />
			);
			rerender(<CoverageBar {...VOLCANO} held={47} />);

			expect(shown(container)).toBe("true");
			expect(countOf(container)).toHaveStyle({ "--coverage-count": "47" });
		});

		it("rides the fill's leading edge rather than standing still", () => {
			const { container, rerender } = render(
				<CoverageBar {...VOLCANO} held={42} />
			);
			rerender(<CoverageBar {...VOLCANO} held={47} />);

			expect(pinOf(container)).toHaveStyle({ left: "47%" });
			expect(heldOf(container)).toBe("47");
		});

		it("counts a miss down as readily as it counts a correct answer up", () => {
			const { container, rerender } = render(
				<CoverageBar {...VOLCANO} held={47} />
			);
			rerender(<CoverageBar {...VOLCANO} held={42} />);

			expect(shown(container)).toBe("true");
			expect(countOf(container)).toHaveStyle({ "--coverage-count": "42" });
		});

		it("counts in whole percent, since a frozen tenth would read as a stuck digit", () => {
			const { container, rerender } = render(
				<CoverageBar {...VOLCANO} held={42} />
			);
			rerender(<CoverageBar {...VOLCANO} held={72.35} />);

			expect(countOf(container)).toHaveStyle({ "--coverage-count": "72" });
		});

		it("wears the band it moved into, not the one it left", () => {
			const { container, rerender } = render(
				<CoverageBar {...VOLCANO} held={60} />
			);
			rerender(<CoverageBar {...VOLCANO} held={70} />);

			expect(themeOf(pinOf(container))).toBe(COVERAGE_BAND_COLOR.ok);
		});

		it("drops back out of sight once the hold is spent", () => {
			const { container, rerender } = render(
				<CoverageBar {...VOLCANO} held={42} />
			);
			rerender(<CoverageBar {...VOLCANO} held={47} />);
			settle();

			expect(shown(container)).toBe("false");
		});

		it("restarts the hold when a second answer lands before the first fades", () => {
			const { container, rerender } = render(
				<CoverageBar {...VOLCANO} held={42} />
			);
			rerender(<CoverageBar {...VOLCANO} held={47} />);

			act(() => {
				vi.advanceTimersByTime(COVERAGE_PIN_HOLD_MS - 100);
			});
			rerender(<CoverageBar {...VOLCANO} held={52} />);
			act(() => {
				vi.advanceTimersByTime(COVERAGE_PIN_HOLD_MS - 100);
			});

			expect(shown(container)).toBe("true");
		});

		it("stays put when a rerender changes nothing about the reading", () => {
			const { container, rerender } = render(
				<CoverageBar {...VOLCANO} held={42} note="one" />
			);
			rerender(<CoverageBar {...VOLCANO} held={42} note="two" />);

			expect(shown(container)).toBe("false");
		});

		it("ignores a move it has already clamped away", () => {
			const { container, rerender } = render(
				<CoverageBar {...VOLCANO} held={140} />
			);
			rerender(<CoverageBar {...VOLCANO} held={180} />);

			expect(shown(container)).toBe("false");
		});

		it("announces the new reading, since the pin itself is drawn for the eye", () => {
			const { rerender } = render(<CoverageBar {...VOLCANO} held={42} />);
			rerender(<CoverageBar {...VOLCANO} held={47.5} />);

			expect(screen.getByRole("status")).toHaveTextContent("47.5%");
		});

		it("leaves a closed gate's pin to state its own tenth", () => {
			const { container } = render(
				<CoverageBar {...VOLCANO} held={72.35} pin />
			);

			expect(countOf(container)).toBeNull();
			expect(screen.queryByRole("status")).not.toBeInTheDocument();
		});
	});

	describe("the animation the moving pin resolves to", () => {
		it("counts its digits through an animation app.css declares", () => {
			expect(appCss).toContain("@property --coverage-count");
			expect(appCss).toContain(".coverage-bar-count {");
			expect(appCss).toContain(".coverage-bar-pin {");
		});

		it("runs the digits off the fill's own duration, so neither lands early", () => {
			const count = appCss.slice(appCss.indexOf(".coverage-bar-count {"));

			expect(count).toContain("var(--coverage-bar-duration)");
		});

		it("leaves the ring's duration to the ring, whose spec counts its uses", () => {
			const durations = appCss.match(/var\(--coverage-duration\)/g);

			expect(durations).toHaveLength(2);
		});

		it("stops the digits and the fade for a player who asked for less motion", () => {
			const guards = appCss.match(
				/@media \(prefers-reduced-motion: reduce\) \{[^}]*\}[^}]*\}/g
			);
			const ours = guards?.find((guard) =>
				guard.includes(".coverage-bar-fill")
			);

			expect(ours).toContain(".coverage-bar-count");
			expect(ours).toContain(".coverage-bar-pin");
			expect(ours).toContain("transition: none;");
		});
	});

	describe("coverageBandOf", () => {
		it("answers with the same band the fill wears", () => {
			expect(coverageBandOf(40, VOLCANO)).toBe("danger");
			expect(coverageBandOf(55, VOLCANO)).toBe("shaky");
			expect(coverageBandOf(65, VOLCANO)).toBe("ok");
			expect(coverageBandOf(80, VOLCANO)).toBe("healthy");
			expect(coverageBandOf(100, VOLCANO)).toBe("perfect");
		});

		it("clamps the reading rather than answering off the scale", () => {
			expect(coverageBandOf(140, VOLCANO)).toBe("perfect");
			expect(coverageBandOf(-20, VOLCANO)).toBe("danger");
		});

		it("cannot read danger at a gate with no floor to fall through", () => {
			expect(coverageBandOf(0, PALLET)).not.toBe("danger");
		});
	});
});

describe("boundary labels that would otherwise collide", () => {
	it("drops the OK label where OK has collapsed onto the gate's line", () => {
		render(<CoverageBar floor={0} ok={20} healthy={20} held={0} />);

		expect(screen.queryByText("OK")).not.toBeInTheDocument();
		expect(screen.getByText("HEALTHY 20%")).toBeInTheDocument();
	});

	it("grows each label away from its neighbours", () => {
		render(<CoverageBar {...VOLCANO} held={70} />);

		expect(screen.getByText("survive")).toHaveClass("-translate-x-full");
		expect(screen.getByText("OK")).toHaveClass("-translate-x-1/2");
		expect(screen.getByText("HEALTHY 80%")).not.toHaveClass(
			"-translate-x-1/2",
			"-translate-x-full"
		);
	});
});
