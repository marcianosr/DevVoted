import {
	lookedIdentityOf,
	previewLabelFor,
} from "~/modules/account/profile/application/appearance.viewmodel";
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
import { Advertisement } from "~/modules/account/profile/presentation/Advertisement.component";
import { Appearance } from "~/modules/account/profile/presentation/Appearance.component";
import { BorderShop } from "~/modules/account/profile/presentation/BorderShop.component";
import { LookSaveBar } from "~/modules/account/profile/presentation/LookSaveBar.ui";
import { TitleShelf } from "~/modules/account/profile/presentation/TitleShelf.component";
import { Dex } from "~/modules/collection/dex/presentation/Dex.component";
import { archiveLabel } from "~/shared/lib/storage";
import { ProfileHero } from "~/ui/kanto-theme/ProfileHero.ui";
import { ProfileScreen } from "~/ui/kanto-theme/ProfileScreen.ui";

const APPEARANCE_TAB: ProfileTabId = "appearance";
const BORDERS_TAB: ProfileTabId = "borders";
const TITLES_TAB: ProfileTabId = "titles";

type Viewer = { id: string };

type ProfilePageProps = {
	userId: string;
	viewer: Viewer | null;
	tab?: string;
	onSelectTab: (id: ProfileTabId) => void;
};

type OwnProfileProps = {
	viewer: Viewer;
	tab?: string;
	onSelectTab: (id: ProfileTabId) => void;
};

const activeTabOf = (tab: string | undefined): ProfileTabId =>
	tab !== undefined && isProfileTabId(tab) ? tab : APPEARANCE_TAB;

const ADVERTISEMENT = <Advertisement placement="profile" />;

const OwnProfile = ({ viewer, tab, onSelectTab }: OwnProfileProps) => {
	const activeId = activeTabOf(tab);

	const { view: profile } = usePublicProfile(viewer.id);
	const { view: archive } = useArchiveState(viewer.id);
	const draft = useLookDraft(viewer.id);

	const selectTab = (id: string) => {
		if (isProfileTabId(id)) onSelectTab(id);
	};

	if (!profile) return null;

	const { identity } = profile;
	const looked = lookedIdentityOf(identity, draft.look, draft.tryingOnId);

	const hero = (
		<ProfileHero
			{...profileHeroFor(
				looked,
				profile.record,
				true,
				profile.totals.archivedStorage
			)}
			preview={previewLabelFor(draft.look, draft.tryingOnId, draft.isDirty)}
		/>
	);

	const saveBar = draft.isDirty ? (
		<LookSaveBar
			canSave={!draft.isSaving}
			error={draft.error}
			onSave={draft.save}
			onDiscard={draft.discard}
		/>
	) : undefined;

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
			sections={ADVERTISEMENT}
			footer={saveBar}
		>
			{isOwnerTabId(activeId) ? null : (
				<Dex viewerId={viewer.id} activeId={activeId} />
			)}
			{activeId === APPEARANCE_TAB ? (
				<Appearance
					userId={viewer.id}
					draft={draft}
					onOpenBorders={() => onSelectTab(BORDERS_TAB)}
					onOpenTitles={() => onSelectTab(TITLES_TAB)}
				/>
			) : null}
			{activeId === BORDERS_TAB ? (
				<BorderShop userId={viewer.id} draft={draft} />
			) : null}
			{activeId === TITLES_TAB ? <TitleShelf userId={viewer.id} /> : null}
		</ProfileScreen>
	);
};

const VisitedProfile = ({ userId }: { userId: string }) => {
	const { view: profile } = usePublicProfile(userId);

	if (!profile) return null;

	return (
		<ProfileScreen
			hero={
				<ProfileHero
					{...profileHeroFor(
						profile.identity,
						profile.record,
						false,
						profile.totals.archivedStorage
					)}
				/>
			}
			theme={profile.theme}
			sections={ADVERTISEMENT}
		/>
	);
};

export const ProfilePage = ({
	userId,
	viewer,
	tab,
	onSelectTab,
}: ProfilePageProps) =>
	viewer?.id === userId ? (
		<OwnProfile viewer={viewer} tab={tab} onSelectTab={onSelectTab} />
	) : (
		<VisitedProfile userId={userId} />
	);
