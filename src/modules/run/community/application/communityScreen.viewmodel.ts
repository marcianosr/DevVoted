import { NOTHING_TO_COMPARE_YET } from "~/shared/lib/copy";
import type { HallOfFameProps } from "~/modules/run/community/presentation/HallOfFame.ui";

import { plural } from "~/shared/lib/displayValue";
import { kbLabel } from "~/shared/lib/storage";

import type {
	ClimbFallen,
	ClimbTodayView,
	RunCommunityPoll,
	RunCommunityPollDetail,
	RunCommunityView,
} from "~/modules/run/community/application/community.service";
import type { CommunityVoter } from "~/modules/run/community/domain/voter.model";
import {
	type CommunityDayTurnout,
	type CommunityRecord,
	type DayOutcome,
	type DayRecord,
	DAY_OUTCOMES,
} from "~/modules/run/community/domain/dayRecords.model";
import { bandOf } from "~/modules/run/build/domain/coverageRatio.model";
import { categoryBoardFor } from "~/modules/run/run/application/categoryLeader.viewmodel";
import {
	type FileHand,
	ladderFor,
	type LootHand,
} from "~/modules/run/community/application/climbLadder.viewmodel";
import type { GateSwatch } from "~/modules/run/gate/domain/swatch.model";
import type {
	CommunityScreenProps,
	CommunityRecords,
	CommunityStat,
	CommunityTurnout,
	TurnoutBand,
} from "~/modules/run/community/presentation/CommunityScreen.ui";
import type { ClimberProps } from "~/modules/run/community/presentation/Climber.ui";
import type { IncidentsPanelProps } from "~/modules/run/incident/presentation/IncidentsPanel.ui";
import type {
	PollSpotlightProps,
	SpotlightPoll,
} from "~/modules/run/community/presentation/PollSpotlight.ui";
import type { OpenedCardDetail } from "~/modules/run/community/presentation/ClimbMap.ui";
import {
	type PlayerCardView,
	playerCardFor,
} from "~/modules/run/community/application/playerCard.viewmodel";
import { RESTING_AFTER_DAYS } from "~/modules/run/community/domain/climbMap.model";

const COPY = {
	title: "Community",
	tagline: "What are other players doing?",
	turnoutTitle: "Who cleared what",
	recordsTitle: "Today’s records",
	answeredToday: "Answered today",
	guestsHint: "playing without an account",
	restingHint: `no answer for ${RESTING_AFTER_DAYS} days or more`,
	unheldRecord: "—",
	mapTitle: "Where everyone is",
	noPlace: "start a run to place yourself",
	pollsTitle: "Today’s polls",
	reviewAnswers: (count: number) =>
		count === 1 ? "Review your answer" : `Review all ${count} answers`,
	countdownHint: "until the next five polls are dealt",
	pollsOpen: "polls are open",
} as const;

const climberOf = (voter: CommunityVoter): ClimberProps => ({
	userId: voter.id,
	name: voter.displayName,
	photoUrl: voter.photoUrl ?? undefined,
	borderUrl: voter.borderUrl ?? undefined,
	you: voter.you,
});

export type OptionVotes = {
	label: string;
	count: number;
	climbers: readonly ClimberProps[];
};

export const pollVotesOf = (
	polls: readonly RunCommunityPoll[]
): ReadonlyMap<string, readonly OptionVotes[]> =>
	new Map(
		polls.flatMap((poll) =>
			poll.detail === null
				? []
				: [
						[
							String(poll.pollId),
							poll.detail.options.map((option) => ({
								label: option.label,
								count: option.count,
								climbers: option.voters.map(climberOf),
							})),
						] as const,
					]
		)
	);

const OUTCOME_CAPTION = {
	perfect: "finished at 100%",
	healthy: "comfortably cleared",
	ok: "narrowly cleared",
	shaky: "gate held them",
	danger: "run ended",
} as const satisfies Record<DayOutcome, string>;

const slotsLabel = (slots: number): string => plural(slots, "slot");

type RecordKind = DayRecord["id"];

type RecordRow = {
	label: string;
	caption?: string;
	figure: (value: number) => string;
};

const RECORD_ROWS: Record<RecordKind, RecordRow> = {
	"biggest-build": { label: "Biggest build", figure: slotsLabel },
	"lightest-build": { label: "Lightest build", figure: slotsLabel },
	comeback: {
		label: "Comeback",
		caption: "held at this gate before, cleared it today",
		figure: String,
	},
	"most-audits": {
		label: "Most audits",
		caption: "across the whole run",
		figure: String,
	},
	"top-config": {
		label: "Most installed",
		figure: (players) => plural(players, "player"),
	},
	"priciest-build": { label: "Most expensive build", figure: kbLabel },
	"kb-generated": {
		label: "KB generated today",
		caption: "top earner",
		figure: kbLabel,
	},
	"kb-spent": {
		label: "KB spent today",
		caption: "biggest spender",
		figure: kbLabel,
	},
};

