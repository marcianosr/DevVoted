import { useRunCommunity } from "~/modules/run/community/application/useRunCommunity.hook";
import { useHallOfFame } from "~/modules/run/community/application/useHallOfFame.hook";
import { hallOfFameFor } from "~/modules/run/community/application/hallOfFame.viewmodel";
import {
	INCIDENTS_DEALING,
	INCIDENTS_UNREADABLE,
	incidentsPanelFor,
} from "~/modules/run/incident/application/incident.viewmodel";
import { useIncidentsFeed } from "~/modules/run/incident/application/useIncidentsFeed.hook";
import { returnFromCommunity } from "~/modules/run/run/application/runRoutes.viewmodel";
import { useRunNavigation } from "~/modules/run/run/application/useRunNavigation.hook";
import { useTodaysRun } from "~/modules/run/run/application/useTodaysRun.hook";
import { CommunityView } from "~/modules/run/community/presentation/CommunityView.component";
import type { FileHand } from "~/modules/run/community/application/climbLadder.viewmodel";
import { auditLabelOf } from "~/modules/run/gate/domain/audit.model";
import { useAttackTargets } from "~/modules/run/incident/application/useAttackTargets.hook";
import { useFireAudit } from "~/modules/run/incident/application/useFireAudit.hook";
import { useLootFallenRun } from "~/modules/run/community/presentation/useLootFallenRun.hook";
import { useNextPollsCountdown } from "~/shared/hooks/useNextPollsCountdown.hook";
import { NEW_POLLS_IN, NOTHING_TO_COMPARE_YET } from "~/shared/lib/copy";
import type { RunCommunityView } from "~/modules/run/community/application/community.service";
import { gateSwatchAt } from "~/modules/run/gate/application/swatchTrack.viewmodel";

const LOADING = "Loading today’s comparison…";
const LOAD_FAILED =
	"Couldn’t load today’s comparison. Your run is unaffected — try again shortly.";

const EMPTY_COMMUNITY: RunCommunityView = {
	date: "",
	totalPlayers: 0,
	players: [],
	leaders: [],
	polls: [],
	climb: null,
};

export const RunCommunity = () => {
	const goTo = useRunNavigation();
	const { view: run } = useTodaysRun();
	const countdown = useNextPollsCountdown();
	const community = useRunCommunity();
	const hall = useHallOfFame();
	const feed = useIncidentsFeed();
	const loot = useLootFallenRun();
	const targets = useAttackTargets(run?.heldAudit != null);
	const fire = useFireAudit();

	const waitingForTomorrow =
		run?.awaitingTomorrow === true && !countdown.isOpen;
	const backTarget = returnFromCommunity(run ?? null);
	const back = {
		label: backTarget.label,
		onBack: () => goTo(backTarget.path),
		disabled: waitingForTomorrow,
	};
	const timer = countdown.isOpen
		? undefined
		: NEW_POLLS_IN(countdown.remaining);
	const swatch = gateSwatchAt(run?.gatesCleared ?? 0);
	const incidents = {
		...incidentsPanelFor(feed.view?.rows ?? []),
		...(feed.isPending ? { empty: INCIDENTS_DEALING } : {}),
		...(feed.errorMessage === null ? {} : { empty: INCIDENTS_UNREADABLE }),
	};
	const held = targets.view?.heldAudit ?? null;
	const offers = targets.view?.offers ?? [];
	const filing: FileHand | undefined =
		held === null
			? undefined
			: {
					audit: auditLabelOf(held.auditId),
					targetRunIdByUserId: new Map(
						offers.map((offer) => [offer.userId, offer.targetRunId])
					),
					onFile: (targetRunId: number) => {
						if (!fire.isPending) fire.mutate({ targetRunId });
					},
					...(fire.isPending && fire.variables !== undefined
						? { pendingRunId: fire.variables.targetRunId }
						: {}),
					...(fire.refused === undefined ? {} : { refused: fire.refused }),
				};
	const shared = {
		swatch,
		countdown: timer,
		back,
		incidents,
		rivals: feed.view?.rivals ?? [],
		loot: {
			onLoot: loot.onLoot,
			...(loot.pendingRunId === undefined
				? {}
				: { pendingRunId: loot.pendingRunId }),
		},
		...(filing === undefined ? {} : { filing }),
		...(hall.view === null ? {} : { hallOfFame: hallOfFameFor(hall.view) }),
	};

	if (community.isPending)
		return <CommunityView view={EMPTY_COMMUNITY} note={LOADING} {...shared} />;

	if (community.errorMessage || !community.view)
		return (
			<CommunityView
				view={EMPTY_COMMUNITY}
				note={community.errorMessage ? LOAD_FAILED : NOTHING_TO_COMPARE_YET}
				{...shared}
			/>
		);

	return <CommunityView view={community.view} {...shared} />;
};
