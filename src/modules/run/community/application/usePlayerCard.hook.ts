import { skipToken } from "@tanstack/react-query";

import { useApiQuery } from "~/shared/hooks/useApiQuery.hook";
import { userQueryKeys } from "~/shared/queryKeys";
import { getPlayerCard } from "~/modules/run/community/application/playerCard.serverfn";
import type { PlayerCardView } from "~/modules/run/community/application/playerCard.viewmodel";

const PLAYER_CARD_STALE_MS = 60_000;
const NO_PLAYER = "";

export const usePlayerCard = (userId: string | undefined) =>
	useApiQuery<PlayerCardView>({
		queryKey: userQueryKeys.card(userId ?? NO_PLAYER),
		queryFn:
			userId === undefined
				? skipToken
				: () => getPlayerCard({ data: { userId } }),
		staleTime: PLAYER_CARD_STALE_MS,
	});