const RECORD_ORDER = [
	"biggest-build",
	"lightest-build",
	"comeback",
	"most-audits",
	"top-config",
	"priciest-build",
	"kb-generated",
	"kb-spent",
] as const satisfies readonly RecordKind[];

const unheldRecordRow = (kind: RecordKind): TurnoutBand => {
	const { label, caption } = RECORD_ROWS[kind];
	return {
		label,
		...(caption === undefined ? {} : { caption }),
		count: COPY.unheldRecord,
		climbers: [],
		overflow: 0,
	};
};

const topConfigChipOf = (record: CommunityRecord["record"]) =>
	record.id === "top-config"
		? {
				config: {
					name: record.configLabel,
					slots: record.configSlots,
					badges: [],
				},
			}
		: {};

const heldRecordRow = ({ record, holders }: CommunityRecord): TurnoutBand => {
	const { label, caption, figure } = RECORD_ROWS[record.id];
	return {
		label,
		...(caption === undefined ? {} : { caption }),
		...topConfigChipOf(record),
		count: figure(record.figure),
		...facesOf(holders),
	};
};

const recordRowsOf = (
	records: readonly CommunityRecord[]
): readonly TurnoutBand[] =>
	RECORD_ORDER.map((kind) => {
		const held = records.find(({ record }) => record.id === kind);
		return held === undefined ? unheldRecordRow(kind) : heldRecordRow(held);
	});

const facesOf = (
	voters: readonly CommunityVoter[]
): Pick<TurnoutBand, "climbers" | "overflow"> => ({
	climbers: voters.map(climberOf),
	overflow: 0,
});

const SHOWED_UP_FACES = 10;

export const showedUpBand = (
	view: Pick<RunCommunityView, "totalPlayers" | "players">
): TurnoutBand => ({
	label: COPY.answeredToday,
	count: String(view.totalPlayers),
	shown: SHOWED_UP_FACES,
	...facesOf(view.players),
});

const guestStat = (guestPlayers: number): CommunityStat => ({
	icon: "lock",
	label: plural(guestPlayers, "guest"),
	hint: COPY.guestsHint,
});

const restingStat = (restingPlayers: number): CommunityStat => ({
	icon: "clock",
	label: `${restingPlayers} resting`,
	hint: COPY.restingHint,
});

export const statsFor = (
	view: Pick<
		RunCommunityView,
		"totalPlayers" | "guestPlayers" | "restingPlayers"
	>
): CommunityStat[] => [
	{
		icon: "community",
		label: plural(view.totalPlayers, "player"),
		hint: COPY.answeredToday,
	},
	...(view.guestPlayers === 0 ? [] : [guestStat(view.guestPlayers)]),
	...(view.restingPlayers === 0 ? [] : [restingStat(view.restingPlayers)]),
];

export type FallenPress = (userId: string) => (() => void) | undefined;

const pressableOf =
	(pressFallen: FallenPress) =>
	(climber: ClimberProps): ClimberProps => {
		const onPress =
			climber.userId === undefined ? undefined : pressFallen(climber.userId);
		return onPress === undefined ? climber : { ...climber, onPress };
	};

export const turnoutFor = (
	turnout: CommunityDayTurnout | undefined,
	showedUp: TurnoutBand,
	pressFallen: FallenPress = () => undefined
): CommunityTurnout => {
	const outcomes = DAY_OUTCOMES.map((outcome): TurnoutBand => {
		const voters = turnout?.outcomes[outcome] ?? [];
		const band = bandOf(outcome);
		const faces = facesOf(voters);
		return {
			label: band.label,
			caption: OUTCOME_CAPTION[outcome],
			count: String(voters.length),
			color: band.colour,
			...faces,
			...(outcome === "danger"
				? { climbers: faces.climbers.map(pressableOf(pressFallen)) }
				: {}),
		};
	});

	return {
		title: COPY.turnoutTitle,
		bands: [showedUp, ...outcomes],
	};
};

export const recordsFor = (
	turnout: CommunityDayTurnout | undefined
): CommunityRecords => ({
	title: COPY.recordsTitle,
	rows: recordRowsOf(turnout?.records ?? []),
});

type RevealedPoll = {
	question: string;
	rightShare: number;
	gotIt: readonly ClimberProps[];
};

const rightShareOf = ({
	answeredCount,
	gotItRightCount,
}: RunCommunityPollDetail): number =>
	answeredCount === 0 ? 0 : Math.round((gotItRightCount / answeredCount) * 100);

const youFirst = (climbers: readonly ClimberProps[]): ClimberProps[] => [
	...climbers.filter((climber) => climber.you === true),
	...climbers.filter((climber) => climber.you !== true),
];

const gotItOf = ({
	answerType,
	options,
}: RunCommunityPollDetail): readonly ClimberProps[] =>
	answerType === "single"
		? youFirst(
				options
					.filter((option) => option.isRight)
					.flatMap((option) => option.voters.map(climberOf))
			)
		: [];

