import { createFileRoute, Outlet } from "@tanstack/react-router";

import { Login } from "~/modules/account/auth/presentation/Login.component";
import { TitleAnnouncement } from "~/modules/account/profile/presentation/TitleAnnouncement.component";

const AuthedLayout = () => {
	const { user } = Route.useRouteContext();

	return (
		<>
			{user ? <TitleAnnouncement userId={user.id} /> : null}
			<Outlet />
		</>
	);
};

export const Route = createFileRoute("/_authed")({
	beforeLoad: ({ context }) => {
		if (!context.user) {
			throw new Error("Not authenticated");
		}
	},
	component: AuthedLayout,
	errorComponent: ({ error }) => {
		if (error.message === "Not authenticated") {
			return <Login />;
		}

		throw error;
	},
});
