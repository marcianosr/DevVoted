import { Outlet } from "@tanstack/react-router";

import { Screen } from "~/ui/kanto-theme/Screen.ui";
import { Typography } from "~/ui/kanto-theme/Typography.ui";

import { useRunRouteSync } from "~/modules/run/run/application/useRunRouteSync.hook";
import { useTodaysRun } from "~/modules/run/run/application/useTodaysRun.hook";

/**
 * No HUD: every kanto screen carries its own header, coverage bar and build
 * footer, so a layout-level bar would state the same numbers twice. The layout
 * is now only the route sync plus the two states no screen can draw itself.
 */
export const RunLayout = () => {
	useRunRouteSync();
	const { isPending, errorMessage } = useTodaysRun();

	if (isPending) {
		return (
			<Screen theme="pewter" width="narrow">
				<Typography variant="paragraph">Loading today’s climb…</Typography>
			</Screen>
		);
	}

	if (errorMessage) {
		return (
			<Screen theme="cinnabar" width="narrow">
				<Typography variant="title">Something broke</Typography>
				<Typography variant="paragraph">{errorMessage}</Typography>
			</Screen>
		);
	}

	return <Outlet />;
};
