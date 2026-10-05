import { createFileRoute } from "@tanstack/react-router";

import { ProfilePage } from "~/modules/account/profile/presentation/ProfilePage.component";

type ProfileSearch = { tab?: string };

const Profile = () => {
	const { userId } = Route.useParams();
	const { user } = Route.useRouteContext();
	const { tab } = Route.useSearch();
	const navigate = Route.useNavigate();

	return (
		<ProfilePage
			userId={userId}
			viewer={user}
			tab={tab}
			onSelectTab={(id) => navigate({ search: { tab: id }, replace: true })}
		/>
	);
};

export const Route = createFileRoute("/_authed/profile/$userId")({
	validateSearch: (search: Record<string, unknown>): ProfileSearch => ({
		tab: typeof search.tab === "string" ? search.tab : undefined,
	}),
	component: Profile,
});
