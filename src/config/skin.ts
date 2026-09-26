/**
 * Visual skins: a skin re-maps the named colour palette and drops a decorative
 * layer behind the page. Everything lives in `src/styles/app.css` under
 * `[data-skin="..."]`; this file only picks which one is active.
 *
 * "muisjes" celebrates a newborn — beschuit met muisjes, the Dutch rusk with
 * pink/blue aniseed sprinkles. Pick the colour once you know:
 *   - "muisjes"      pink + blue (before the announcement, or twins)
 *   - "muisjes-pink" a girl
 *   - "muisjes-blue" a boy
 *
 * Set to `undefined` for the plain DevVoted look.
 */
export type Skin = "muisjes" | "muisjes-pink" | "muisjes-blue";

// ponytail: one const, no picker UI — there is one skin family and it is a
// one-off celebration. Add a user setting when a second family shows up.
export const ACTIVE_SKIN: Skin | undefined = "muisjes";
