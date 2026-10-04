import { describe, expect, it } from "vitest";

import {
	TOOLTIP_GAP,
	tooltipPlacementFor,
	VIEWPORT_GUTTER,
} from "~/shared/lib/tooltipPlacement";

const VIEWPORT = { width: 1280, height: 800 };
const PANEL = { width: 448, height: 400 };

const faceAt = (top: number, left: number) => ({
	top,
	bottom: top + 36,
	left,
	right: left + 36,
});

describe("tooltipPlacementFor", () => {
	it("opens below a face near the top of the screen, centred on it", () => {
		const placement = tooltipPlacementFor(faceAt(100, 600), VIEWPORT, PANEL);

		expect(placement.top).toBe(136 + TOOLTIP_GAP);
		expect(placement.bottom).toBeUndefined();
		expect(placement.left).toBe(618 - 224);
	});

	it("opens above a face near the bottom of the screen", () => {
		const placement = tooltipPlacementFor(faceAt(700, 600), VIEWPORT, PANEL);

		expect(placement.top).toBeUndefined();
		expect(placement.bottom).toBe(800 - 700 + TOOLTIP_GAP);
		expect(placement.maxHeight).toBe(700 - TOOLTIP_GAP - VIEWPORT_GUTTER);
	});

	it("keeps the card inside the gutter when the face hugs the left edge", () => {
		expect(tooltipPlacementFor(faceAt(100, 0), VIEWPORT, PANEL).left).toBe(
			VIEWPORT_GUTTER
		);
	});

	it("keeps the card inside the gutter when the face hugs the right edge", () => {
		expect(tooltipPlacementFor(faceAt(100, 1250), VIEWPORT, PANEL).left).toBe(
			1280 - 448 - VIEWPORT_GUTTER
		);
	});

	it("narrows the card to the screen minus both gutters on a phone", () => {
		const placement = tooltipPlacementFor(
			faceAt(100, 100),
			{ width: 375, height: 700 },
			PANEL
		);

		expect(placement.width).toBe(375 - 2 * VIEWPORT_GUTTER);
		expect(placement.left).toBe(VIEWPORT_GUTTER);
	});

	it("caps the height at the room on the side it opens", () => {
		const placement = tooltipPlacementFor(faceAt(300, 600), VIEWPORT, PANEL);

		expect(placement.maxHeight).toBe(800 - 336 - TOOLTIP_GAP - VIEWPORT_GUTTER);
	});
});
