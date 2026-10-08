import { NOTHING_TO_COMPARE_YET } from "~/shared/lib/copy";
import type { HallOfFameProps } from "~/ui/kanto-theme/HallOfFame.ui";

import type { CategoryCode } from "~/shared/lib/categories";
import { getCategoryMetadata } from "~/shared/lib/categories";
import { plural } from "~/shared/lib/displayValue";
import { kbLabel } from "~/shared/lib/storage";

import type {
	ClimbFallen,
	ClimbTodayView,
	RunCommunityPoll,
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
import { SLICE_WINDOW } from "~/modules/run/run/domain/rules.model";
import type {
	CommunityScreenProps,
	CommunityTurnout,
	TurnoutBand,
} from "~/ui/kanto-theme/CommunityScreen.ui";
import type { ClimberProps } from "~/ui/kanto-theme/Climber.ui";
import type { IncidentsPanelProps } from "~/ui/kanto-theme/IncidentsPanel.ui";
import type { PollResultProps } from "~/ui/kanto-theme/PollResult.ui";
import type { OpenedCardDetail } from "~/ui/kanto-theme/ClimbMap.ui";
import {
	type PlayerCardView,
	playerCardFor,
} from "~/modules/run/community/application/playerCard.viewmodel";

const LETTERS = "ABCDEFGH";

const COPY = {
	title: "Community",
	tagline: "What are other players doing?",
	turnoutTitle: "Today’s records",
	answeredToday: "answered today",
	unheldRecord: "—",
	mapTitle: "Where everyone is",
	noPlace: "start a run to place yourself",
	pollsTitle: "The day’s polls",
	reviewAnswers: "Review answers",
	notDealtYet: (index: number) => `Poll ${index + 1} · not dealt yet`,
	countdownHint: "until the next five polls are dealt",
	pollsOpen: "polls are open",
	whereYouStand: "where your run stands",
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
	"biggest-build": { label: "biggest build", figure: slotsLabel },
	"lightest-build": { label: "lightest build", figure: slotsLabel },
	comeback: {
		label: "comeback",
		caption: "held at this gate before, cleared it today",
		figure: String,
	},
	"most-audits": {
		label: "most audits",
		caption: "in one run",
		figure: String,
	},
	"top-config": {
		label: "most installed",
		figure: (players) => plural(players, "player"),
	},
	"priciest-build": { label: "most expensive build", figure: kbLabel },
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

const heldRecordRow = ({ record, holders }: CommunityRecord): TurnoutBand => {
	const { label, caption, figure } = RECORD_ROWS[record.id];
	const named = record.id === "top-config" ? record.configLabel : caption;
	return {
		label,
		...(named === undefined ? {} : { caption: named }),
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
	color: "cerulean",
	shown: SHOWED_UP_FACES,
	...facesOf(view.players),
});

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
		records: recordRowsOf(turnout?.records ?? []),
	};
};

const categoryNameOf = (category: CategoryCode | null): string =>
	category === null ? "Poll" : getCategoryMetadata(category).name;

export const pollTallyFor = (
	polls: readonly RunCommunityPoll[]
): string | undefined => {
	const revealed = polls.filter((poll) => poll.detail !== null);
	if (revealed.length === 0) return undefined;

	const right = revealed.filter((poll) => poll.outcome === "correct").length;
	return `${right} of ${revealed.length}`;
};

export const pollResultsFor = (
	polls: readonly RunCommunityPoll[]
): PollResultProps[] => {
	if (polls.length === 0) return [];

	return Array.from({ length: SLICE_WINDOW }, (_, index): PollResultProps => {
		const poll = polls.find((entry) => entry.index === index);
		if (poll === undefined)
			return { state: "sealed", index, question: COPY.notDealtYet(index) };
		if (poll.detail === null)
			return { state: "sealed", index, question: poll.question };

		const { answeredCount, gotItRightCount, options } = poll.detail;
		return {
			state: "revealed",
			index,
			question: poll.question,
			category: categoryNameOf(poll.category),
			outcome: poll.outcome === "missed" ? "wrong" : poll.outcome,
			rightShare:
				answeredCount === 0
					? 0
					: Math.round((gotItRightCount / answeredCount) * 100),
			options: options.map((option, position) => ({
				letter: LETTERS[position] ?? "?",
				label: option.label,
				percent: option.percent,
				votes: option.count,
				isRight: option.isRight,
				voters: option.voters.map(climberOf),
			})),
		};
	});
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
			stats: [
				{
					icon: "community",
					label: plural(view.totalPlayers, "player"),
					hint: COPY.answeredToday,
				},
				{
					icon: "gate",
					label: `gate ${swatch.gate} · ${swatch.gateName}`,
					hint: COPY.whereYouStand,
				},
			],
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
		polls: {
			title: COPY.pollsTitle,
			tally: pollTallyFor(view.polls),
			polls: pollResultsFor(view.polls),
			...(onReview === undefined
				? {}
				: { review: { label: COPY.reviewAnswers, onReview } }),
		},
	};
};
