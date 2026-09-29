import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";

import { playerCardFor } from "~/modules/run/community/application/playerCard.viewmodel";
import { usePlayerCard } from "~/modules/run/community/application/usePlayerCard.hook";
import {
	type PlayerAnchor,
	type PlayerHover as PlayerHoverValue,
	PlayerHoverContext,
} from "~/shared/hooks/usePlayerHover.hook";
import { tooltipPlacementFor } from "~/shared/lib/tooltipPlacement";
import { PlayerCardTooltip } from "~/ui/kanto-theme/PlayerCardTooltip.ui";

export const HOVER_INTENT_MS = 300;
const CARD_EXTENT = { width: 448, height: 440 };

type Hovered = { userId: string; anchor: PlayerAnchor };

const viewport = () => ({
	width: window.innerWidth,
	height: window.innerHeight,
});

const HoveredCard = ({ userId, anchor }: Hovered) => {
	const { view } = usePlayerCard(userId);
	if (view === null) return null;

	return (
		<PlayerCardTooltip
			card={playerCardFor(view)}
			placement={tooltipPlacementFor(anchor, viewport(), CARD_EXTENT)}
		/>
	);
};

export const PlayerHover = ({ children }: { children: ReactNode }) => {
	const [hovered, setHovered] = useState<Hovered>();
	const intent = useRef<ReturnType<typeof setTimeout>>(undefined);

	const hover = useMemo<PlayerHoverValue>(
		() => ({
			show: (userId, anchor) => {
				clearTimeout(intent.current);
				intent.current = setTimeout(
					() => setHovered({ userId, anchor }),
					HOVER_INTENT_MS
				);
			},
			hide: () => {
				clearTimeout(intent.current);
				setHovered(undefined);
			},
		}),
		[]
	);

	useEffect(() => () => clearTimeout(intent.current), []);

	return (
		<PlayerHoverContext.Provider value={hover}>
			{children}
			{hovered === undefined ? null : <HoveredCard {...hovered} />}
		</PlayerHoverContext.Provider>
	);
};
