import {
	useArchiveState,
	usePurchaseBorder,
} from "~/modules/account/profile/application/useArchiveState.hook";
import type { LookDraft } from "~/modules/account/profile/application/useLookDraft.hook";
import { borders } from "~/modules/account/profile/domain/border.model";
import { BorderShop as BorderShopUI } from "~/modules/account/profile/presentation/BorderShop.ui";
import { archiveLabel } from "~/shared/lib/storage";

type BorderShopProps = {
	userId: string;
	draft: LookDraft;
};

export const BorderShop = ({ userId, draft }: BorderShopProps) => {
	const { view: archive } = useArchiveState(userId);
	const purchase = usePurchaseBorder(userId);

	if (!archive) return null;

	const cards = borders.map((border) => {
		const owned = archive.ownedBorderIds.includes(border.id);
		const tryingOn = draft.tryingOnId === border.id;

		return {
			id: border.id,
			name: border.name,
			image: border.image,
			cost: border.cost,
			earnedByVictory: border.earnedByVictory === true,
			owned,
			picked: draft.look.borderId === border.id,
			canAfford: archive.archivedStorage >= border.cost,
			isMutating: purchase.isPending,
			tryingOn,
			onPress: () =>
				owned
					? draft.pickBorder(border.id)
					: draft.tryOn(tryingOn ? null : border.id),
			onBuy: () =>
				purchase.mutate(border.id, {
					onSuccess: (result) => {
						if (result.success) draft.pickBorder(border.id);
					},
				}),
		};
	});

	return (
		<BorderShopUI
			cards={cards}
			held={`${archive.ownedBorderIds.length} of ${borders.length}`}
			archive={archiveLabel(archive.archivedStorage)}
			error={purchase.errorMessage ?? undefined}
		/>
	);
};
