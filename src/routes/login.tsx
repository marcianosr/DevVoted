import { createFileRoute } from "@tanstack/react-router";

import {
	Login,
	loginLoader,
} from "~/modules/account/auth/presentation/Login.component";

const LoginPage = () => {
	const { theme } = Route.useLoaderData();
	return <Login theme={theme} />;
};

export const Route = createFileRoute("/login")({
	loader: loginLoader,
	component: LoginPage,
});
