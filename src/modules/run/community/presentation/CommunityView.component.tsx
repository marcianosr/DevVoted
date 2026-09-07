import { useState } from "react";

import type { CategoryCode } from "~/shared/lib/categories";
import { getCategoryMetadata } from "~/shared/lib/categories";
import {
	formatCount,
	formatDuration,
	formatPercent,
} from "~/shared/lib/displayValue";

import type {
	ClimbTodayView,
	RunCommunityPoll,
	RunCommunityView,
} from "~/modules/run/community/application/community.service";
import type { CommunityStandout } from "~/modules/run/community/domain/standouts.model";
import {
	gateOf,
	trackPosition,
} from "~/modules/run/community/domain/climbMap.model";
import {
	ALL_SWATCHES,
	type SwatchTheme,
} from "~/modules/run/gate/domain/swatch.model";
import { SLICE_WINDOW } from "~/modules/run/run/domain/rules.model";
import {
	CommunityScreen,
	type CommunityPollDetail,
	type PollChip,
	type StandoutEntry,
} from "~/ui/terminal-theme/screens/CommunityScreen.ui";
import type {
	TrackClimber,
	TrackGate,
} from "~/ui/terminal-theme/ClimbTrack.ui";

const LETTERS = "ABCDEFGH";

const detailOf = (value: CommunityStandout["value"]): string => {
	if (value.unit === "duration") return formatDuration(value);
	if (value.unit === "percent") return formatPercent(value);
	if (value.unit === "count") return formatCount(value);
	if (value.unit === "configs")
		return `${value.amount} config${value.amount === 1 ? "" : "s"}`;
	return value.text;
};

export const standoutEntriesFor = (
	standouts: readonly CommunityStandout[]
): StandoutEntry[] =>
	standouts.map((standout) => ({
		title: standout.title,
		avatar: {
			name: standout.voter.displayName,
			photoUrl: standout.voter.photoUrl ?? undefined,
			borderUrl: standout.voter.borderUrl ?? undefined,
			you: standout.voter.you,
		},
		detail: detailOf(standout.value),
		swatch: standout.swatch,
	}));

export const pollChipsFor = (polls: readonly RunCommunityPoll[]): PollChip[] =>
	Array.from({ length: SLICE_WINDOW }, (_, index) => {
		const poll = polls.find((entry) => entry.index === index);
		if (poll === undefined)
			return { id: `ahead-${index}`, label: `${index + 1}`, disabled: true };
		return {
			id: String(poll.pollId),
			label: `${index + 1}`,
			disabled: poll.detail === null,
		};
	});

const categoryNameOf = (category: CategoryCode | null): string =>
	category === null ? "Poll" : getCategoryMetadata(category).name;

export const pollDetailFor = (
	poll: RunCommunityPoll
): CommunityPollDetail | undefined => {
	if (poll.detail === null) return undefined;
	const { answerType, answeredCount, gotItRightCount, options } = poll.detail;
	return {
		category: categoryNameOf(poll.category),
		rightShare: `${Math.round((gotItRightCount / answeredCount) * 100)}% got it`,
		question: poll.question,
		multiple: answerType === "multiple",
		rows: options.map((option, index) => ({
			letter: LETTERS[index] ?? "?",
			label: option.label,
			percent: option.percent,
			right: option.isRight,
			yours: option.yours,
		})),
	};
};

const byDepthThenId = (
	a: { pollsIntoGate: number; id: string },
	b: { pollsIntoGate: number; id: string }
): number => b.pollsIntoGate - a.pollsIntoGate || a.id.localeCompare(b.id);

export const ladderFor = (climb: ClimbTodayView): TrackGate[] => {
	const you = climb.climbers.find((climber) => climber.you);
	const chartedTo = Math.max(
		you === undefined ? 0 : trackPosition(you),
		climb.bestPosition ?? 0
	);
	const bestGate =
		climb.bestPosition === null ? null : gateOf(climb.bestPosition);

	return ALL_SWATCHES.map((swatch) => ({
		gate: swatch.gate,
		name: swatch.gateName,
		theme: swatch.theme,
		finish: swatch.finish,
		current: you?.gate === swatch.gate,
		uncharted: swatch.gate * SLICE_WINDOW > chartedTo,
		best: bestGate === swatch.gate,
		climbers: [...climb.climbers]
			.filter((climber) => climber.gate === swatch.gate)
			.sort(byDepthThenId)
			.map((climber): TrackClimber => ({
				id: climber.id,
				name: climber.displayName,
				photoUrl: climber.photoUrl ?? undefined,
				borderUrl: climber.borderUrl ?? undefined,
				you: climber.you,
			})),
		fallen: [...climb.fallen]
			.filter((fallen) => fallen.gate === swatch.gate)
			.sort(byDepthThenId)
			.map((fallen) => ({
				id: fallen.id,
				name: fallen.displayName,
				photoUrl: fallen.photoUrl ?? undefined,
				borderUrl: fallen.borderUrl ?? undefined,
				you: false,
				runKey: String(fallen.runId),
			})),
	}));
};

export const defaultChipId = (
	polls: readonly RunCommunityPoll[]
): string | undefined => {
	const lastOpen = polls.filter((poll) => poll.detail !== null).at(-1);
	return lastOpen === undefined ? undefined : String(lastOpen.pollId);
};

const NOTHING_YET = "Nothing to see yet — answer some of today's polls first.";
const SEALED = "Sealed — this poll may come back in a later seed.";

export type CommunityViewProps = {
	view: RunCommunityView;
	theme?: SwatchTheme;
	countdown?: string;
	back: {
		label: string;
		disabled?: boolean;
		hint?: string;
		onBack: () => void;
	};
};

export const CommunityView = ({
	view,
	theme,
	countdown,
	back,
}: CommunityViewProps) => {
	const [chosen, setChosen] = useState<string | null>(null);
	const selected = chosen ?? defaultChipId(view.polls);
	const selectedPoll = view.polls.find(
		(poll) => String(poll.pollId) === selected
	);
	const detail =
		selectedPoll === undefined ? undefined : pollDetailFor(selectedPoll);

	return (
		<CommunityScreen
			theme={theme}
			standouts={standoutEntriesFor(view.standouts)}
			pollChips={view.polls.length === 0 ? [] : pollChipsFor(view.polls)}
			selectedChipId={selected}
			onSelectPoll={setChosen}
			poll={detail}
			pollNote={view.polls.length === 0 ? NOTHING_YET : SEALED}
			totalPlayers={view.polls.length === 0 ? undefined : view.totalPlayers}
			climb={view.climb === null ? undefined : { gates: ladderFor(view.climb) }}
			topPercent={view.topPercent ?? undefined}
			countdown={countdown}
			back={back}
		/>
	);
};
