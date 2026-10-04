import {
	authorshipOf,
	type Authorship,
	type AuthorRole,
} from "~/modules/account/profile/domain/authorship.model";
import { borderUrlOf } from "~/modules/account/profile/domain/border.model";
import { profileThemeFor } from "~/modules/account/profile/domain/profileTheme.model";
import { wornTitleNames } from "~/modules/account/profile/domain/title.model";
import type { RunHistoryEntry } from "~/modules/collection/dex/domain/runHistory.model";
import type { Tally } from "~/modules/collection/dex/domain/tally.model";
import type { Standing } from "~/modules/run/community/domain/standing.model";
import type { SwatchTheme } from "~/modules/run/gate/domain/swatch.model";
import type { CategoryCode } from "~/shared/lib/categories";

export type ProfileIdentity = {
	readonly displayName: string;
	readonly githubUsername: string | null;
	readonly photoUrl: string | null;
	readonly borderUrl: string | null;
	readonly wornTitles: readonly string[];
	readonly pollsAnswered: number;
	readonly authorship: Authorship;
};

export type ProfileFace = {
	readonly identity: ProfileIdentity;
	readonly theme: SwatchTheme;
};

export type ProfileSource = {
	readonly displayName: string;
	readonly githubUsername: string | null;
	readonly photoUrl: string | null;
	readonly equippedBorderId: string | null;
	readonly equippedTitleIds: readonly string[];
	readonly ownedSwatchIds: readonly string[];
	readonly equippedSwatchId: string | null;
	readonly role: AuthorRole;
};

export type PublishedPolls = Omit<Authorship, "role">;

export const profileFaceOf = (
	source: ProfileSource,
	publishedPolls: PublishedPolls,
	pollsAnswered: number
): ProfileFace => ({
	identity: {
		displayName: source.displayName,
		githubUsername: source.githubUsername,
		photoUrl: source.photoUrl,
		borderUrl: borderUrlOf(source.equippedBorderId),
		wornTitles: wornTitleNames(source.equippedTitleIds),
		pollsAnswered,
		authorship: authorshipOf(source.role, publishedPolls),
	},
	theme: profileThemeFor(source.equippedSwatchId, source.ownedSwatchIds),
});

export type ProfileSeat = {
	readonly category: CategoryCode;
	readonly streak: number;
};

export type ProfileRecord = {
	readonly deepestGate: number;
	readonly gatesTotal: number;
	readonly clearedGates: readonly number[];
	readonly runsFinished: number;
	readonly runsWon: number;
	readonly bestStreak: number;
	readonly bestCategory: CategoryCode | null;
	readonly bestRun: RunHistoryEntry | null;
	readonly seats: readonly ProfileSeat[];
	readonly recentRuns: readonly RunHistoryEntry[];
};

export type ProfileTotals = {
	readonly polls: Tally;
	readonly configs: Tally;
	readonly titles: Tally;
	readonly archivedStorage: number;
};

export type PublicProfile = ProfileFace & {
	readonly record: ProfileRecord;
	readonly standing: Standing | null;
	readonly totals: ProfileTotals;
};
