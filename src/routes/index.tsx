import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	beforeLoad: ({ context }) => {
		// Redirect authenticated users to today's run
		if (context.user) {
			throw redirect({ to: "/run" });
		}

		// Redirect unauthenticated users to login
		throw redirect({ to: "/login" });
	},
});
