import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";

import { syncTarget } from "~/modules/run/view/runRoutes.viewmodel";

import { useTodaysRun } from "./useTodaysRun.hook";

/**
 * Keeps the URL in sync with the server-owned run status. Runs once, in the
 * /run layout: leaves render `null` on a status mismatch and rely on this
 * hook to move the player to the right screen. The decision itself lives in
 * `syncTarget` — this hook only executes the verdict.
 */
export const useRunRouteSync = () => {
	const navigate = useNavigate();
	const { view, isPending } = useTodaysRun();
	// The index route can report a trailing slash ("/run/"); normalize it so
	// path comparisons don't false-negative.
	const pathname = useRouterState({
		select: (state) => state.location.pathname.replace(/\/+$/, "") || "/",
	});

	useEffect(() => {
		const target = syncTarget(pathname, view, isPending);
		if (!target) return;

		// `replace`: status hops are server-driven, so the back button should
		// step out of the run — not through stale screens that re-redirect.
		navigate({ to: target, replace: true });
	}, [navigate, pathname, view, isPending]);
};
