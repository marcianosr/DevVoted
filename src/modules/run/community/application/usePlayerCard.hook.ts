import { useApiQuery } from "~/shared/hooks/useApiQuery.hook";
import { userQueryKeys } from "~/shared/queryKeys";
import { getPlayerCard } from "~/modules/run/community/application/playerCard.serverfn";
import type { PlayerCardView } from "~/modules/run/community/application/playerCard.viewmodel";

const PLAYER_CARD_STALE_MS = 60_000;

export const usePlayerCard = (userId: string) =>
	useApiQuery<PlayerCardView>({
		queryKey: userQueryKeys.card(userId),
		queryFn: () => getPlayerCard({ data: { userId } }),
		staleTime: PLAYER_CARD_STALE_MS,
	});
