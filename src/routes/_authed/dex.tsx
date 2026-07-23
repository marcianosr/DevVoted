import { createFileRoute } from "@tanstack/react-router";

import { Dex } from "~/modules/polls/presentation/dex/Dex.component";

const DexPage = () => {
	const { user } = Route.useRouteContext();
	if (!user) return null;

	return <Dex userId={user.id} />;
};

export const Route = createFileRoute("/_authed/dex")({
	component: DexPage,
});
