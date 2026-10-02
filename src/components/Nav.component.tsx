import { useNavigate, useRouterState } from "@tanstack/react-router";

import type { AccountUser } from "~/modules/account/auth/infrastructure/user.repository";
import { useArchiveState } from "~/modules/account/profile/application/useArchiveState.hook";
import { useTitleState } from "~/modules/account/profile/application/useTitleState.hook";
import { borderUrlOf } from "~/modules/account/profile/domain/border.model";
import { wornTitleNames } from "~/modules/account/profile/domain/title.model";
import { pollsBadgeFor } from "~/modules/run/run/application/todayScreen.viewmodel";
import { useTodaysRun } from "~/modules/run/run/application/useTodaysRun.hook";
import { useNextPollsCountdown } from "~/shared/hooks/useNextPollsCountdown.hook";
import { POLLS_PATH, SUGGEST_POLL_PATH } from "~/shared/lib/pollPath";
import { AppNav, type NavViewer } from "~/ui/kanto-theme/AppNav.ui";

const HOME = "/";
const SIGN_IN = "/login";
const SIGN_OUT = "/logout";
const RUN = "/run";
const COMMUNITY = "/run/community";
const PROFILE = "/profile";

const profileHrefOf = (userId: string): string => `${PROFILE}/${userId}`;

const isInTheRun = (pathname: string): boolean =>
	pathname.startsWith(RUN) && pathname !== COMMUNITY;

export type NavProps = { user: AccountUser | null };

export const Nav = ({ user }: NavProps) => {
	const navigate = useNavigate();
	const pathname = useRouterState({
		select: (state) => state.location.pathname,
	});

	const { view } = useTodaysRun(user !== null);
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
					signOutHref: SIGN_OUT,
				};

	return (
		<AppNav
			homeHref={user === null ? HOME : RUN}
			signInHref={SIGN_IN}
			run={{
				href: RUN,
				pollsLeft: pollsBadgeFor(view, countdown),
				active: isInTheRun(pathname),
			}}
			community={{ href: COMMUNITY, active: pathname === COMMUNITY }}
			suggest={{
				href: SUGGEST_POLL_PATH,
				active: pathname === SUGGEST_POLL_PATH,
			}}
			viewer={viewer}
			onNavigate={(href) => navigate({ href })}
		/>
	);
};
