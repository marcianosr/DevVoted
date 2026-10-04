import { PLAYER_CARD_TOOLTIP_ID } from "~/shared/hooks/usePlayerHover.hook";
import type { TooltipPlacement } from "~/shared/lib/tooltipPlacement";

import { ClimberCard, type ClimberCardProps } from "./ClimberCard.ui";

const TOOLTIP =
	"pointer-events-none fixed z-40 flex overflow-hidden rounded-2xl";

export type PlayerCardTooltipCard = Omit<
	ClimberCardProps,
	"loot" | "file" | "onClose"
>;

export type PlayerCardTooltipProps = {
	card: PlayerCardTooltipCard;
	placement: TooltipPlacement;
};

export const PlayerCardTooltip = ({
	card,
	placement,
}: PlayerCardTooltipProps) => (
	<div
		id={PLAYER_CARD_TOOLTIP_ID}
		role="tooltip"
		className={TOOLTIP}
		style={placement}
	>
		<ClimberCard {...card} />
	</div>
);
