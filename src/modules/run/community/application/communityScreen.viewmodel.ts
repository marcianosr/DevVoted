import { NOTHING_TO_COMPARE_YET } from "~/shared/lib/copy";
import type { HallOfFameProps } from "~/ui/kanto-theme/HallOfFame.ui";

import type { CategoryCode } from "~/shared/lib/categories";
import { getCategoryMetadata } from "~/shared/lib/categories";
import { plural } from "~/shared/lib/displayValue";
import { kbLabel } from "~/shared/lib/storage";

import type {
	ClimbFallen,
	RunCommunityPoll,
	RunCommunityView,
} from "~/modules/run/community/application/community.service";
import type { CommunityVoter } from "~/modules/run/community/domain/voter.model";
import {
	type CommunityDayTurnout,
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

const LETTERS = "ABCDEFGH";

const COPY = {
	title: "Community",
	tagline: "What are other players doing?",
	turnoutTitle: "Today’s records",
	answeredToday: "answered today",
	mapTitle: "Where everyone is",
	noPlace: "start a run to place yourself",
	pollsTitle: "The day’s polls",
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

const OUTCOME_CAPTION = {
	perfect: "finished at 100%",
	healthy: "comfortably cleared",
	ok: "narrowly cleared",
	shaky: "gate held them",
	danger: "run ended",
} as const satisfies Record<DayOutcome, string>;

const slotsLabel = (slots: number): string => plural(slots, "slot");

const recordRowOf = (
	record: DayRecord
): Pick<TurnoutBand, "label" | "caption" | "count"> => {
	switch (record.id) {
		case "biggest-build":
			return { label: "biggest build", count: slotsLabel(record.figure) };
		case "lightest-build":
			return { label: "lightest build", count: slotsLabel(record.figure) };
		case "comeback":
			return {
				label: "comeback",
				caption: "held at this gate before, cleared it today",
				count: String(record.figure),
			};
		case "most-audits":
			return {
				label: "most audits",
				caption: "in one run",
				count: String(record.figure),
			};
		case "top-config":
			return {
				label: "most installed",
				caption: record.configLabel,
				count: plural(record.figure, "player"),
			};
		case "priciest-build":
			return { label: "most expensive build", count: kbLabel(record.figure) };
		case "kb-generated":
			return {
				label: "KB generated today",
				caption: "top earner",
				count: kbLabel(record.figure),
			};
		case "kb-spent":
			return {
				label: "KB spent today",
				caption: "biggest spender",
				count: kbLabel(record.figure),
			};
	}
};

const facesOf = (
	voters: readonly CommunityVoter[]
): Pick<TurnoutBand, "climbers" | "overflow"> => ({
	climbers: voters.map(climberOf),
	overflow: 0,
});

export const showedUpBand = (
	view: Pick<RunCommunityView, "totalPlayers" | "players">
): TurnoutBand => ({
	label: COPY.answeredToday,
	count: String(view.totalPlayers),
	color: "cerulean",
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
	const outcomes = DAY_OUTCOMES.filter(
		(outcome) => (turnout?.outcomes[outcome].length ?? 0) > 0
	).map((outcome): TurnoutBand => {
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
		records: (turnout?.records ?? []).map(({ record, holders }) => ({
			...recordRowOf(record),
			...facesOf(holders),
		})),
	};
};

const categoryNameOf = (category: CategoryCode | null): string =>
	category === null ? "Poll" : getCategoryMetadata(category).name;

export const defaultOpenIndex = (
	polls: readonly RunCommunityPoll[]
): number | undefined =>
	polls.filter((poll) => poll.detail !== null).at(-1)?.index;

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
	const openAt = defaultOpenIndex(polls);

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
			open: index === openAt,
			options: options.map((option, position) => ({
				letter: LETTERS[position] ?? "?",
				label: option.label,
				percent: option.percent,
				votes: option.count,
				isRight: option.isRight,
				yours: option.yours,
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

export type CommunityScreenFrame = {
	view: RunCommunityView;
	swatch: GateSwatch;
	rivals?: readonly string[];
	openClimberId?: string;
	onInspectClimber?: (id: string) => void;
	countdown?: string;
	note?: string;
	back: {
		label: string;
		disabled?: boolean;
		onBack: () => void;
	};
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
	incidents,
	filing,
	rivals = [],
	openClimberId,
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
		},
	};
};
