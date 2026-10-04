import type {
	ChampionWin,
	HallOfFameView,
} from "~/modules/run/community/application/hallOfFame.viewmodel";
import { getPlayerCardService } from "~/modules/run/community/application/playerCard.service";
import {
	type ChampionRow,
	fetchChampions,
} from "~/modules/run/community/infrastructure/hallOfFame.repository";
import {
	type ApiResponse,
	handleApiOperation,
} from "~/shared/utils/errorHandling";

const championWinOf = (row: ChampionRow): ChampionWin => ({
	runId: row.runId,
	userId: row.userId,
	displayName: row.displayName ?? row.userId,
	...(row.photoUrl === null ? {} : { photoUrl: row.photoUrl }),
	...(row.borderUrl === null ? {} : { borderUrl: row.borderUrl }),
	wonAt: row.wonAt.toISOString(),
});

const reigningChampionOf = async (
	latest: ChampionRow | undefined
): Promise<HallOfFameView["champion"]> => {
	if (latest === undefined) return null;
	const card = await getPlayerCardService(latest.userId);
	return card.success
		? { card: card.data, wonAt: latest.wonAt.toISOString() }
		: null;
};

export const getHallOfFameService = async (): Promise<
	ApiResponse<HallOfFameView>
> =>
	handleApiOperation(async () => {
		const rows = await fetchChampions();
		return {
			champion: await reigningChampionOf(rows[0]),
			wins: rows.map(championWinOf),
		};
	}, "getHallOfFame");
