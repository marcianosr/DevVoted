import { useState } from "react";

import {
	archiveLabelOf,
	isOwnerTabId,
	isProfileTabId,
	PROFILE_TABS,
	profileCardFor,
	profileThemeOf,
	profileTotalsFor,
	type ProfileTabId,
} from "~/modules/account/profile/application/profileScreen.viewmodel";
import { useArchiveState } from "~/modules/account/profile/application/useArchiveState.hook";
import { usePublicProfile } from "~/modules/account/profile/application/usePublicProfile.hook";
import { useTitleState } from "~/modules/account/profile/application/useTitleState.hook";
import { borderUrlOf } from "~/modules/account/profile/domain/border.model";
import { wornTitleNames } from "~/modules/account/profile/domain/title.model";
import { BorderShop } from "~/modules/account/profile/presentation/BorderShop.component";
import { TitleShelf } from "~/modules/account/profile/presentation/TitleShelf.component";
import { Dex } from "~/modules/collection/dex/presentation/Dex.component";
import { Button } from "~/ui/kanto-theme/Button.ui";
import { ProfileCard } from "~/ui/kanto-theme/ProfileCard.ui";
import { ProfileScreen } from "~/ui/kanto-theme/ProfileScreen.ui";

const COPY = {
	edit: "edit profile",
} as const;

const FIRST_TAB: ProfileTabId = "polls";
const APPEARANCE_TAB: ProfileTabId = "borders";

type Viewer = {
	id: string;
	displayName?: string | null;
	photoUrl?: string | null;
};

type ProfilePageProps = {
	userId: string;
	viewer: Viewer | null;
};

const OwnProfile = ({ viewer }: { viewer: Viewer }) => {
	const [activeId, setActiveId] = useState<ProfileTabId>(FIRST_TAB);

	const { data: archive } = useArchiveState(viewer.id);
	const { data: titles } = useTitleState(viewer.id);

	const selectTab = (id: string) => {
		if (isProfileTabId(id)) setActiveId(id);
	};

	const card = (
		<ProfileCard
			{...profileCardFor(
				{
					displayName: viewer.displayName ?? viewer.id,
					githubUsername: null,
					photoUrl: viewer.photoUrl ?? null,
					borderUrl: borderUrlOf(archive?.equippedBorderId ?? null),
					wornTitles: wornTitleNames(titles?.equippedTitleIds ?? []),
				},
				true
			)}
			trailing={
				<Button
					size="sm"
					tone="ambient"
					label={COPY.edit}
					onPress={() => setActiveId(APPEARANCE_TAB)}
				/>
			}
		/>
	);

	return (
		<ProfileScreen
			card={card}
			tabs={PROFILE_TABS}
			activeId={activeId}
			onSelect={selectTab}
			theme={profileThemeOf(activeId)}
			archive={archiveLabelOf(archive?.archivedStorage ?? 0)}
		>
			{isOwnerTabId(activeId) ? null : (
				<Dex userId={viewer.id} activeId={activeId} />
			)}
			{activeId === "borders" ? <BorderShop userId={viewer.id} /> : null}
			{activeId === "titles" ? <TitleShelf userId={viewer.id} /> : null}
		</ProfileScreen>
	);
};

const VisitedProfile = ({ userId }: { userId: string }) => {
	const { data: profile } = usePublicProfile(userId);

	if (!profile) return null;

	return (
		<ProfileScreen
			card={<ProfileCard {...profileCardFor(profile.identity, false)} />}
			theme="cerulean"
			totals={profileTotalsFor(profile.totals)}
		/>
	);
};

export const ProfilePage = ({ userId, viewer }: ProfilePageProps) =>
	viewer?.id === userId ? (
		<OwnProfile viewer={viewer} />
	) : (
		<VisitedProfile userId={userId} />
	);
