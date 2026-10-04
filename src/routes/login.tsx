import { createFileRoute } from "@tanstack/react-router";

import { Login } from "~/modules/account/auth/presentation/Login.component";

export const Route = createFileRoute("/login")({
	component: LoginComp,
});

function LoginComp() {
	return <Login />;
}
