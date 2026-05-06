import { createFileRoute } from "@tanstack/react-router";

import { Login } from "../domains/users/components/Login.component";

export const Route = createFileRoute("/login")({
	component: LoginComp,
});

function LoginComp() {
	return <Login />;
}
