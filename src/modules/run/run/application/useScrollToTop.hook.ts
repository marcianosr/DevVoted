import { useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";

import { useTodaysRun } from "~/modules/run/run/application/useTodaysRun.hook";

const TOP = 0;
const SEPARATOR = "|";

const screenKeyOf = (
	pathname: string,
	pollId: string | undefined,
	answered: number
): string => [pathname, pollId ?? "", answered].join(SEPARATOR);

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
