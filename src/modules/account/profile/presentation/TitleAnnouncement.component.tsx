import { format } from "date-fns";

import { useArchiveState } from "~/modules/account/profile/application/useArchiveState.hook";
import { useSaveLook } from "~/modules/account/profile/application/useLookDraft.hook";
import {
	useAcknowledgeTitles,
	useTitleAnnouncement,
} from "~/modules/account/profile/application/useTitleAnnouncement.hook";
import { useTitleState } from "~/modules/account/profile/application/useTitleState.hook";
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
	const { view: announcement } = useTitleAnnouncement(userId);
	const acknowledge = useAcknowledgeTitles(userId);

	const titleIds = announcement?.titleIds ?? [];
	const owner = titleIds.length > 0 ? userId : undefined;

	const { view: state } = useTitleState(owner);
	const { view: archive } = useArchiveState(owner);
	const save = useSaveLook(userId);

	const titles = titleIds.flatMap((titleId) => {
		const title = findTitleById(titleId);
		return title ? [title] : [];
	});

	if (titles.length === 0 || state === null || archive === null) {
		return null;
	}

	const worn = state.equippedTitleIds;
	const isUnworn = (titleId: string) => !worn.includes(titleId);
	const knownIds = titles.map((title) => title.id);
	const next = wearEach(worn, knownIds, state.ownedTitleIds);
	const toWear = next.filter(isUnworn);
	const atCap = knownIds.some(isUnworn) && toWear.length === 0;

	const wearThenAcknowledge = () =>
		save.mutate(
			{
				borderId: archive.equippedBorderId,
				titleIds: next,
				swatchId: archive.equippedSwatchId,
			},
			{
				onSuccess: (result) => {
					if (result.success) acknowledge.mutate(titleIds);
				},
			}
		);

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
			note={save.errorMessage ?? (atCap ? AT_CAP_NOTE : undefined)}
			isMutating={acknowledge.isPending || save.isPending}
			onWear={wearThenAcknowledge}
			onDismiss={() => acknowledge.mutate(titleIds)}
		/>
	);
};
