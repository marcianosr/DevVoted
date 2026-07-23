import { createFileRoute } from "@tanstack/react-router";

import { Polldex } from "~/modules/polls/presentation/polldex/Polldex.component";

const PolldexPage = () => {
	const { user } = Route.useRouteContext();
	if (!user) return null;

	return <Polldex userId={user.id} />;
};

export const Route = createFileRoute("/_authed/polldex")({
	component: PolldexPage,
});
