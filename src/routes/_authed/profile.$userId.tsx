import { createFileRoute } from "@tanstack/react-router";

import { ProfilePage } from "~/modules/account/profile/presentation/ProfilePage.component";

const Profile = () => {
	const { userId } = Route.useParams();
	const { user } = Route.useRouteContext();

	return <ProfilePage userId={userId} viewer={user} />;
};

export const Route = createFileRoute("/_authed/profile/$userId")({
	component: Profile,
});
