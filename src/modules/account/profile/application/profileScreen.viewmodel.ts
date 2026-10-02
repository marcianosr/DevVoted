import {
	DEX_TABS,
	RUNS_NOTE,
	runDetailFor,
	runRowFor,
	runTrackFor,
	type DexTab,
} from "~/modules/collection/dex/application/dexScreen.viewmodel";
import { isContributor } from "~/modules/account/profile/domain/authorship.model";
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
import type {
	ProfileRecordProps,
	RecordFigure,
} from "~/ui/kanto-theme/ProfileRecord.ui";
import { standingFor } from "~/modules/run/community/application/playerCard.viewmodel";

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
	...(isContributor(identity.authorship)
		? { contribution: identity.authorship }
		: {}),
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

const RECORD = {
	deepestGate: "deepest gate",
	swatches: "swatches",
	runs: "runs finished",
	yours: (figure: string) => `you ${figure}`,
	meta: (deepestGate: number) => `reached gate ${deepestGate}`,
	note: "Where they have been, and the gates they took without a wrong answer.",
} as const;

const COLLECTION = {
	polls: "polls",
	configs: "configs",
	titles: "titles",
	meta: "completion only",
	note: "Which polls they have seen, and the answers they gave, stay private.",
} as const;

const CLIMBING = {
	open: "a run is open",
	none: "nothing open",
} as const;

const RUNS = { meta: "most recent" } as const;

const figureOf = (
	label: string,
	held: number,
	total: number,
	yours: number | undefined
): RecordFigure => ({
	label,
	figure: HELD_OF(held, total),
	...(yours === undefined
		? {}
		: { yours: RECORD.yours(HELD_OF(yours, total)) }),
});

export const profileRecordFor = (
	record: ProfileRecord,
	yours?: ProfileRecord
): ProfileRecordProps => ({
	figures: [
		figureOf(
			RECORD.deepestGate,
			record.deepestGate,
			record.gatesTotal,
			yours?.deepestGate
		),
		figureOf(
			RECORD.swatches,
			record.clearedGates.length,
			record.gatesTotal,
			yours?.clearedGates.length
		),
		{ label: RECORD.runs, figure: String(record.runsFinished) },
	],
	swatches: runTrackFor(record.clearedGates),
	seats: record.seats.map((seat) => ({
		category: getCategoryMetadata(seat.category).name,
		figure: IN_A_ROW(seat.streak),
	})),
	meta: RECORD.meta(record.deepestGate),
	note: RECORD.note,
});

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
		count: plural(record.recentRuns.length, "run"),
		meta: RUNS.meta,
		note: RUNS_NOTE,
	};
};

export const profileClimbingFor = (
	standing: Standing | null
): ProfileClimbingProps =>
	standing === null
		? { meta: CLIMBING.none }
		: { meta: CLIMBING.open, standing: standingFor(standing) };

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
