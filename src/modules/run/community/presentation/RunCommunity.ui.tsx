import { useState } from "react";

import type {
	CommunityOptionResult,
	RunCommunityPoll,
} from "~/modules/run/community/application/community.service";
import { Disclosure } from "~/ui/Disclosure.ui";
import { FoldCaret } from "~/ui/FoldCaret.ui";
import { Paragraph } from "~/ui/typography/Paragraph.component";
import type { TextTone } from "~/ui/typography/textTone";
import { Title } from "~/ui/typography/Title.component";

import { VoterChip } from "~/modules/run/community/presentation/Voter.ui";

/**
 * How the crowd found this poll, in the three tones the test-runner badge
 * already uses: most got it, it split the room, it ate the room. The number on
 * its own is a fact you have to stop and rank; the colour ranks it for you while
 * you are still reading the question.
 */
const CROWD_EASY_PERCENT = 60;
const CROWD_MIXED_PERCENT = 40;

const crowdTone = (percent: number): TextTone => {
	if (percent >= CROWD_EASY_PERCENT) return "celadon";
	return percent >= CROWD_MIXED_PERCENT ? "saffron" : "vermillion";
};

// One line per option, so a 10-answer poll stays scannable: mark, label,
// then the voter chips and count on the right where a percentage would sit.
const OptionRow = ({ option }: { option: CommunityOptionResult }) => {
	const empty = option.count === 0;
	return (
		<li className={`flex items-center gap-2 ${empty ? "opacity-50" : ""}`}>
			<span
				aria-hidden
				className={`w-3 text-center text-xs ${option.isRight ? "text-celadon" : "text-zinc-600"}`}
			>
				{option.isRight ? "✓" : "·"}
			</span>
			<Paragraph
				as="span"
				tone={option.isRight ? "celadon" : empty ? "muted" : "default"}
				className="min-w-0 flex-1 font-semibold"
			>
				{option.label}
			</Paragraph>
			<span className="flex items-center -space-x-1">
				{option.voters.map((voter) => (
					<VoterChip key={voter.id} voter={voter} />
				))}
			</span>
			<Paragraph
				as="span"
				tone={option.isRight ? "celadon" : "default"}
				className="font-bold tabular-nums"
			>
				{option.count}
			</Paragraph>
		</li>
	);
};

/**
 * The two options the poll was actually about: the right answer, and whatever
 * you handed in. Same split the gate review draws as Expected over Received —
 * here the crowd fills in the rest, but the pair you came to compare is the
 * same pair, and on a nine-option poll it is two lines instead of nine.
 */
const tookPart = (option: CommunityOptionResult): boolean =>
	option.isRight || option.yours;

const tailSummary = (tail: readonly CommunityOptionResult[]): string => {
	const votes = tail.reduce((sum, option) => sum + option.count, 0);
	const options = `${tail.length} other option${tail.length === 1 ? "" : "s"}`;
	// A tail nobody touched should not advertise a count of nothing.
	if (votes === 0) return options;
	return `${options}, ${votes} vote${votes === 1 ? "" : "s"}`;
};

// Folded by default on phones (options are a tap away behind the question),
// open on anything sm and up. Checked once at mount — the board only renders
// client-side (behind a query), so matchMedia is safe; the guards keep jsdom
// and SSR on the open default.
const startsOpen = (): boolean =>
	typeof window === "undefined" ||
	typeof window.matchMedia !== "function" ||
	window.matchMedia("(min-width: 640px)").matches;

const PollSection = ({ poll }: { poll: RunCommunityPoll }) => {
	const [defaultOpen] = useState(startsOpen);

	// Skipped/linted: the poll may reappear in a later seed — reveal nothing,
	// not even the question (mirrors the handler's sealed detail).
	if (!poll.detail)
		return (
			<Paragraph tone="muted">
				Poll {poll.index + 1} · skipped — results stay sealed until you meet it
				again
			</Paragraph>
		);

	const rightPercent = Math.round(
		(poll.detail.gotItRightCount / poll.detail.answeredCount) * 100
	);
	const involved = poll.detail.options.filter(tookPart);
	const tail = poll.detail.options.filter((option) => !tookPart(option));

	return (
		<details className="group" open={defaultOpen}>
			<summary className="flex cursor-pointer list-none items-baseline gap-3 rounded [&::-webkit-details-marker]:hidden">
				{/* extrabold, not bold: JetBrains Mono ships 400/500/700/800 — the
				    options' semibold already renders at 700, so 800 is the only
				    weight that visibly separates the question. */}
				<Paragraph as="span" className="min-w-0 flex-1 font-extrabold">
					{poll.question}
					{poll.detail.answerType === "multiple" && (
						<Paragraph as="span" tone="muted" className="block font-normal">
							Multiple choice
						</Paragraph>
					)}
				</Paragraph>
				{/* Open or shut: the percentage is the row's headline, not a
				    consolation for having folded it away. */}
				<Paragraph
					as="span"
					tone={crowdTone(rightPercent)}
					className="shrink-0 tabular-nums"
				>
					{rightPercent}% correct
				</Paragraph>
				<FoldCaret />
			</summary>

			{/* The rule is the gutter: it ties every option line to the question it
			    belongs to, which is the only structure a page of stacked polls has. */}
			<div className="mt-2 space-y-2 border-l border-edge pl-4">
				<ul className="space-y-1">
					{involved.map((option) => (
						<OptionRow key={option.label} option={option} />
					))}
				</ul>
				{tail.length > 0 && (
					<Disclosure summary={tailSummary(tail)}>
						<ul className="space-y-1">
							{tail.map((option) => (
								<OptionRow key={option.label} option={option} />
							))}
						</ul>
					</Disclosure>
				)}
			</div>
		</details>
	);
};

export type RunCommunityBoardProps = {
	totalPlayers: number;
	topPercent: number | null;
	polls: RunCommunityPoll[];
};

export const RunCommunityBoard = ({
	totalPlayers,
	topPercent,
	polls,
}: RunCommunityBoardProps) => (
	<section className="space-y-5">
		<header className="flex flex-wrap items-baseline justify-between gap-2">
			<Title as="h2">Today’s polls</Title>
			<Paragraph as="span" tone="muted">
				{totalPlayers} player{totalPlayers === 1 ? "" : "s"} answered
			</Paragraph>
		</header>

		{polls.map((poll) => (
			<PollSection key={poll.pollId} poll={poll} />
		))}

		{topPercent !== null && (
			<Paragraph as="footer" tone="muted">
				top{" "}
				<Paragraph as="span" tone="cerulean">
					{topPercent}%
				</Paragraph>{" "}
				of players today
			</Paragraph>
		)}
	</section>
);
