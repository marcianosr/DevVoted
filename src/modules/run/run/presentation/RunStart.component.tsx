import { useNavigate } from "@tanstack/react-router";

import { plural } from "~/shared/lib/displayValue";
import { useRunCommunity } from "~/modules/run/community/application/useRunCommunity.hook";
import { useNextPollsCountdown } from "~/modules/run/community/presentation/useNextPollsCountdown.hook";
import {
	gateSwatchAt,
	swatchTrackFor,
} from "~/modules/run/gate/application/swatchTrack.viewmodel";
import { resumeTarget } from "~/modules/run/run/application/runRoutes.viewmodel";
import type { RunView } from "~/modules/run/run/application/runView.viewmodel";
import { pollsNoteFor } from "~/modules/run/run/application/todayScreen.viewmodel";
import { useRunActions } from "~/modules/run/run/application/useRunActions.hook";
import { useTodaysRun } from "~/modules/run/run/application/useTodaysRun.hook";
import { SLICE_WINDOW } from "~/modules/run/run/domain/rules.model";
import {
	TodayScreen,
	type TodayPress,
	type TodayRun,
} from "~/modules/run/run/presentation/TodayScreen.ui";

const START = "Start today’s climb";
const RESUME = "Resume";
const ANSWER = "Answer it";
const BOARD = "Open board";
const SHARED = "shared by everyone";
const EVERYONE = "see how everyone else is doing today";

const DIVIDER = " · ";

// No `days` yet: nothing on RunView counts how long a climb has been going, and
// a number the row cannot source is a number it should not print.
const todayRunFor = (view: RunView, pollsNote: string): TodayRun => {
	const swatch = gateSwatchAt(view.gatesCleared);
	const held = view.isOver ? "banked" : "stored";

	return {
		title: view.isOver
			? `Your last run reached ${swatch.gateName}`
			: `Your run is on ${swatch.gateName}`,
		standing: `gate ${view.gatesCleared} of ${view.victoryGate}${DIVIDER}${view.storage} KB ${held}`,
		swatches: swatchTrackFor(view.swatchGates, view.gatesCleared),
		pollsNote,
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
	const todayRun = view ? todayRunFor(view, pollsNoteFor(view)) : null;

	// The board counts distinct answerers of today's set, which is exactly what
	// its own header calls "N players answered". Deliberately not reused for the
	// community row: printing one number twice under two labels would state it
	// as two facts.
	const answeredBy = community.view?.totalPlayers;

	// Today's questions are answered inside the run — there is no standalone
	// screen for them, so "Answer it" leads where playing them leads.
	const startAndEnter = () =>
		start.mutate(undefined, {
			onSuccess: (result) => {
				if (result.success) navigate({ to: resumeTarget(result.data) });
			},
		});

	const answerToday = () => {
		if (!view) return startAndEnter();
		navigate({ to: resumeTarget(view) });
	};

	const live = view !== null && !view.isOver ? view : null;
	const action = ((): TodayPress => {
		if (live === null)
			return {
				label: START,
				onPress: start.isPending ? undefined : startAndEnter,
			};
		if (spent) return { label: countdown.label };
		return {
			label: RESUME,
			onPress: () => navigate({ to: resumeTarget(live) }),
		};
	})();

	return (
		<TodayScreen
			swatch={gateSwatchAt(view?.gatesCleared ?? 0)}
			run={todayRun}
			action={action}
			pollsLeft={view?.pollsLeftToday ?? SLICE_WINDOW}
			polls={{
				detail: [
					`${plural(SLICE_WINDOW, "question")}, ${SHARED}`,
					answeredBy === undefined ? null : `${answeredBy} have answered`,
				]
					.filter(Boolean)
					.join(DIVIDER),
				press: { label: ANSWER, onPress: answerToday },
			}}
			community={{
				detail: EVERYONE,
				press: {
					label: BOARD,
					onPress: () => navigate({ to: "/run/community" }),
				},
			}}
			error={start.data?.success === false ? start.data.error : undefined}
		/>
	);
};
