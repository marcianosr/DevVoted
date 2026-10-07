import { useNavigate, useRouterState } from "@tanstack/react-router";

import type { AccountUser } from "~/modules/account/auth/infrastructure/user.repository";
import { useArchiveState } from "~/modules/account/profile/application/useArchiveState.hook";
import { useTitleState } from "~/modules/account/profile/application/useTitleState.hook";
import { borderUrlOf } from "~/modules/account/profile/domain/border.model";
import { wornTitleNames } from "~/modules/account/profile/domain/title.model";
import { APPROVED_POLL_REWARD } from "~/modules/polls/authoring/application/pollList.viewmodel";
import { navRunFor } from "~/modules/run/run/application/navRun.viewmodel";
import { pollsBadgeFor } from "~/modules/run/run/application/todayScreen.viewmodel";
import { usePollsLeftToday } from "~/modules/run/run/application/usePollsLeftToday.hook";
import { useTodaysRun } from "~/modules/run/run/application/useTodaysRun.hook";
import { useNextPollsCountdown } from "~/shared/hooks/useNextPollsCountdown.hook";
import { POLLS_PATH, SUGGEST_POLL_PATH } from "~/shared/lib/pollPath";
import { isAdminEmail } from "~/shared/utils/adminAuth";
import { AppNav, type NavViewer } from "~/ui/kanto-theme/AppNav.ui";
import type { NavRunReading } from "~/ui/kanto-theme/useNavRun.hook";

const HOME = "/";
const SIGN_IN = "/login";
const SIGN_OUT = "/logout";
const RUN = "/run";
const COMMUNITY = "/run/community";
const PROFILE = "/profile";
const ADMIN = "/admin";

const profileHrefOf = (userId: string): string => `${PROFILE}/${userId}`;

const isInTheRun = (pathname: string): boolean =>
	pathname.startsWith(RUN) && pathname !== COMMUNITY;

export type NavProps = {
	user: AccountUser | null;
	published?: NavRunReading;
};

export const Nav = ({ user, published }: NavProps) => {
	const navigate = useNavigate();
	const pathname = useRouterState({
		select: (state) => state.location.pathname,
	});

	const { view } = useTodaysRun(user !== null);
	const pollsLeftToday = usePollsLeftToday(user !== null);
	const countdown = useNextPollsCountdown();
	const archive = useArchiveState(user?.id);
	const titles = useTitleState(user?.id);

	const viewer: NavViewer | undefined =
		user === null
			? undefined
			: {
					name: user.displayName || user.email,
					photoUrl: user.photoUrl ?? undefined,
					borderUrl:
						borderUrlOf(archive.view?.equippedBorderId ?? null) ?? undefined,
					titles: wornTitleNames(titles.view?.equippedTitleIds ?? []),
					archivedStorage: archive.view?.archivedStorage ?? 0,
					profileHref: profileHrefOf(user.id),
					suggestedHref: POLLS_PATH,
					...(isAdminEmail(user.email) ? { adminHref: ADMIN } : {}),
					signOutHref: SIGN_OUT,
				};

	return (
		<AppNav
			homeHref={user === null ? HOME : RUN}
			profileActive={user !== null && pathname === profileHrefOf(user.id)}
			signInHref={SIGN_IN}
			run={{
				href: RUN,
				pollsLeft: pollsBadgeFor(view, countdown, pollsLeftToday.view),
				active: isInTheRun(pathname),
			}}
			community={{ href: COMMUNITY, active: pathname === COMMUNITY }}
			suggest={{
				href: SUGGEST_POLL_PATH,
				active: pathname === SUGGEST_POLL_PATH,
				reward: isAdminEmail(user?.email) ? undefined : APPROVED_POLL_REWARD,
			}}
			viewer={viewer}
			reading={published ?? navRunFor(view)}
			onNavigate={(href) => navigate({ href })}
		/>
	);
};