const revealedPollsOf = (polls: readonly RunCommunityPoll[]): RevealedPoll[] =>
	[...polls]
		.sort((a, b) => a.index - b.index)
		.flatMap((poll) =>
			poll.detail === null
				? []
				: [
						{
							question: poll.question,
							rightShare: rightShareOf(poll.detail),
							gotIt: gotItOf(poll.detail),
						},
					]
		);

const spotlightsOf = (revealed: readonly RevealedPoll[]): SpotlightPoll[] => {
	const hardest = revealed.reduce((low, poll) =>
		poll.rightShare < low.rightShare ? poll : low
	);
	const easiest = revealed.reduce((high, poll) =>
		poll.rightShare > high.rightShare ? poll : high
	);
	const hardestCard: SpotlightPoll = { kind: "hardest", ...hardest };

	return easiest === hardest
		? [hardestCard]
		: [hardestCard, { kind: "easiest", ...easiest }];
};

export const pollSpotlightFor = (
	polls: readonly RunCommunityPoll[],
	onReview?: () => void
): PollSpotlightProps => {
	const revealed = revealedPollsOf(polls);
	if (revealed.length === 0)
		return {
			title: COPY.pollsTitle,
			spotlights: [],
			empty: NOTHING_TO_COMPARE_YET,
		};

	return {
		title: COPY.pollsTitle,
		spotlights: spotlightsOf(revealed),
		...(onReview === undefined
			? {}
			: {
					review: {
						label: COPY.reviewAnswers(revealed.length),
						onReview,
					},
				}),
	};
};

const fallenPressFor =
	(
		fallen: readonly ClimbFallen[],
		onInspect: ((id: string) => void) | undefined
	): FallenPress =>
	(userId) => {
		const run = fallen.find((entry) => entry.id === userId);
		if (run === undefined || onInspect === undefined) return undefined;
		return () => onInspect(String(run.runId));
	};

export const openedUserIdOf = (
	climb: ClimbTodayView | null,
	openId: string | undefined
): string | undefined => {
	if (climb === null || openId === undefined) return undefined;
	const climber = climb.climbers.find((entry) => entry.id === openId);
	if (climber !== undefined) return climber.id;
	return climb.fallen.find((entry) => String(entry.runId) === openId)?.id;
};

export const openedDetailOf = (
	card: PlayerCardView | null
): OpenedCardDetail | undefined => {
	if (card === null) return undefined;
	const { contribution, swatches } = playerCardFor(card);
	return {
		...(contribution === undefined ? {} : { contribution }),
		...(swatches === undefined ? {} : { swatches }),
	};
};

export type CommunityScreenFrame = {
	view: RunCommunityView;
	swatch: GateSwatch;
	rivals?: readonly string[];
	openClimberId?: string;
	openedDetail?: OpenedCardDetail;
	onInspectClimber?: (id: string) => void;
	countdown?: string;
	note?: string;
	back: {
		label: string;
		disabled?: boolean;
		onBack: () => void;
	};
	onReview?: () => void;
	incidents?: IncidentsPanelProps;
	loot?: LootHand;
	filing?: FileHand;
	hallOfFame?: HallOfFameProps;
};

export const communityScreenPropsFor = ({
	view,
	swatch,
	countdown,
	note,
	back,
	onReview,
	incidents,
	filing,
	rivals = [],
	openClimberId,
	openedDetail,
	onInspectClimber,
	loot,
	hallOfFame,
}: CommunityScreenFrame): CommunityScreenProps => {
	const empty = view.polls.length === 0;
	const dayNote = note ?? (empty ? NOTHING_TO_COMPARE_YET : undefined);

	return {
		header: {
			swatch,
			title: COPY.title,
			subtitle: dayNote ?? COPY.tagline,
			countdown: countdown ?? COPY.pollsOpen,
			countdownColor: countdown === undefined ? "viridian" : undefined,
			countdownHint: COPY.countdownHint,
			stats: statsFor(view),
			prep: {
				label: back.label,
				onPress: back.disabled === true ? undefined : back.onBack,
			},
		},
		turnout: turnoutFor(
			view.climb?.turnout,
			showedUpBand(view),
			fallenPressFor(view.climb?.fallen ?? [], onInspectClimber)
		),
		records: recordsFor(view.climb?.turnout),
		map: {
			title: COPY.mapTitle,
			...(view.climb === null
				? { empty: COPY.noPlace }
				: {
						track: {
							gates: ladderFor(view.climb, rivals, loot, filing),
							...(openClimberId === undefined ? {} : { openId: openClimberId }),
							...(openedDetail === undefined ? {} : { openedDetail }),
							...(onInspectClimber === undefined
								? {}
								: { onInspect: onInspectClimber }),
						},
					}),
		},
		...(incidents === undefined ? {} : { incidents }),
		...(hallOfFame === undefined ? {} : { hallOfFame }),
		leaders: view.leaders.map(categoryBoardFor),
		polls: pollSpotlightFor(view.polls, onReview),
	};
};
