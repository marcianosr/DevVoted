import { createFileRoute } from "@tanstack/react-router";

import { RunNew } from "~/modules/run/build/presentation/RunNew.component";

export const Route = createFileRoute("/_authed/run/new")({
	component: RunNew,
});
