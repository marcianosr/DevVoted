import { useRunCommunity } from "~/modules/run/community/application/useRunCommunity.hook";
import { useNextPollsCountdown } from "~/shared/hooks/useNextPollsCountdown.hook";
import { gateSwatchAt } from "~/modules/run/gate/application/swatchTrack.viewmodel";
import {
	COMMUNITY_ROUTE,
	resumeTarget,
	RUN_ROUTES,
} from "~/modules/run/run/application/runRoutes.viewmodel";
import {
	climbersAtOrPast,
	communityLineFor,
	hubBuildFor,
	hubStripFor,
	incomingIncidentsFor,
	runSoFarFor,
	shopAsideFor,
	todayPressFor,
	type TodayPress,
} from "~/modules/run/run/application/todayScreen.viewmodel";
import { useRunActions } from "~/modules/run/run/application/useRunActions.hook";
import { useRunNavigation } from "~/modules/run/run/application/useRunNavigation.hook";
import { usePollsLeftToday } from "~/modules/run/run/application/usePollsLeftToday.hook";
import { useRunNumber } from "~/modules/run/run/application/useRunNumber.hook";
import { useTodaysRun } from "~/modules/run/run/application/useTodaysRun.hook";
import { TodayScreen } from "~/modules/run/run/presentation/TodayScreen.ui";

export const RunStart = () => {
	const goTo = useRunNavigation();
	const { view } = useTodaysRun();
	const runNumber = useRunNumber();
	const { start } = useRunActions();
	const countdown = useNextPollsCountdown();
	const community = useRunCommunity();
	const pollsLeftToday = usePollsLeftToday();

	const press = todayPressFor(view, countdown, pollsLeftToday.view);
	const shop = shopAsideFor(view, countdown);
	const build = hubBuildFor(view);
	const climbers = community.view?.climb?.climbers;
	const room = communityLineFor(
		community.view?.totalPlayers,
		view === null || view.isOver || climbers === undefined
			? undefined
			: {
					count: climbersAtOrPast(climbers, view.gatesCleared),
					gate: view.gatesCleared,
				}
	);

	const startAndEnter = () =>
		start.mutate(undefined, {
			onSuccess: (result) => {
				if (result.success) goTo(resumeTarget(result.data));
			},
		});

	const pressHandlerFor = (kind: TodayPress["kind"]) => {
		if (kind === "locked") return undefined;
		if (kind === "start") return start.isPending ? undefined : startAndEnter;
		if (view === null) return undefined;

		return () => goTo(resumeTarget(view));
	};

	return (
		<TodayScreen
			swatch={gateSwatchAt(view?.gatesCleared ?? 0)}
			strip={hubStripFor(view, runNumber.view)}
			press={{
				label: press.label,
				note: press.note,
				pollsLeft: press.pollsLeft,
				onPress: pressHandlerFor(press.kind),
			}}
			shop={{ ...shop, onPress: () => goTo(RUN_ROUTES.shop) }}
			incidents={incomingIncidentsFor(view)}
			runSoFar={runSoFarFor(view)}
			build={
				build === null
					? null
					: { ...build, shopHref: shop.open ? RUN_ROUTES.shop : undefined }
			}
			community={room === null ? null : { ...room, href: COMMUNITY_ROUTE }}
			refusal={start.errorMessage ?? undefined}
		/>
	);
};
