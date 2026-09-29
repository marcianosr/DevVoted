import type { PlayerAnchor } from "~/shared/hooks/usePlayerHover.hook";

export const TOOLTIP_GAP = 8;
export const VIEWPORT_GUTTER = 16;

export type Extent = { readonly width: number; readonly height: number };

export type TooltipPlacement = {
	readonly left: number;
	readonly width: number;
	readonly maxHeight: number;
	readonly top?: number;
	readonly bottom?: number;
};

const clamp = (value: number, min: number, max: number): number =>
	Math.min(Math.max(value, min), Math.max(min, max));

const roomBelow = (anchor: PlayerAnchor, viewport: Extent): number =>
	viewport.height - anchor.bottom - TOOLTIP_GAP - VIEWPORT_GUTTER;

const roomAbove = (anchor: PlayerAnchor): number =>
	anchor.top - TOOLTIP_GAP - VIEWPORT_GUTTER;

const opensBelow = (
	anchor: PlayerAnchor,
	viewport: Extent,
	panel: Extent
): boolean => {
	const below = roomBelow(anchor, viewport);
	return below >= panel.height || below >= roomAbove(anchor);
};

export const tooltipPlacementFor = (
	anchor: PlayerAnchor,
	viewport: Extent,
	panel: Extent
): TooltipPlacement => {
	const width = Math.min(panel.width, viewport.width - 2 * VIEWPORT_GUTTER);
	const centre = (anchor.left + anchor.right) / 2;
	const left = clamp(
		centre - width / 2,
		VIEWPORT_GUTTER,
		viewport.width - width - VIEWPORT_GUTTER
	);

	if (opensBelow(anchor, viewport, panel))
		return {
			left,
			width,
			top: anchor.bottom + TOOLTIP_GAP,
			maxHeight: roomBelow(anchor, viewport),
		};

	return {
		left,
		width,
		bottom: viewport.height - anchor.top + TOOLTIP_GAP,
		maxHeight: roomAbove(anchor),
	};
};
