import { useState } from "react";

import { lookedIdentityOf } from "~/modules/account/profile/application/appearance.viewmodel";
import {
	isOwnerTabId,
	isProfileTabId,
	PROFILE_TABS,
	profileHeroFor,
	type ProfileTabId,
} from "~/modules/account/profile/application/profileScreen.viewmodel";
import { useArchiveState } from "~/modules/account/profile/application/useArchiveState.hook";
import { useLookDraft } from "~/modules/account/profile/application/useLookDraft.hook";
import { usePublicProfile } from "~/modules/account/profile/application/usePublicProfile.hook";
import { profileThemeFor } from "~/modules/account/profile/domain/profileTheme.model";
import { Appearance } from "~/modules/account/profile/presentation/Appearance.component";
import { BorderShop } from "~/modules/account/profile/presentation/BorderShop.component";
import { TitleShelf } from "~/modules/account/profile/presentation/TitleShelf.component";
import { Dex } from "~/modules/collection/dex/presentation/Dex.component";
import { archiveLabel } from "~/shared/lib/storage";
import { Button } from "~/ui/kanto-theme/Button.ui";
import { ProfileHero } from "~/ui/kanto-theme/ProfileHero.ui";
import { EDIT_PROFILE, ProfileScreen } from "~/ui/kanto-theme/ProfileScreen.ui";

const APPEARANCE_TAB: ProfileTabId = "appearance";
const BORDERS_TAB: ProfileTabId = "borders";
const TITLES_TAB: ProfileTabId = "titles";

type Viewer = { id: string };

type ProfilePageProps = {
	userId: string;
	viewer: Viewer | null;
};

const OwnProfile = ({ viewer }: { viewer: Viewer }) => {
	const [activeId, setActiveId] = useState<ProfileTabId>(APPEARANCE_TAB);

	const { view: profile } = usePublicProfile(viewer.id);
	const { view: archive } = useArchiveState(viewer.id);
	const draft = useLookDraft(viewer.id);

	const selectTab = (id: string) => {
		if (isProfileTabId(id)) setActiveId(id);
	};

	if (!profile) return null;

	const { identity } = profile;
	const looked = lookedIdentityOf(identity, draft.look, draft.tryingOnId);

	const hero = (
		<ProfileHero
			{...profileHeroFor(looked, profile.record, true)}
			trailing={
				<Button
					size="sm"
					tone="ambient"
					label={EDIT_PROFILE}
					onPress={() => setActiveId(APPEARANCE_TAB)}
				/>
			}
		/>
	);

	return (
		<ProfileScreen
			hero={hero}
			tabs={PROFILE_TABS}
			activeId={activeId}
			onSelect={selectTab}
			theme={profileThemeFor(
				draft.look.swatchId,
				archive?.ownedSwatchIds ?? []
			)}
			archive={archiveLabel(archive?.archivedStorage ?? 0)}
		>
			{isOwnerTabId(activeId) ? null : (
				<Dex viewerId={viewer.id} activeId={activeId} />
			)}
			{activeId === APPEARANCE_TAB ? (
				<Appearance
					userId={viewer.id}
					identity={identity}
					draft={draft}
					onOpenBorders={() => setActiveId(BORDERS_TAB)}
					onOpenTitles={() => setActiveId(TITLES_TAB)}
				/>
			) : null}
			{activeId === BORDERS_TAB ? (
				<BorderShop userId={viewer.id} draft={draft} />
			) : null}
			{activeId === TITLES_TAB ? <TitleShelf userId={viewer.id} /> : null}
		</ProfileScreen>
	);
};

const VisitedProfile = ({
	userId,
	viewerId,
}: {
	userId: string;
	viewerId: string | undefined;
}) => {
	const { view: profile } = usePublicProfile(userId);
	const { view: viewer } = usePublicProfile(viewerId);

	if (!profile) return null;

	return (
		<ProfileScreen
			hero={
				<ProfileHero
					{...profileHeroFor(
						profile.identity,
						profile.record,
						false,
						viewer?.record
					)}
				/>
			}
			theme={profile.theme}
		/>
	);
};

export const ProfilePage = ({ userId, viewer }: ProfilePageProps) =>
	viewer?.id === userId ? (
		<OwnProfile viewer={viewer} />
	) : (
		<VisitedProfile userId={userId} viewerId={viewer?.id} />
	);
