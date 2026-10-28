import { createFileRoute } from "@tanstack/react-router";

import {
	Login,
	loginLoader,
} from "~/modules/account/auth/presentation/Login.component";

type LoginSearch = { identity?: "taken" };

const LoginPage = () => {
	const { theme } = Route.useLoaderData();
	const { identity } = Route.useSearch();
	return <Login theme={theme} identityTaken={identity === "taken"} />;
};

export const Route = createFileRoute("/login")({
	validateSearch: (search: Record<string, unknown>): LoginSearch =>
		search.identity === "taken" ? { identity: "taken" } : {},
	loader: loginLoader,
	component: LoginPage,
});
