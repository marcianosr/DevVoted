import { createContext, type ReactNode, useContext } from "react";

export type PlayerCardSlotProps = {
	readonly userId: string;
	readonly onClose?: () => void;
};

export type PlayerCardSlot = (props: PlayerCardSlotProps) => ReactNode;

const EMPTY_SLOT: PlayerCardSlot = () => null;

export const PlayerCardSlotContext = createContext<PlayerCardSlot>(EMPTY_SLOT);

export const usePlayerCardSlot = (): PlayerCardSlot =>
	useContext(PlayerCardSlotContext);
