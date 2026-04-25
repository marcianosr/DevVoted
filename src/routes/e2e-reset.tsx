import { createFileRoute, redirect } from "@tanstack/react-router";

import { resetDailyPollForE2E } from "~/domains/polls/api/e2eReset";

export const Route = createFileRoute("/e2e-reset")({
	loader: async () => {
		if (process.env.NODE_ENV === "production") {
			throw redirect({ to: "/" });
		}

		await resetDailyPollForE2E();
		throw redirect({ to: "/daily-poll" });
	},
});
