import {
	useEquipTitle,
	useTitleState,
} from "~/modules/account/profile/application/useTitleState.hook";
import { visibleTitles } from "~/modules/account/profile/domain/title.model";
import { TitleShelf as TitleShelfUI } from "~/modules/account/profile/presentation/TitleShelf.ui";

export const TitleShelf = ({ userId }: { userId: string }) => {
	const { data: state } = useTitleState(userId);
	const equip = useEquipTitle(userId);

	const ownedTitleIds = state?.ownedTitleIds ?? [];
	const owned = new Set(ownedTitleIds);
	const equipped = state?.equippedTitleId ?? null;

	return (
		<TitleShelfUI
			rows={visibleTitles(ownedTitleIds).map((title) => ({
				id: title.id,
				name: title.name,
				earnedWhen: title.earnedWhen,
				earned: owned.has(title.id),
				equipped: equipped === title.id,
				isMutating: equip.isPending,
				onPress: () => equip.mutate(equipped === title.id ? null : title.id),
			}))}
			error={equip.error?.message}
		/>
	);
};
