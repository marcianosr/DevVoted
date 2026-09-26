import { useState } from "react";

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
import { ladderFor } from "~/modules/run/community/application/climbLadder.viewmodel";
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

export type CommunityViewProps = {
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
		hint?: string;
		onBack: () => void;
	};
	incidents?: IncidentsPanelProps;
};

export const communityScreenPropsFor = ({
	view,
	swatch,
	countdown,
	note,
	back,
	incidents,
	rivals = [],
	openClimberId,
	onInspectClimber,
}: CommunityViewProps): CommunityScreenProps => {
	const empty = view.polls.length === 0;
	const dayNote = note ?? (empty ? NOTHING_TO_COMPARE_YET : undefined);

	return {
		header: {
			swatch,
			title: `${swatch.gateName} · today’s climb`,
			subtitle: dayNote ?? back.hint ?? view.date,
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
			...(view.climb === null
				? { empty: COPY.noPlace }
				: {
						track: {
							gates: ladderFor(view.climb, rivals),
							...(openClimberId === undefined ? {} : { openId: openClimberId }),
							...(onInspectClimber === undefined
								? {}
								: { onInspect: onInspectClimber }),
						},
					}),
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

export const CommunityView = (props: CommunityViewProps) => {
	const [openClimberId, setOpenClimberId] = useState<string>();

	return (
		<CommunityScreen
			{...communityScreenPropsFor({
				...props,
				openClimberId,
				onInspectClimber: (id) =>
					setOpenClimberId((current) => (current === id ? undefined : id)),
			})}
		/>
	);
};
