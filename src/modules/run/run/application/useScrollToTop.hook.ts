import { useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";

import { useTodaysRun } from "~/modules/run/run/application/useTodaysRun.hook";

const TOP = 0;
const SEPARATOR = "|";

/**
 * What the player is looking at, which is not the same as where they are. The
 * run hops between routes with `replace`, and a poll gives way to the next one
 * without navigating at all — the /run/poll route simply renders a new
 * question. Neither is a scroll restoration the router will do for us, so the
 * screen is keyed by its own identity instead of by its URL alone.
 */
const screenKeyOf = (
	pathname: string,
	pollId: string | undefined,
	answered: number
): string => [pathname, pollId ?? "", answered].join(SEPARATOR);

/**
 * Puts a new screen at its top. A phone carries the run in one long column, so
 * landing on a debrief at the scroll depth of the poll before it hides the very
 * thing the player pressed for.
 */
export const useScrollToTop = () => {
	const { view } = useTodaysRun();
	const pathname = useRouterState({
		select: (state) => state.location.pathname,
	});
	const screen = screenKeyOf(
		pathname,
		view?.poll?.id,
		view?.allAnswered.length ?? 0
	);

	useEffect(() => {
		window.scrollTo(TOP, TOP);
	}, [screen]);
};
