import { useState } from "react";

import { lookedIdentityOf } from "~/modules/account/profile/application/appearance.viewmodel";
import {
	isOwnerTabId,
	isProfileTabId,
	PROFILE_TABS,
	profileCardFor,
	profileClimbingFor,
	profileCollectionFor,
	profileRecordFor,
	profileRunsFor,
	type ProfileIdentity,
	type ProfileTabId,
} from "~/modules/account/profile/application/profileScreen.viewmodel";
import { useAuthorship } from "~/modules/account/profile/application/useAuthorship.hook";
import { useArchiveState } from "~/modules/account/profile/application/useArchiveState.hook";
import { useLookDraft } from "~/modules/account/profile/application/useLookDraft.hook";
import { usePublicProfile } from "~/modules/account/profile/application/usePublicProfile.hook";
import { useTitleState } from "~/modules/account/profile/application/useTitleState.hook";
import { NO_AUTHORSHIP } from "~/modules/account/profile/domain/authorship.model";
import { DEFAULT_PROFILE_THEME } from "~/modules/account/profile/domain/profileTheme.model";
import { Appearance } from "~/modules/account/profile/presentation/Appearance.component";
import { BorderShop } from "~/modules/account/profile/presentation/BorderShop.component";
import { TitleShelf } from "~/modules/account/profile/presentation/TitleShelf.component";
import { Dex } from "~/modules/collection/dex/presentation/Dex.component";
import { archiveLabel } from "~/shared/lib/storage";
import { Button } from "~/ui/kanto-theme/Button.ui";
import { DexRuns } from "~/ui/kanto-theme/DexRuns.ui";
import { ProfileCard } from "~/ui/kanto-theme/ProfileCard.ui";
import { ProfileClimbing } from "~/ui/kanto-theme/ProfileClimbing.ui";
import { ProfileCollection } from "~/ui/kanto-theme/ProfileCollection.ui";
import { ProfileRecord } from "~/ui/kanto-theme/ProfileRecord.ui";
import { EDIT_PROFILE, ProfileScreen } from "~/ui/kanto-theme/ProfileScreen.ui";

const APPEARANCE_TAB: ProfileTabId = "appearance";
const BORDERS_TAB: ProfileTabId = "borders";
const TITLES_TAB: ProfileTabId = "titles";

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
	const [activeId, setActiveId] = useState<ProfileTabId>(APPEARANCE_TAB);

	const { data: archive } = useArchiveState(viewer.id);
	const { data: titles } = useTitleState(viewer.id);
	const { data: authorship } = useAuthorship(viewer.id);
	const draft = useLookDraft(viewer.id);

	const selectTab = (id: string) => {
		if (isProfileTabId(id)) setActiveId(id);
	};

	const identity: ProfileIdentity = {
		displayName: viewer.displayName ?? viewer.id,
		githubUsername: null,
		photoUrl: viewer.photoUrl ?? null,
		borderUrl: null,
		wornTitles: [],
		pollsAnswered: titles?.pollsAnswered ?? 0,
		authorship: authorship ?? NO_AUTHORSHIP,
	};
	const looked = lookedIdentityOf(identity, draft.look, draft.tryingOnId);

	const card = (
		<ProfileCard
			{...profileCardFor(looked, true)}
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
			card={card}
			tabs={PROFILE_TABS}
			activeId={activeId}
			onSelect={selectTab}
			theme={DEFAULT_PROFILE_THEME}
			archive={archiveLabel(archive?.archivedStorage ?? 0)}
		>
			{isOwnerTabId(activeId) ? null : (
				<Dex userId={viewer.id} activeId={activeId} />
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
	const { data: profile } = usePublicProfile(userId);
	const { data: viewer } = usePublicProfile(viewerId);
	const [pickedRun, setPickedRun] = useState<string | undefined>(undefined);

	if (!profile) return null;

	return (
		<ProfileScreen
			card={<ProfileCard {...profileCardFor(profile.identity, false)} />}
			theme={profile.theme}
			sections={
				<>
					<ProfileRecord
						{...profileRecordFor(profile.record, viewer?.record)}
					/>
					<DexRuns
						{...profileRunsFor(profile.record, pickedRun)}
						onSelect={setPickedRun}
					/>
					<ProfileClimbing {...profileClimbingFor(profile.standing)} />
					<ProfileCollection {...profileCollectionFor(profile.totals)} />
				</>
			}
		/>
	);
};

export const ProfilePage = ({ userId, viewer }: ProfilePageProps) =>
	viewer?.id === userId ? (
		<OwnProfile viewer={viewer} />
	) : (
		<VisitedProfile userId={userId} viewerId={viewer?.id} />
	);
