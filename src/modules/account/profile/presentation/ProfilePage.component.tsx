import { useArchiveState } from "~/modules/account/profile/application/useArchiveState.hook";
import { ArchiveSummary } from "~/modules/account/profile/presentation/ArchiveSummary.component";
import { BorderShop } from "~/modules/account/profile/presentation/BorderShop.component";
import { ProfilePage as ProfilePageUI } from "~/modules/account/profile/presentation/ProfilePage.ui";

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

	return (
		<ProfilePageUI
			user={{
				id: userId,
				displayName: viewer?.displayName ?? userId,
				photoUrl: viewer?.photoUrl,
				equippedBorderId: archive?.equippedBorderId ?? null,
			}}
			isOwnProfile={isOwnProfile}
		>
			{isOwnProfile && (
				<>
					<ArchiveSummary userId={userId} />
					<BorderShop userId={userId} />
				</>
			)}
		</ProfilePageUI>
	);
};
