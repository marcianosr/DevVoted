import {
	DEX_TABS,
	RUNS_NOTE,
	runRowFor,
	runTrackFor,
	type DexTab,
} from "~/modules/collection/dex/application/dexScreen.viewmodel";
import type { RunHistoryEntry } from "~/modules/collection/dex/domain/runHistory.model";
import type { CoverageBandId } from "~/modules/run/build/domain/coverageRatio.model";
import type { PublicBuild } from "~/modules/run/build/domain/publicBuild.model";
import {
	getCategoryMetadata,
	type CategoryCode,
} from "~/shared/lib/categories";
import { IN_A_ROW } from "~/shared/lib/copy";
import { plural } from "~/shared/lib/displayValue";
import { archiveLabel } from "~/shared/lib/storage";
import type { DexRunsProps } from "~/ui/kanto-theme/DexRuns.ui";
import {
	findBorderById,
	type Border,
} from "~/modules/account/profile/domain/border.model";
import { rankFor } from "~/modules/account/profile/domain/rank.model";
import type { KantoColor } from "~/ui/kanto-theme/colors";
import type { AppearancePreviewProps } from "~/modules/account/profile/presentation/AppearancePreview.ui";
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

const OWNER_TABS = [
	{ id: "appearance", label: "appearance", color: "fuchsia" },
	{ id: "borders", label: "borders", color: "vermillion" },
	{ id: "titles", label: "titles", color: "celadon" },
] as const satisfies readonly ProfileTab[];

export const PROFILE_TABS: readonly ProfileTab[] = [...DEX_TABS, ...OWNER_TABS];

export const isProfileTabId = (value: string): value is ProfileTabId =>
	PROFILE_TABS.some((tab) => tab.id === value);

const FALLBACK_TAB = PROFILE_TABS[0];

export const isOwnerTabId = (value: string): value is OwnerTabId =>
	OWNER_TAB_IDS.some((id) => id === value);

export const profileThemeOf = (activeId: string): KantoColor =>
	(PROFILE_TABS.find((tab) => tab.id === activeId) ?? FALLBACK_TAB).color;

export type ProfileIdentity = {
	readonly displayName: string;
	readonly githubUsername: string | null;
	readonly photoUrl: string | null;
	readonly borderUrl: string | null;
	readonly wornTitles: readonly string[];
	readonly pollsAnswered: number;
};

export const profileCardFor = (
	identity: ProfileIdentity,
	you: boolean
): ProfileCardProps => ({
	name: identity.displayName,
	titles: identity.wornTitles,
	rank: rankFor(identity.pollsAnswered),
	you,
	...(identity.githubUsername === null
		? {}
		: { handle: identity.githubUsername }),
	...(identity.photoUrl === null ? {} : { photoUrl: identity.photoUrl }),
	...(identity.borderUrl === null ? {} : { borderUrl: identity.borderUrl }),
});

const faceOf = (identity: ProfileIdentity) => {
	const [primaryTitle] = identity.wornTitles;
	return {
		...(primaryTitle === undefined ? {} : { title: primaryTitle }),
		...(identity.photoUrl === null ? {} : { photoUrl: identity.photoUrl }),
		...(identity.borderUrl === null ? {} : { borderUrl: identity.borderUrl }),
	};
};

export const appearancePreviewFor = (
	identity: ProfileIdentity
): Omit<AppearancePreviewProps, "tryingOn"> => ({
	card: profileCardFor(identity, false),
	byline: {
		handle: identity.githubUsername ?? identity.displayName,
		...faceOf(identity),
	},
	climber: { name: identity.displayName, ...faceOf(identity) },
});

export const triedOnBorderOf = (
	tryingOnId: string | null,
	equippedId: string | null
): Border | undefined =>
	tryingOnId === null || tryingOnId === equippedId
		? undefined
		: findBorderById(tryingOnId);

export type ProfileSeat = {
	readonly category: CategoryCode;
	readonly streak: number;
};

export type ProfileRecord = {
	readonly deepestGate: number;
	readonly gatesTotal: number;
	readonly clearedGates: readonly number[];
	readonly runsFinished: number;
	readonly seats: readonly ProfileSeat[];
	readonly recentRuns: readonly RunHistoryEntry[];
};

export type ProfileStanding = {
	readonly gate: number;
	readonly band: CoverageBandId | null;
	readonly coveragePercent: number;
	readonly streak: number;
	readonly storageKb: number;
	readonly bestCategory?: string;
	readonly build: PublicBuild;
};

export type ProfileTotals = {
	readonly pollsSeen: number;
	readonly pollsTotal: number;
	readonly configsHeld: number;
	readonly configsTotal: number;
	readonly titlesOwned: number;
	readonly titlesTotal: number;
	readonly archivedStorage: number;
};

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

const heldOf = (held: number, total: number): string => `${held} of ${total}`;

const figureOf = (
	label: string,
	held: number,
	total: number,
	yours: number | undefined
): RecordFigure => ({
	label,
	figure: heldOf(held, total),
	...(yours === undefined ? {} : { yours: RECORD.yours(heldOf(yours, total)) }),
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

export const profileRunsFor = (record: ProfileRecord): DexRunsProps => ({
	rows: record.recentRuns.map(runRowFor),
	count: plural(record.recentRuns.length, "run"),
	meta: RUNS.meta,
	note: RUNS_NOTE,
});

export const profileClimbingFor = (
	standing: ProfileStanding | null
): ProfileClimbingProps =>
	standing === null
		? { meta: CLIMBING.none }
		: {
				meta: CLIMBING.open,
				standing: standingFor({
					gate: standing.gate,
					coveragePercent: standing.coveragePercent,
					streak: standing.streak,
					storageKb: standing.storageKb,
					build: standing.build,
					...(standing.bestCategory === undefined
						? {}
						: { bestCategory: standing.bestCategory }),
				}),
			};

export const profileCollectionFor = (
	totals: ProfileTotals
): ProfileCollectionProps => ({
	counts: [
		{
			label: COLLECTION.polls,
			figure: heldOf(totals.pollsSeen, totals.pollsTotal),
			held: totals.pollsSeen,
			total: totals.pollsTotal,
		},
		{
			label: COLLECTION.configs,
			figure: heldOf(totals.configsHeld, totals.configsTotal),
			held: totals.configsHeld,
			total: totals.configsTotal,
		},
		{
			label: COLLECTION.titles,
			figure: heldOf(totals.titlesOwned, totals.titlesTotal),
			held: totals.titlesOwned,
			total: totals.titlesTotal,
		},
	],
	meta: `${COLLECTION.meta} · ${archiveLabel(totals.archivedStorage)}`,
	note: COLLECTION.note,
});
