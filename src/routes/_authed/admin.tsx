import { createFileRoute } from "@tanstack/react-router";

import { AdminPanel } from "~/modules/ops/admin/presentation/AdminPanel.component";

export const Route = createFileRoute("/_authed/admin")({
	component: AdminPanel,
});
