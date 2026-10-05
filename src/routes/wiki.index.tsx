import { createFileRoute } from "@tanstack/react-router";

import { Wiki } from "~/modules/guide/wiki/presentation/Wiki.component";

export const Route = createFileRoute("/wiki/")({
	component: Wiki,
});
