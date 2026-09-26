import {
	DEX_TABS,
	type DexTab,
} from "~/modules/collection/dex/application/dexScreen.viewmodel";
import { formatStorage } from "~/shared/lib/storage";
import type { KantoColor } from "~/ui/kanto-theme/colors";
import type { ProfileCardProps } from "~/ui/kanto-theme/ProfileCard.ui";

export const OWNER_TAB_IDS = ["borders", "titles"] as const;

export type OwnerTabId = (typeof OWNER_TAB_IDS)[number];
export type ProfileTabId = DexTab["id"] | OwnerTabId;

export type ProfileTab = Omit<DexTab, "id"> & { id: ProfileTabId };

const OWNER_TABS = [
	{ id: "borders", label: "borders", color: "fuchsia" },
	{ id: "titles", label: "titles", color: "viridian" },
] as const satisfies readonly ProfileTab[];

export const PROFILE_TABS: readonly ProfileTab[] = [...DEX_TABS, ...OWNER_TABS];

const FALLBACK_TAB = PROFILE_TABS[0];

export const isProfileTabId = (value: string): value is ProfileTabId =>
	PROFILE_TABS.some((tab) => tab.id === value);

export const isOwnerTabId = (value: string): value is OwnerTabId =>
	OWNER_TAB_IDS.some((id) => id === value);

export const profileThemeOf = (activeId: string): KantoColor =>
	(PROFILE_TABS.find((tab) => tab.id === activeId) ?? FALLBACK_TAB).color;

const ARCHIVE_SUFFIX = "archive";

export const archiveLabelOf = (archivedStorage: number): string =>
	`${formatStorage(archivedStorage)} ${ARCHIVE_SUFFIX}`;

export type ProfileIdentity = {
	readonly displayName: string;
	readonly githubUsername: string | null;
	readonly photoUrl: string | null;
	readonly borderUrl: string | null;
	readonly wornTitles: readonly string[];
};

export const profileCardFor = (
	identity: ProfileIdentity,
	you: boolean
): ProfileCardProps => ({
	name: identity.displayName,
	titles: identity.wornTitles,
	you,
	...(identity.githubUsername === null
		? {}
		: { handle: identity.githubUsername }),
	...(identity.photoUrl === null ? {} : { photoUrl: identity.photoUrl }),
	...(identity.borderUrl === null ? {} : { borderUrl: identity.borderUrl }),
});

export type ProfileTotals = {
	readonly pollsSeen: number;
	readonly pollsTotal: number;
	readonly configsHeld: number;
	readonly configsTotal: number;
	readonly gatesCleared: number;
	readonly gatesTotal: number;
	readonly archivedStorage: number;
};

const heldOf = (held: number, total: number, noun: string): string =>
	`${held} of ${total} ${noun}`;

export const profileTotalsFor = (totals: ProfileTotals): readonly string[] => [
	heldOf(totals.pollsSeen, totals.pollsTotal, "polls"),
	heldOf(totals.configsHeld, totals.configsTotal, "configs"),
	heldOf(totals.gatesCleared, totals.gatesTotal, "gates"),
	archiveLabelOf(totals.archivedStorage),
];
