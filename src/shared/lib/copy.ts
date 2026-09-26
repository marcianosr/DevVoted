/**
 * The words and phrases more than one surface states. Its own module because the
 * spellings here are shared across layers, not just across files: `AUDITS` and
 * `NEEDED` are stated by both a kanto screen and a viewmodel, and `WEIGHT` by a
 * screen and a Tier 2 component. `src/shared/lib/` is the only path every layer
 * may import, so a theme folder would not reach far enough.
 *
 * Copy that one file alone states stays in that file's `COPY` object (ADR-102).
 * Casing that differs by screen is register, not drift: the run-over screen is
 * lowercase throughout, and `you` reads differently in a name slot than on a
 * badge. Neither belongs here.
 */

export const BUILD = "Build";
export const REGISTRY = "Registry";
export const AUDITS = "Audits";
export const WEIGHT = "weight";
/** The join in "14 of 16 weight", stated by the weight track and by a climber's card. */
export const OF = "of";
export const NEEDED = "needed";
export const LOCKED_CONFIG = "Locked config";
export const WHAT_EACH_POLL_PAID = "Score";
export const STORAGE_BALANCE = "Storage balance";

export const NOTHING_TO_COMPARE_YET =
	"Nothing to see yet — answer some of today’s polls first.";
