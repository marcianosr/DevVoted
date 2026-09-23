import { createFileRoute } from "@tanstack/react-router";

import { RunIncidents } from "~/modules/run/incident/presentation/RunIncidents.component";

// The `run_` prefix escapes the /run layout on purpose, like the community
// board: a public log outside the climb, which the status→route sync must not
// redirect away from.
export const Route = createFileRoute("/_authed/run_/incidents")({
	component: RunIncidents,
});
