import { appearanceFor } from "~/modules/account/profile/application/appearance.viewmodel";
import type { ProfileIdentity } from "~/modules/account/profile/domain/profile.model";
import { useArchiveState } from "~/modules/account/profile/application/useArchiveState.hook";
import type { LookDraft } from "~/modules/account/profile/application/useLookDraft.hook";
import { useTitleState } from "~/modules/account/profile/application/useTitleState.hook";
import { Appearance as AppearanceUI } from "~/modules/account/profile/presentation/Appearance.ui";

type AppearanceProps = {
	userId: string;
	identity: ProfileIdentity;
	draft: LookDraft;
	onOpenBorders: () => void;
	onOpenTitles: () => void;
};

export const Appearance = ({
	userId,
	identity,
	draft,
	onOpenBorders,
	onOpenTitles,
}: AppearanceProps) => {
	const { view: archive } = useArchiveState(userId);
	const { view: titles } = useTitleState(userId);

	return (
		<AppearanceUI
			{...appearanceFor({
				identity,
				look: draft.look,
				tryingOnId: draft.tryingOnId,
				ownedBorderIds: archive?.ownedBorderIds ?? [],
				ownedTitleIds: titles?.ownedTitleIds ?? [],
				ownedSwatchIds: archive?.ownedSwatchIds ?? [],
			})}
			canSave={draft.isDirty && !draft.isSaving}
			error={draft.error}
			onPickBorder={draft.pickBorder}
			onToggleTitle={draft.toggleTitle}
			onPickSwatch={draft.pickSwatch}
			onMoreBorders={onOpenBorders}
			onMoreTitles={onOpenTitles}
			onSave={draft.save}
		/>
	);
};
