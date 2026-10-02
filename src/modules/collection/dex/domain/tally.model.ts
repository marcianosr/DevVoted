import { visibleTitles } from "~/modules/account/profile/domain/title.model";
import type { ConfigdexEntry } from "~/modules/collection/dex/domain/configdex.model";
import {
	isSeenPoll,
	type PollSighting,
} from "~/modules/collection/dex/domain/polldex.model";
import { isCategoryCode } from "~/shared/lib/categories";

export type Tally = { readonly held: number; readonly total: number };

export const tallyOf = <Entry>(
	entries: readonly Entry[],
	isHeld: (entry: Entry) => boolean
): Tally => ({
	held: entries.filter(isHeld).length,
	total: entries.length,
});

const isListedInDex = (sighting: PollSighting): boolean =>
	isCategoryCode(sighting.categoryCode);

export const pollTallyOf = (sightings: readonly PollSighting[]): Tally =>
	tallyOf(sightings.filter(isListedInDex), isSeenPoll);

export const configTallyOf = (entries: readonly ConfigdexEntry[]): Tally =>
	tallyOf(entries, (entry) => entry.state === "granted");

export const titleTallyOf = (ownedTitleIds: readonly string[]): Tally => {
	const owned = new Set(ownedTitleIds);
	return tallyOf(visibleTitles(ownedTitleIds), (title) => owned.has(title.id));
};
