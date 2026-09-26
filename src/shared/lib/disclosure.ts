/**
 * What a panel of disclosable cards holds is the flips *away from its default*,
 * never the open set itself. A shelf re-rolls and a build gains and loses
 * configs mid-run, so an absolute set of open names would have to be reconciled
 * against every new list; a set of exceptions needs no reconciling, and a card
 * the panel stops listing simply stops being asked about.
 */
export const disclosedIn = (
	names: readonly string[],
	flipped: ReadonlySet<string>,
	openByDefault: boolean
): ReadonlySet<string> =>
	new Set(names.filter((name) => flipped.has(name) !== openByDefault));

/**
 * A config you already hold is a line you scan down; one you are deciding about
 * has to argue for itself. The two panels therefore open the opposite way, and
 * the policy lives here so they cannot drift apart.
 */
export const INSTALLED_CARDS_OPEN = false;
export const OFFERED_CARDS_OPEN = true;

/**
 * The flips that put a whole panel in one state. Expressed the same way as a
 * single toggle — as deviation from the default — so a panel that is opened all
 * at once and then re-rolls still hands new cards their default.
 */
export const discloseAll = (
	names: readonly string[],
	open: boolean,
	openByDefault: boolean
): ReadonlySet<string> => (open === openByDefault ? new Set() : new Set(names));

export const toggleDisclosure = (
	flipped: ReadonlySet<string>,
	name: string
): ReadonlySet<string> => {
	const next = new Set(flipped);
	if (!next.delete(name)) next.add(name);
	return next;
};
