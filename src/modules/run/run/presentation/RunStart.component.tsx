import { Advertisement } from "~/modules/account/profile/presentation/Advertisement.component";
import { useRunCommunity } from "~/modules/run/community/application/useRunCommunity.hook";
import { useDisclosure } from "~/shared/hooks/useDisclosure.hook";
import { useNextPollsCountdown } from "~/shared/hooks/useNextPollsCountdown.hook";
import {
	COMMUNITY_ROUTE,
	resumeTarget,
	RUN_ROUTES,
} from "~/modules/run/run/application/runRoutes.viewmodel";
import {
	communityLineFor,
	hubBuildFor,
	hubHeadlineFor,
	hubPressFor,
	hubSwatchFor,
	incomingIncidentsFor,
	runSoFarFor,
	shopAsideFor,
	type HubPressKind,
} from "~/modules/run/run/application/todayScreen.viewmodel";
import { useRunActions } from "~/modules/run/run/application/useRunActions.hook";
import { useRunNavigation } from "~/modules/run/run/application/useRunNavigation.hook";
import { usePollsLeftToday } from "~/modules/run/run/application/usePollsLeftToday.hook";
import { useRunNumber } from "~/modules/run/run/application/useRunNumber.hook";
import { useTodaysRun } from "~/modules/run/run/application/useTodaysRun.hook";
import { TodayScreen } from "~/modules/run/run/presentation/TodayScreen.ui";

const FOLDED_ON_ARRIVAL = false;

export const RunStart = () => {
	const goTo = useRunNavigation();
	const { view } = useTodaysRun();
	const runNumber = useRunNumber();
	const { start } = useRunActions();
	const countdown = useNextPollsCountdown("second");
	const community = useRunCommunity();
	const pollsLeftToday = usePollsLeftToday();

	const build = hubBuildFor(view);
	const disclosure = useDisclosure(
		build?.rows.map((row) => row.id) ?? [],
		FOLDED_ON_ARRIVAL
	);
	const press = hubPressFor(view, countdown, pollsLeftToday.view);
	const shop = shopAsideFor(view, countdown, pollsLeftToday.view);
	const shopOpen = shop === null || shop.open;
	const room = communityLineFor(
		community.view?.totalPlayers,
		community.view?.players
	);

	const toShop = () => goTo(RUN_ROUTES.shop);

	const startAndEnter = () =>
		start.mutate(undefined, {
			onSuccess: (result) => {
				if (result.success) goTo(resumeTarget(result.data));
			},
		});

	const pressHandlerFor = (kind: HubPressKind) => {
		if (kind === "locked") return undefined;
		if (kind === "shop") return toShop;
		if (kind === "start") return start.isPending ? undefined : startAndEnter;
		if (view === null) return undefined;

		return () => goTo(resumeTarget(view));
	};

	return (
		<TodayScreen
			swatch={hubSwatchFor(view)}
			headline={hubHeadlineFor(
				view,
				countdown,
				pollsLeftToday.view,
				runNumber.view
			)}
			press={{ ...press, onPress: pressHandlerFor(press.kind) }}
			shop={shop === null ? null : { ...shop, onPress: toShop }}
			incidents={incomingIncidentsFor(view)}
			community={room === null ? null : { ...room, href: COMMUNITY_ROUTE }}
			runSoFar={runSoFarFor(view, countdown)}
			build={
				build === null
					? null
					: {
							...build,
							shopHref: shopOpen ? RUN_ROUTES.shop : undefined,
							openInfo: disclosure.open,
							onToggleInfo: disclosure.toggle,
						}
			}
			refusal={start.errorMessage ?? undefined}
			advertisement={<Advertisement placement="hub" />}
		/>
	);
};
