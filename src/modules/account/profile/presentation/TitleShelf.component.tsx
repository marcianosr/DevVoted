import { useState } from "react";

import {
	titleShelfFor,
	type TitleFilter,
} from "~/modules/account/profile/application/titleShelf.viewmodel";
import {
	useTitleState,
	useToggleTitle,
} from "~/modules/account/profile/application/useTitleState.hook";
import { TitleShelf as TitleShelfUI } from "~/modules/account/profile/presentation/TitleShelf.ui";

export const TitleShelf = ({ userId }: { userId: string }) => {
	const { data: state } = useTitleState(userId);
	const toggle = useToggleTitle(userId);
	const [filter, setFilter] = useState<TitleFilter>("all");
	const [moreCategories, setMoreCategories] = useState(false);

	const shelf = titleShelfFor({
		ownedTitleIds: state?.ownedTitleIds ?? [],
		equippedTitleIds: state?.equippedTitleIds ?? [],
		counts: state?.counts ?? [],
		filter,
		moreCategories,
	});

	return (
		<TitleShelfUI
			{...shelf}
			isMutating={toggle.isPending}
			error={toggle.error?.message}
			onToggle={(titleId, worn) => toggle.mutate({ titleId, worn })}
			onFilter={setFilter}
			onMoreCategories={() => setMoreCategories((open) => !open)}
		/>
	);
};
