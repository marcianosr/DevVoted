import { NOTHING_TO_COMPARE_YET } from "~/shared/lib/copy";

import type { CategoryCode } from "~/shared/lib/categories";
import { getCategoryMetadata } from "~/shared/lib/categories";
import { plural } from "~/shared/lib/displayValue";

import type {
	RunCommunityPoll,
	RunCommunityView,
} from "~/modules/run/community/application/community.service";
import type { CommunityVoter } from "~/modules/run/community/domain/voter.model";
import type { CategorySeat } from "~/modules/run/run/domain/categoryLeader.model";
import { categoryLeaderRowFor } from "~/modules/run/run/application/categoryLeader.viewmodel";
import { ladderSummaryFor } from "~/modules/run/community/application/climbLadder.viewmodel";
import type { GateSwatch } from "~/modules/run/gate/domain/swatch.model";
import { SLICE_WINDOW } from "~/modules/run/run/domain/rules.model";
import {
	CommunityScreen,
	type CommunityScreenProps,
} from "~/ui/kanto-theme/CommunityScreen.ui";
import type { ClimberProps } from "~/ui/kanto-theme/Climber.ui";
import type { IncidentsPanelProps } from "~/ui/kanto-theme/IncidentsPanel.ui";
import type { PollResultProps } from "~/ui/kanto-theme/PollResult.ui";

const LETTERS = "ABCDEFGH";

const COPY = {
	climbTitle: "Your climb",
	noRun: "no run on the map",
	turnoutTitle: "Who showed up",
	answeredToday: "answered today",
	mapTitle: "Where everyone is",
	noPlace: "start a run to place yourself",
	leadersTitle: "Category leaders",
	leadersSummary: "longest run of correct answers · all-time",
	seatsChangeHands: "A seat changes hands when somebody beats it.",
	pollsTitle: "The day’s polls",
	notDealtYet: "Not dealt yet",
	countdownHint: "until the next five polls are dealt",
	pollsOpen: "polls are open",
	standing: "your standing today",
	whereYouStand: "where your run stands",
} as const;

const climberOf = (voter: CommunityVoter): ClimberProps => ({
	name: voter.displayName,
	photoUrl: voter.photoUrl ?? undefined,
	borderUrl: voter.borderUrl ?? undefined,
	you: voter.you,
});

const SEATED = (held: number, total: number) => `${held} of ${total} seated`;

/**
 * The board's own line under the seats. It states how a seat moves, because the
 * figure is an all-time best: missing never costs the holder their seat, only
 * somebody going further does.
 */
export const seatsFooterFor = (seats: readonly CategorySeat[]): string => {
	const open = seats.filter(({ leader }) => leader === undefined).length;
	if (open === 0) return COPY.seatsChangeHands;

	return `${COPY.seatsChangeHands} ${plural(open, "seat")} still open.`;
};

export const leadersFor = (
	seats: readonly CategorySeat[]
): CommunityScreenProps["leaders"] => ({
	title: COPY.leadersTitle,
	summary: COPY.leadersSummary,
	seated: SEATED(
		seats.filter(({ leader }) => leader !== undefined).length,
		seats.length
	),
	seats: seats.map(categoryLeaderRowFor),
	footer: seatsFooterFor(seats),
});

const categoryNameOf = (category: CategoryCode | null): string =>
	category === null ? "Poll" : getCategoryMetadata(category).name;

export const defaultOpenIndex = (
	polls: readonly RunCommunityPoll[]
): number | undefined =>
	polls.filter((poll) => poll.detail !== null).at(-1)?.index;

/**
 * Always five rows: the day's window is fixed, so a poll the seed has not dealt
 * yet still reads as a slot rather than as absence.
 */
export const pollResultsFor = (
	polls: readonly RunCommunityPoll[]
): PollResultProps[] => {
	if (polls.length === 0) return [];
	const openAt = defaultOpenIndex(polls);

	return Array.from({ length: SLICE_WINDOW }, (_, index): PollResultProps => {
		const poll = polls.find((entry) => entry.index === index);
		if (poll === undefined)
			return { state: "sealed", index, question: COPY.notDealtYet };
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

const rightShareToday = (polls: readonly RunCommunityPoll[]): string => {
	const revealed = polls.filter((poll) => poll.detail !== null);
	if (revealed.length === 0) return "0% right today";
	const right = revealed.filter((poll) => poll.outcome === "correct").length;
	return `${Math.round((right / revealed.length) * 100)}% right today`;
};

const standingOf = (climb: RunCommunityView["climb"]): string => {
	const you = climb?.climbers.find((climber) => climber.you);
	if (you === undefined) return COPY.noRun;
	return `gate ${you.gate} · poll ${you.pollsIntoGate + 1}`;
};

export type CommunityViewProps = {
	view: RunCommunityView;
	swatch: GateSwatch;
	countdown?: string;
	/** Overrides the climb note — the pending and error boards state their own. */
	note?: string;
	back: {
		label: string;
		disabled?: boolean;
		hint?: string;
		onBack: () => void;
	};
	/** Today's audits, everyone's (ADR-099). Absent until the feed has read. */
	incidents?: IncidentsPanelProps;
};

export const communityScreenPropsFor = ({
	view,
	swatch,
	countdown,
	note,
	back,
	incidents,
}: CommunityViewProps): CommunityScreenProps => {
	const empty = view.polls.length === 0;

	return {
		header: {
			swatch,
			title: `${swatch.gateName} · today’s climb`,
			subtitle: back.hint ?? view.date,
			countdown: countdown ?? COPY.pollsOpen,
			countdownColor: countdown === undefined ? "viridian" : undefined,
			countdownHint: COPY.countdownHint,
			stats: [
				{
					icon: "community",
					label: plural(view.totalPlayers, "player"),
					hint: COPY.answeredToday,
				},
				...(view.topPercent === null
					? []
					: [
							{
								icon: "review" as const,
								label: `top ${view.topPercent}%`,
								hint: COPY.standing,
							},
						]),
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
		climb: {
			title: COPY.climbTitle,
			standing: standingOf(view.climb),
			...(view.topPercent === null
				? {}
				: {
						badge: `top ${view.topPercent}%`,
						badgeColor: "viridian" as const,
					}),
			reading: rightShareToday(view.polls),
			note: note ?? (empty ? NOTHING_TO_COMPARE_YET : undefined),
		},
		turnout: {
			title: COPY.turnoutTitle,
			when: view.date,
			bands: [
				{
					label: COPY.answeredToday,
					count: String(view.totalPlayers),
					color: "cerulean",
					climbers: [],
				},
			],
		},
		map: {
			title: COPY.mapTitle,
			summary: ladderSummaryFor(view.climb) ?? COPY.noPlace,
		},
		...(incidents === undefined ? {} : { incidents }),
		leaders: leadersFor(view.leaders),
		polls: {
			title: COPY.pollsTitle,
			summary: `${plural(view.totalPlayers, "player")} answered`,
			polls: pollResultsFor(view.polls),
		},
	};
};

export const CommunityView = (props: CommunityViewProps) => (
	<CommunityScreen {...communityScreenPropsFor(props)} />
);
