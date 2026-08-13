import { createFileRoute } from "@tanstack/react-router";

import { SignUp } from "~/modules/account/auth/presentation/SignUp.component";

export const Route = createFileRoute("/sign-up")({
	component: SignUp,
});
