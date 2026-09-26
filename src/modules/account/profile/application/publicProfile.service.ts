import type {
	ProfileIdentity,
	ProfileTotals,
} from "~/modules/account/profile/application/profileScreen.viewmodel";
import { borderUrlOf } from "~/modules/account/profile/domain/border.model";
import { wornTitleNames } from "~/modules/account/profile/domain/title.model";
import { fetchPublicProfile } from "~/modules/account/profile/infrastructure/profile.repository";
import {
	configdex,
	grantedCountIn,
} from "~/modules/collection/dex/domain/configdex.model";
import {
	gatedex,
	gatesClearedIn,
} from "~/modules/collection/dex/domain/gatedex.model";
import { fetchConfigUnlocksByUser } from "~/modules/collection/dex/infrastructure/configdex.repository";
import {
	fetchPublishedPollsForDex,
	fetchSeenCountsByUser,
} from "~/modules/collection/dex/infrastructure/polldex.repository";
import { handleApiOperation } from "~/shared/utils/errorHandling";

export type PublicProfile = {
	readonly identity: ProfileIdentity;
	readonly totals: ProfileTotals;
};

export const getPublicProfileService = async (userId: string) =>
	handleApiOperation(async () => {
		const profile = await fetchPublicProfile(userId);
		if (!profile) throw new Error("User not found");

		const [polls, seenRows, unlocks] = await Promise.all([
			fetchPublishedPollsForDex(),
			fetchSeenCountsByUser(userId),
			fetchConfigUnlocksByUser(userId),
		]);

		const configs = configdex(unlocks, []);
		const gates = gatedex(profile.ownedSwatchIds);

		return {
			identity: {
				displayName: profile.displayName,
				githubUsername: profile.githubUsername,
				photoUrl: profile.photoUrl,
				borderUrl: borderUrlOf(profile.equippedBorderId),
				wornTitles: wornTitleNames(profile.equippedTitleIds),
			},
			totals: {
				pollsSeen: seenRows.length,
				pollsTotal: polls.length,
				configsHeld: grantedCountIn(configs),
				configsTotal: configs.length,
				gatesCleared: gatesClearedIn(gates),
				gatesTotal: gates.length,
				archivedStorage: profile.archivedStorage,
			},
		} satisfies PublicProfile;
	}, "getPublicProfile");
