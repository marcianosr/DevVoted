import { Outlet } from "@tanstack/react-router";

import { Screen } from "~/ui/Screen.ui";
import { Paragraph } from "~/ui/typography/Paragraph.component";
import { Title } from "~/ui/typography/Title.component";

import { HudBar } from "~/modules/run/run/presentation/HudBar.ui";
import { RunHud } from "~/modules/run/run/presentation/RunHud.ui";
import { useRunRouteSync } from "~/modules/run/run/application/useRunRouteSync.hook";
import { useTodaysRun } from "~/modules/run/run/application/useTodaysRun.hook";

export const RunLayout = () => {
	useRunRouteSync();
	const { view, isPending, errorMessage } = useTodaysRun();

	if (isPending) {
		return (
			<Screen width="narrow">
				<Paragraph>Loading today’s climb…</Paragraph>
			</Screen>
		);
	}

	if (errorMessage) {
		return (
			<Screen width="narrow">
				<Title>Something broke</Title>
				<Paragraph>{errorMessage}</Paragraph>
			</Screen>
		);
	}

	const runOver = view?.isOver ?? false;

	return (
		<>
			{view && !runOver && (
				<HudBar>
					<RunHud
						storage={view.storage}
						gatesCleared={view.gatesCleared}
						victoryGate={view.victoryGate}
						pollsAnswered={view.pollsAnswered}
						pollsPerGate={view.pollsPerGate}
						gateCoverage={view.gateStake.coverageHeld}
						gateCoverageDemand={view.gateStake.coverageDemand}
						coverageByCategory={view.coverageByCategory}
					/>
				</HudBar>
			)}
			<Outlet />
		</>
	);
};
