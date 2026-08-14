import type { SwatchTheme } from "~/modules/run/gate/domain/swatch.model";

/**
 * Theme a subtree in a gate swatch's Kanto color, mirroring categoryTheme.
 * app.css is the single source of truth:
 * `[data-swatch-theme="boulder"] { --theme-color: var(--color-pewter) }`.
 * Spread onto a container, then style descendants with the `.text-theme` /
 * `.bg-theme` / `.border-theme` utilities. The Champion has no CSS block —
 * legendary swatches wear `.legendary-ring` instead of a flat color, so
 * `themeColorOf` hands this undefined and it renders no attribute at all.
 */
export const swatchTheme = (
	theme: SwatchTheme | undefined
): { "data-swatch-theme"?: SwatchTheme } =>
	theme ? { "data-swatch-theme": theme } : {};
