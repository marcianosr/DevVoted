import { format } from "date-fns";

import {
	type PlayerCardView,
	playerCardFor,
} from "~/modules/run/community/application/playerCard.viewmodel";
import { profilePathFor } from "~/shared/lib/profilePath";
import type {
	HallOfFameProps,
	HallOfFameWin,
} from "~/ui/kanto-theme/HallOfFame.ui";

export const COPY = {
	title: "Hall of Fame",
	history: "Every champion",
	empty: "No one has summited yet. The first win from Pallet takes this seat.",
	since: (when: string) => `Champion since ${when}`,
} as const;

const WON_AT_FORMAT = "d MMM yyyy, HH:mm";

export type ChampionWin = {
	readonly runId: number;
	readonly userId: string;
	readonly displayName: string;
	readonly photoUrl?: string;
	readonly borderUrl?: string;
	readonly wonAt: string;
};

export type HallOfFameView = {
	readonly champion: { card: PlayerCardView; wonAt: string } | null;
	readonly wins: readonly ChampionWin[];
};

const wonAtLabel = (wonAt: string): string =>
	format(new Date(wonAt), WON_AT_FORMAT);

const historyRowOf = ({
	runId,
	userId,
	displayName,
	photoUrl,
	borderUrl,
	wonAt,
}: ChampionWin): HallOfFameWin => ({
	key: String(runId),
	face: {
		name: displayName,
		userId,
		...(photoUrl === undefined ? {} : { photoUrl }),
		...(borderUrl === undefined ? {} : { borderUrl }),
	},
	wonAt: wonAtLabel(wonAt),
});

export const hallOfFameFor = ({
	champion,
	wins,
}: HallOfFameView): HallOfFameProps => ({
	title: COPY.title,
	historyLabel: COPY.history,
	empty: COPY.empty,
	history: wins.map(historyRowOf),
	...(champion === null
		? {}
		: {
				champion: {
					card: {
						...playerCardFor(champion.card),
						profileHref: profilePathFor(champion.card.userId),
					},
					since: COPY.since(wonAtLabel(champion.wonAt)),
				},
			}),
});
