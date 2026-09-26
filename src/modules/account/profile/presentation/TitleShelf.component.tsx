import {
	useTitleState,
	useToggleTitle,
} from "~/modules/account/profile/application/useTitleState.hook";
import {
	visibleTitles,
	WORN_TITLE_CAP,
} from "~/modules/account/profile/domain/title.model";
import { TitleShelf as TitleShelfUI } from "~/modules/account/profile/presentation/TitleShelf.ui";

export const TitleShelf = ({ userId }: { userId: string }) => {
	const { data: state } = useTitleState(userId);
	const toggle = useToggleTitle(userId);

	const ownedTitleIds = state?.ownedTitleIds ?? [];
	const owned = new Set(ownedTitleIds);
	const worn = new Set(state?.equippedTitleIds ?? []);
	const atCap = worn.size >= WORN_TITLE_CAP;
	const roster = visibleTitles(ownedTitleIds);

	return (
		<TitleShelfUI
			held={`${owned.size} of ${roster.length}`}
			worn={worn.size}
			cap={WORN_TITLE_CAP}
			rows={roster.map((title) => ({
				id: title.id,
				name: title.name,
				earnedWhen: title.earnedWhen,
				earned: owned.has(title.id),
				equipped: worn.has(title.id),
				isMutating: toggle.isPending,
				blocked: atCap && !worn.has(title.id),
				onPress: () =>
					toggle.mutate({ titleId: title.id, worn: worn.has(title.id) }),
			}))}
			error={toggle.error?.message}
		/>
	);
};
