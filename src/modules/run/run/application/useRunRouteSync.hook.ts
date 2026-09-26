import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";

import { syncTarget } from "~/modules/run/run/application/runRoutes.viewmodel";

import { useTodaysRun } from "~/modules/run/run/application/useTodaysRun.hook";

export const useRunRouteSync = () => {
	const navigate = useNavigate();
	const { view, statusUnknown } = useTodaysRun();
	const pathname = useRouterState({
		select: (state) => state.location.pathname.replace(/\/+$/, "") || "/",
	});

	useEffect(() => {
		const target = syncTarget(pathname, view, statusUnknown);
		if (!target) return;

		navigate({ to: target, replace: true });
	}, [navigate, pathname, view, statusUnknown]);
};
