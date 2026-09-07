/**
 * Named surfaces, the composed counterpart to the `--color-surface` /
 * `--color-edge` tokens in app.css. A token says what one colour is for; these
 * say what a whole recurring surface looks like, so three popovers cannot drift
 * into three radii the way eleven border shades drifted before (DVTD-8ksp).
 *
 * Only surfaces that already appear more than once live here. A one-off panel
 * writes its own classes using the tokens — this is not a place to pre-declare
 * every shape the app might want.
 */

/**
 * Anything that floats above the page and needs an edge to read against it:
 * the config action menu and the run summary dropdown. Positioning is the call
 * site's, since each one anchors differently.
 */
export const FLOATING_SURFACE =
	"rounded-lg border border-edge-strong bg-surface";
