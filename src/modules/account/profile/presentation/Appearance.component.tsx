import { appearanceFor } from "~/modules/account/profile/application/appearance.viewmodel";
import { useArchiveState } from "~/modules/account/profile/application/useArchiveState.hook";
import type { LookDraft } from "~/modules/account/profile/application/useLookDraft.hook";
import { useTitleState } from "~/modules/account/profile/application/useTitleState.hook";
import { Appearance as AppearanceUI } from "~/modules/account/profile/presentation/Appearance.ui";

type AppearanceProps = {
	userId: string;
	draft: LookDraft;
	onOpenBorders: () => void;
	onOpenTitles: () => void;
};

export const Appearance = ({
	userId,
	draft,
	onOpenBorders,
	onOpenTitles,
}: AppearanceProps) => {
	const { view: archive } = useArchiveState(userId);
	const { view: titles } = useTitleState(userId);

	return (
		<AppearanceUI
			{...appearanceFor({
				look: draft.look,
				ownedBorderIds: archive?.ownedBorderIds ?? [],
				ownedTitleIds: titles?.ownedTitleIds ?? [],
				ownedSwatchIds: archive?.ownedSwatchIds ?? [],
			})}
			onPickBorder={draft.pickBorder}
			onToggleTitle={draft.toggleTitle}
			onPickSwatch={draft.pickSwatch}
			onMoreBorders={onOpenBorders}
			onMoreTitles={onOpenTitles}
		/>
	);
};
