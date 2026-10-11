import { createFileRoute, redirect } from "@tanstack/react-router";

import {
	Login,
	loginLoader,
} from "~/modules/account/auth/presentation/Login.component";

const Landing = () => {
	const { theme } = Route.useLoaderData();
	return <Login theme={theme} />;
};

export const Route = createFileRoute("/")({
	beforeLoad: ({ context }) => {
		if (context.user) {
			throw redirect({ to: "/run" });
		}
	},
	loader: loginLoader,
	component: Landing,
});
