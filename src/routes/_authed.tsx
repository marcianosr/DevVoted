import { createFileRoute, Outlet } from "@tanstack/react-router";

import { Login } from "~/modules/account/auth/presentation/Login.component";
import { TitleAnnouncement } from "~/modules/account/profile/presentation/TitleAnnouncement.component";
import { PollApprovedAnnouncement } from "~/modules/polls/authoring/presentation/PollApprovedAnnouncement.component";

const AuthedLayout = () => {
	const { user } = Route.useRouteContext();

	return (
		<>
			{user ? (
				<>
					<TitleAnnouncement userId={user.id} />
					<PollApprovedAnnouncement userId={user.id} />
				</>
			) : null}
			<Outlet />
		</>
	);
};

const NOT_AUTHENTICATED = "Not authenticated";

const isNotAuthenticated = (error: unknown) =>
	error instanceof Error && error.message === NOT_AUTHENTICATED;

export const Route = createFileRoute("/_authed")({
	beforeLoad: ({ context }) => {
		if (!context.user) {
			throw new Error(NOT_AUTHENTICATED);
		}
	},
	component: AuthedLayout,
	errorComponent: ({ error }) => {
		if (isNotAuthenticated(error)) {
			return <Login />;
		}

		throw error;
	},
});
