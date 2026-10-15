import type { ReactNode } from "react";

import { playerCardFor } from "~/modules/run/community/application/playerCard.viewmodel";
import { usePlayerCard } from "~/modules/run/community/application/usePlayerCard.hook";
import {
	PlayerCardSlotContext,
	type PlayerCardSlotProps,
} from "~/shared/hooks/usePlayerCardSlot.hook";
import { profilePathFor } from "~/shared/lib/profilePath";
import { ClimberCard } from "~/ui/kanto-theme/ClimberCard.ui";

const PlayerCardContent = ({ userId, onClose }: PlayerCardSlotProps) => {
	const { view } = usePlayerCard(userId);
	if (view === null) return null;

	const card = playerCardFor(view);
	if (onClose === undefined) return <ClimberCard {...card} />;

	return (
		<ClimberCard
			{...card}
			profileHref={profilePathFor(userId)}
			onClose={onClose}
		/>
	);
};

export const PlayerCards = ({ children }: { children: ReactNode }) => (
	<PlayerCardSlotContext.Provider value={PlayerCardContent}>
		{children}
	</PlayerCardSlotContext.Provider>
);
