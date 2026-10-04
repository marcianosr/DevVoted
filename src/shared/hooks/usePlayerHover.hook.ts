import { createContext, useContext } from "react";

export const PLAYER_CARD_TOOLTIP_ID = "player-card-tooltip";

export type PlayerAnchor = {
	readonly top: number;
	readonly bottom: number;
	readonly left: number;
	readonly right: number;
};

export type PlayerHover = {
	readonly show: (userId: string, anchor: PlayerAnchor) => void;
	readonly hide: () => void;
};

const UNPROVIDED: PlayerHover = {
	show: () => undefined,
	hide: () => undefined,
};

export const PlayerHoverContext = createContext<PlayerHover>(UNPROVIDED);

export const usePlayerHover = (): PlayerHover => useContext(PlayerHoverContext);
