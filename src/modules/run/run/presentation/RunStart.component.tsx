import { useNavigate } from "@tanstack/react-router";

import { useRunCommunity } from "~/modules/run/community/application/useRunCommunity.hook";
import { useNextPollsCountdown } from "~/modules/run/community/presentation/useNextPollsCountdown.hook";
import {
	ALL_SWATCHES,
	swatchForGate,
} from "~/modules/run/gate/domain/swatch.model";
import { resumeTarget } from "~/modules/run/run/application/runRoutes.viewmodel";
import type { RunView } from "~/modules/run/run/application/runView.viewmodel";
import { useRunActions } from "~/modules/run/run/application/useRunActions.hook";
import { useTodaysRun } from "~/modules/run/run/application/useTodaysRun.hook";
import { SLICE_WINDOW } from "~/modules/run/run/domain/rules.model";
import {
	TodayScreen,
	type TodayPolls,
	type TodayRun,
} from "~/ui/modern-theme/screens/TodayScreen.ui";

const LADDER = ALL_SWATCHES.map(({ gate, theme, finish }) => ({
	gate,
	theme,
	finish,
}));

// No `days` yet: nothing on RunView counts how long a climb has been going, and
// a number the row cannot source is a number it should not print.
const runRowFor = (view: RunView): TodayRun => {
	const swatch = swatchForGate(view.gatesCleared);

	return {
		gateName: swatch?.gateName ?? "",
		theme: swatch?.theme,
		finish: swatch?.finish,
		gatesCleared: view.gatesCleared,
		gateCount: view.victoryGate,
		storageKb: view.storage,
		gates: LADDER,
		live: !view.isOver,
	};
};

/** Tier 2: the /run hub — what your climb is doing, and the ways off it. */
export const RunStart = () => {
	const navigate = useNavigate();
	const { view } = useTodaysRun();
	const { start } = useRunActions();
	const countdown = useNextPollsCountdown();
	const community = useRunCommunity();

	// Today's segment is open unless this run has spent it. With no run there is
	// nothing to have spent, so a fresh climb always finds it open.
	const spent = view?.pollsExhausted === true && !countdown.isOpen;
	const polls: TodayPolls = spent
		? { ready: false, opensIn: countdown.label }
		: { ready: true, count: SLICE_WINDOW };

	// The board counts distinct answerers of today's set, which is exactly what
	// its own header calls "N players answered". Deliberately not reused for the
	// community row: printing one number twice under two labels would state it
	// as two facts.
	const answeredBy = community.view?.totalPlayers;

	// Today's questions are answered inside the run — there is no standalone
	// screen for them, so "Answer it" leads where playing them leads.
	const answerToday = () => {
		if (!view) return start.mutate();
		navigate({ to: resumeTarget(view) });
	};

	return (
		<TodayScreen
			run={view ? runRowFor(view) : null}
			polls={polls}
			onStart={() => start.mutate()}
			onResume={() => view && navigate({ to: resumeTarget(view) })}
			dailyPoll={{
				questions: SLICE_WINDOW,
				answeredBy,
				onAnswer: answerToday,
			}}
			// No live-runs count exists, so the row keeps its name and its press
			// and drops the figure.
			community={{ onOpen: () => navigate({ to: "/run/community" }) }}
			starting={start.isPending}
			error={start.data?.success === false ? start.data.error : undefined}
		/>
	);
};
