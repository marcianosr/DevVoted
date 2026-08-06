import type { SwatchTheme } from "~/modules/run/pipeline/swatch.model";

/**
 * Theme a subtree in a slot swatch's Kanto color, mirroring categoryTheme.
 * app.css is the single source of truth:
 * `[data-swatch-theme="boulder"] { --theme-color: var(--color-pewter) }`.
 * Spread onto a container, then style descendants with the `.text-theme` /
 * `.bg-theme` / `.border-theme` utilities. elite-four intentionally has no CSS
 * block — legendary swatches wear `.legendary-ring` instead of a flat color.
 */
export const swatchTheme = (
	theme: SwatchTheme
): { "data-swatch-theme": SwatchTheme } => ({
	"data-swatch-theme": theme,
});
