import { useNavigate } from "@tanstack/react-router";

import { useRunCommunity } from "~/modules/run/community/application/useRunCommunity.hook";
import { useNextPollsCountdown } from "~/shared/hooks/useNextPollsCountdown.hook";
import {
	gateSwatchAt,
	swatchTrackFor,
} from "~/modules/run/gate/application/swatchTrack.viewmodel";
import { resumeTarget } from "~/modules/run/run/application/runRoutes.viewmodel";
import type { RunView } from "~/modules/run/run/application/runView.viewmodel";
import {
	communityLineFor,
	coverageReadingFor,
	shopAsideFor,
	standingFor,
	todayPressFor,
	type TodayPress,
} from "~/modules/run/run/application/todayScreen.viewmodel";
import { useRunActions } from "~/modules/run/run/application/useRunActions.hook";
import { useTodaysRun } from "~/modules/run/run/application/useTodaysRun.hook";
import {
	TodayScreen,
	type TodayStandingProps,
} from "~/modules/run/run/presentation/TodayScreen.ui";

const COMMUNITY_ROUTE = "/run/community";
const SHOP_ROUTE = "/run/shop";

const standingPropsFor = (view: RunView | null): TodayStandingProps | null =>
	view === null
		? null
		: {
				swatches: swatchTrackFor(view.swatchGates, view.gatesCleared),
				line: standingFor(view),
			};

export const RunStart = () => {
	const navigate = useNavigate();
	const { view } = useTodaysRun();
	const { start } = useRunActions();
	const countdown = useNextPollsCountdown();
	const community = useRunCommunity();

	const press = todayPressFor(view, countdown);
	const shop = shopAsideFor(view);
	const room = communityLineFor(community.view?.totalPlayers);

	const startAndEnter = () =>
		start.mutate(undefined, {
			onSuccess: (result) => {
				if (result.success) navigate({ to: resumeTarget(result.data) });
			},
		});

	const pressHandlerFor = (kind: TodayPress["kind"]) => {
		if (kind === "locked") return undefined;
		if (kind === "start") return start.isPending ? undefined : startAndEnter;
		if (view === null) return undefined;

		return () => navigate({ to: resumeTarget(view) });
	};

	return (
		<TodayScreen
			swatch={gateSwatchAt(view?.gatesCleared ?? 0)}
			press={{
				label: press.label,
				note: press.note,
				pollsLeft: press.pollsLeft,
				onPress: pressHandlerFor(press.kind),
			}}
			shop={{ ...shop, onPress: () => navigate({ to: SHOP_ROUTE }) }}
			standing={standingPropsFor(view)}
			coverage={coverageReadingFor(view)}
			community={room === null ? null : { ...room, href: COMMUNITY_ROUTE }}
			refusal={start.data?.success === false ? start.data.error : undefined}
		/>
	);
};
