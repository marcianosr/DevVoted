import type { AccountUser } from "~/modules/account/auth/infrastructure/user.repository";
import { useViewer } from "~/modules/account/auth/application/useViewer.hook";
import {
	advertisementFor,
	advertisementPropsFor,
	type AdvertisementPlacement,
} from "~/modules/account/profile/application/advertisement.viewmodel";
import { useAdvertisementRoll } from "~/modules/account/profile/application/useAdvertisementRoll.hook";
import { useArchiveState } from "~/modules/account/profile/application/useArchiveState.hook";
import { AdvertisementCard } from "~/modules/account/profile/presentation/AdvertisementCard.ui";
import { profilePathFor } from "~/shared/lib/profilePath";
import { isAdminEmail } from "~/shared/utils/adminAuth";

const STRIP_PLACEMENT: AdvertisementPlacement = "poll";

export type AdvertisementProps = { placement: AdvertisementPlacement };

type ViewerAdvertisementProps = AdvertisementProps & { user: AccountUser };

const ViewerAdvertisement = ({ placement, user }: ViewerAdvertisementProps) => {
	const { view: archive } = useArchiveState(user.id);
	const { roll, dismiss } = useAdvertisementRoll(placement);

	if (!archive || !roll) return null;

	const advertisement = advertisementFor(
		{
			isAdmin: isAdminEmail(user.email),
			ownedBorderIds: archive.ownedBorderIds,
		},
		roll
	);
	if (!advertisement) return null;

	const isStrip = placement === STRIP_PLACEMENT;

	return (
		<AdvertisementCard
			{...advertisementPropsFor(
				advertisement,
				{
					name: user.displayName || user.email,
					photoUrl: user.photoUrl ?? undefined,
				},
				profilePathFor(user.id)
			)}
			variant={isStrip ? "strip" : "card"}
			onDismiss={isStrip ? undefined : dismiss}
		/>
	);
};

export const Advertisement = ({ placement }: AdvertisementProps) => {
	const user = useViewer();

	return user === null ? null : (
		<ViewerAdvertisement placement={placement} user={user} />
	);
};
