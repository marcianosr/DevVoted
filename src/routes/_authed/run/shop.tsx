import { createFileRoute } from "@tanstack/react-router";

import { RunShop } from "~/modules/run/presentation/game/RunShop.component";

export const Route = createFileRoute("/_authed/run/shop")({
	component: RunShop,
});
