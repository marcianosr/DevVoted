import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	beforeLoad: ({ context }) => {
		// Redirect authenticated users to daily poll
		if (context.user) {
			throw redirect({ to: "/daily-poll" });
		}

		// Redirect unauthenticated users to login
		throw redirect({ to: "/login" });
	},
});
