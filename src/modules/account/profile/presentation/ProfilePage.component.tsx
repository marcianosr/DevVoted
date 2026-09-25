import { useArchiveState } from "~/modules/account/profile/application/useArchiveState.hook";
import { ArchiveSummary } from "~/modules/account/profile/presentation/ArchiveSummary.component";
import { BorderShop } from "~/modules/account/profile/presentation/BorderShop.component";
import { useTitleState } from "~/modules/account/profile/application/useTitleState.hook";
import { findTitleById } from "~/modules/account/profile/domain/title.model";
import { ProfilePage as ProfilePageUI } from "~/modules/account/profile/presentation/ProfilePage.ui";
import { TitleShelf } from "~/modules/account/profile/presentation/TitleShelf.component";

/** The signed-in account, as the router context carries it: null when signed out. */
type Viewer = {
	id: string;
	displayName?: string | null;
	photoUrl?: string | null;
};

type ProfilePageProps = {
	userId: string;
	viewer: Viewer | null;
};

export const ProfilePage = ({ userId, viewer }: ProfilePageProps) => {
	const isOwnProfile = viewer?.id === userId;
	const { data: archive } = useArchiveState(isOwnProfile ? userId : undefined);
	const { data: titles } = useTitleState(isOwnProfile ? userId : undefined);
	const worn = titles?.equippedTitleId
		? findTitleById(titles.equippedTitleId)
		: undefined;

	return (
		<ProfilePageUI
			user={{
				id: userId,
				displayName: viewer?.displayName ?? userId,
				photoUrl: viewer?.photoUrl,
				equippedBorderId: archive?.equippedBorderId ?? null,
			}}
			isOwnProfile={isOwnProfile}
			wornTitle={worn?.name}
		>
			{isOwnProfile && (
				<>
					<ArchiveSummary userId={userId} />
					<TitleShelf userId={userId} />
					<BorderShop userId={userId} />
				</>
			)}
		</ProfilePageUI>
	);
};
