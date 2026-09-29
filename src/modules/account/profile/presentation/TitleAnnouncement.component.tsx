import { format } from "date-fns";

import {
	useAcknowledgeTitles,
	useTitleAnnouncement,
} from "~/modules/account/profile/application/useTitleAnnouncement.hook";
import {
	useTitleState,
	useToggleTitle,
} from "~/modules/account/profile/application/useTitleState.hook";
import {
	findTitleById,
	wearEach,
	WORN_TITLE_CAP,
} from "~/modules/account/profile/domain/title.model";
import { TitleGrantModal } from "~/modules/account/profile/presentation/TitleGrantModal.ui";
import { formatStorage } from "~/shared/lib/storage";

const ARCHIVED_ON_FORMAT = "d MMM yyyy";
const AT_CAP_NOTE = `You already wear ${WORN_TITLE_CAP} titles. Take one off on your profile first.`;

export const TitleAnnouncement = ({ userId }: { userId: string }) => {
	const { data: announcement } = useTitleAnnouncement(userId);
	const acknowledge = useAcknowledgeTitles(userId);

	const titleIds = announcement?.titleIds ?? [];
	const hasSomethingToSay = titleIds.length > 0;

	const { data: state } = useTitleState(hasSomethingToSay ? userId : undefined);
	const toggle = useToggleTitle(hasSomethingToSay ? userId : undefined);

	const titles = titleIds.flatMap((titleId) => {
		const title = findTitleById(titleId);
		return title ? [title] : [];
	});

	if (titles.length === 0 || state === undefined) return null;

	const worn = state.equippedTitleIds;
	const isUnworn = (titleId: string) => !worn.includes(titleId);
	const knownIds = titles.map((title) => title.id);
	const toWear = wearEach(worn, knownIds, state.ownedTitleIds).filter(isUnworn);
	const atCap = knownIds.some(isUnworn) && toWear.length === 0;

	const wearThenAcknowledge = (remaining: readonly string[]) => {
		const [next, ...rest] = remaining;
		if (next === undefined) {
			acknowledge.mutate(titleIds);
			return;
		}
		toggle.mutate(
			{ titleId: next, worn: false },
			{ onSuccess: () => wearThenAcknowledge(rest) }
		);
	};

	const archivedAt = announcement?.archivedRunStartedAt;
	const bonus = announcement?.legacyBonusBytes ?? null;

	return (
		<TitleGrantModal
			titles={titles.map((title) => ({
				id: title.id,
				name: title.name,
				worn: worn.includes(title.id),
			}))}
			archiveBonus={bonus === null ? undefined : formatStorage(bonus)}
			archivedOn={
				archivedAt
					? format(new Date(archivedAt), ARCHIVED_ON_FORMAT)
					: undefined
			}
			wears={toWear.length}
			note={toggle.error?.message ?? (atCap ? AT_CAP_NOTE : undefined)}
			isMutating={acknowledge.isPending || toggle.isPending}
			onWear={() => wearThenAcknowledge(toWear)}
			onDismiss={() => acknowledge.mutate(titleIds)}
		/>
	);
};
