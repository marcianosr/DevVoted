import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed/dex")({
	beforeLoad: ({ context }) => {
		if (!context.user) return;
		throw redirect({
			to: "/profile/$userId",
			params: { userId: context.user.id },
		});
	},
});
