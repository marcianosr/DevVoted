export const disclosedIn = (
	names: readonly string[],
	flipped: ReadonlySet<string>,
	openByDefault: boolean
): ReadonlySet<string> =>
	new Set(names.filter((name) => flipped.has(name) !== openByDefault));

export const INSTALLED_CARDS_OPEN = false;
export const OFFERED_CARDS_OPEN = true;
export const DEX_CARDS_OPEN = false;

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
