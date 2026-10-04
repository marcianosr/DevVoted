import {
	DEX_TABS,
	RUNS_NOTE,
	runDetailFor,
	runRowFor,
	runTrackFor,
	type DexTab,
} from "~/modules/collection/dex/application/dexScreen.viewmodel";
import type {
	ProfileIdentity,
	ProfileRecord,
	ProfileTotals,
} from "~/modules/account/profile/domain/profile.model";
import type { Tally } from "~/modules/collection/dex/domain/tally.model";
import type { Standing } from "~/modules/run/community/domain/standing.model";
import { getCategoryMetadata } from "~/shared/lib/categories";
import { HELD_OF, IN_A_ROW } from "~/shared/lib/copy";
import { plural } from "~/shared/lib/displayValue";
import { archiveLabel } from "~/shared/lib/storage";
import type { DexRunsProps } from "~/ui/kanto-theme/DexRuns.ui";
import {
	findBorderById,
	type Border,
} from "~/modules/account/profile/domain/border.model";
import { rankFor } from "~/modules/account/profile/domain/rank.model";
import type { ProfileCardProps } from "~/ui/kanto-theme/ProfileCard.ui";
import type { ProfileClimbingProps } from "~/ui/kanto-theme/ProfileClimbing.ui";
import type { ProfileCollectionProps } from "~/ui/kanto-theme/ProfileCollection.ui";
import type { ProfileBestRunProps } from "~/ui/kanto-theme/ProfileBestRun.ui";
import type { ProfileHeroProps, Trophy } from "~/ui/kanto-theme/ProfileHero.ui";
import type { ProfileSeatsProps } from "~/ui/kanto-theme/ProfileSeats.ui";
import {
	contributionOf,
	standingFor,
} from "~/modules/run/community/application/playerCard.viewmodel";

export const OWNER_TAB_IDS = ["appearance", "borders", "titles"] as const;

export type OwnerTabId = (typeof OWNER_TAB_IDS)[number];
export type ProfileTabId = DexTab["id"] | OwnerTabId;

export type ProfileTab = Omit<DexTab, "id"> & { id: ProfileTabId };

const APPEARANCE_TAB = {
	id: "appearance",
	label: "Appearance",
} as const satisfies ProfileTab;

const SHELF_TABS = [
	{ id: "borders", label: "Borders" },
	{ id: "titles", label: "Titles" },
] as const satisfies readonly ProfileTab[];

export const PROFILE_TABS: readonly ProfileTab[] = [
	APPEARANCE_TAB,
	...DEX_TABS,
	...SHELF_TABS,
];

export const isProfileTabId = (value: string): value is ProfileTabId =>
	PROFILE_TABS.some((tab) => tab.id === value);

export const isOwnerTabId = (value: string): value is OwnerTabId =>
	OWNER_TAB_IDS.some((id) => id === value);

export const profileCardFor = (
	identity: ProfileIdentity,
	you: boolean
): ProfileCardProps => ({
	name: identity.displayName,
	titles: identity.wornTitles,
	rank: rankFor(identity.pollsAnswered),
	you,
	contribution: contributionOf(identity.authorship, identity.pollsAnswered),
	...(identity.githubUsername === null
		? {}
		: { handle: identity.githubUsername }),
	...(identity.photoUrl === null ? {} : { photoUrl: identity.photoUrl }),
	...(identity.borderUrl === null ? {} : { borderUrl: identity.borderUrl }),
});

export const triedOnBorderOf = (
	tryingOnId: string | null,
	equippedId: string | null
): Border | undefined =>
	tryingOnId === null || tryingOnId === equippedId
		? undefined
		: findBorderById(tryingOnId);

const HERO = {
	deepestGate: "deepest gate",
	swatches: "swatches",
	runsWon: "runs won",
	outOf: (total: number) => `/ ${total}`,
	yours: (figure: number) => `you ${figure}`,
	note: "A swatch is a gate taken at 100% coverage.",
} as const;

const BEST_RUN = {
	meta: (gatesCleared: number) => `reached gate ${gatesCleared}`,
} as const;

const SEATS = {
	meta: (count: number) => `${plural(count, "seat")} held`,
} as const;

const COLLECTION = {
	polls: "polls",
	configs: "configs",
	titles: "titles",
	meta: "completion only",
	note: "Which polls they have seen, and the answers they gave, stay private.",
} as const;

const RUNS = { meta: "most recent" } as const;

const trophyOf = (
	label: string,
	held: number,
	total: number,
	yours: number | undefined
): Trophy => ({
	label,
	figure: String(held),
	outOf: HERO.outOf(total),
	...(yours === undefined ? {} : { yours: HERO.yours(yours) }),
});

export const profileHeroFor = (
	identity: ProfileIdentity,
	record: ProfileRecord,
	you: boolean,
	yours?: ProfileRecord
): ProfileHeroProps => ({
	...profileCardFor(identity, you),
	trophies: [
		trophyOf(
			HERO.deepestGate,
			record.deepestGate,
			record.gatesTotal,
			yours?.deepestGate
		),
		trophyOf(
			HERO.swatches,
			record.clearedGates.length,
			record.gatesTotal,
			yours?.clearedGates.length
		),
		{ label: HERO.runsWon, figure: String(record.runsWon) },
	],
	swatches: runTrackFor(record.clearedGates),
	note: HERO.note,
});

export const profileBestRunFor = ({
	bestRun,
}: ProfileRecord): ProfileBestRunProps | null =>
	bestRun === null
		? null
		: {
				run: runDetailFor(bestRun),
				meta: BEST_RUN.meta(bestRun.gatesCleared),
			};

export const profileSeatsFor = ({
	seats,
}: ProfileRecord): ProfileSeatsProps | null =>
	seats.length === 0
		? null
		: {
				seats: seats.map((seat) => ({
					category: getCategoryMetadata(seat.category).name,
					figure: IN_A_ROW(seat.streak),
				})),
				meta: SEATS.meta(seats.length),
			};

export const profileRunsFor = (
	record: ProfileRecord,
	selectedId?: string
): DexRunsProps => {
	const picked =
		record.recentRuns.find((entry) => String(entry.runId) === selectedId) ??
		record.recentRuns[0];

	return {
		rows: record.recentRuns.map(runRowFor),
		selectedId: picked === undefined ? null : String(picked.runId),
		detail: picked === undefined ? null : runDetailFor(picked),
		count: plural(record.runsFinished, "run"),
		meta: RUNS.meta,
		note: RUNS_NOTE,
	};
};

export const profileClimbingFor = (
	standing: Standing | null
): ProfileClimbingProps | null =>
	standing === null ? null : standingFor(standing);

const countOf = (label: string, { held, total }: Tally) => ({
	label,
	figure: HELD_OF(held, total),
	held,
	total,
});

export const profileCollectionFor = (
	totals: ProfileTotals
): ProfileCollectionProps => ({
	counts: [
		countOf(COLLECTION.polls, totals.polls),
		countOf(COLLECTION.configs, totals.configs),
		countOf(COLLECTION.titles, totals.titles),
	],
	meta: `${COLLECTION.meta} · ${archiveLabel(totals.archivedStorage)}`,
	note: COLLECTION.note,
});
