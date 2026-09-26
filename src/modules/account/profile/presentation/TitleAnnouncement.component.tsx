import { format } from "date-fns";

import {
	useAcknowledgeTitles,
	useTitleAnnouncement,
} from "~/modules/account/profile/application/useTitleAnnouncement.hook";
import {
	useTitleState,
	useToggleTitle,
} from "~/modules/account/profile/application/useTitleState.hook";
import { findTitleById } from "~/modules/account/profile/domain/title.model";
import { TitleGrantModal } from "~/modules/account/profile/presentation/TitleGrantModal.ui";

const ARCHIVED_ON_FORMAT = "d MMM yyyy";

export const TitleAnnouncement = ({ userId }: { userId: string }) => {
	const { data: announcement } = useTitleAnnouncement(userId);
	const acknowledge = useAcknowledgeTitles(userId);

	const titleIds = announcement?.titleIds ?? [];
	const hasSomethingToSay = titleIds.length > 0;

	const { data: state } = useTitleState(hasSomethingToSay ? userId : undefined);
	const toggle = useToggleTitle(hasSomethingToSay ? userId : undefined);
	const worn = new Set(state?.equippedTitleIds ?? []);

	const titles = titleIds.flatMap((titleId) => {
		const title = findTitleById(titleId);
		return title ? [title] : [];
	});

	if (titles.length === 0) return null;

	const archivedAt = announcement?.archivedRunStartedAt;

	return (
		<TitleGrantModal
			titles={titles.map((title) => ({
				id: title.id,
				name: title.name,
				earnedWhen: title.earnedWhen,
				worn: worn.has(title.id),
			}))}
			archivedOn={
				archivedAt
					? format(new Date(archivedAt), ARCHIVED_ON_FORMAT)
					: undefined
			}
			isMutating={acknowledge.isPending || toggle.isPending}
			onWear={(titleId) => toggle.mutate({ titleId, worn: false })}
			onDismiss={() => acknowledge.mutate(titleIds)}
		/>
	);
};
