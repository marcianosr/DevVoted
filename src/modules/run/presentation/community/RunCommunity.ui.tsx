import { useState } from "react";

import type {
	CommunityVoter,
	RunCommunityPoll,
	RunCommunityPollDetail,
} from "~/modules/run/api/community.handlers";
import { Paragraph } from "~/ui/typography/Paragraph.component";
import { Title } from "~/ui/typography/Title.component";
import { OutcomeTile, outcomeText } from "../poll/OutcomeTile.ui";
import { PollOptionReview } from "../poll/PollOptionReview.ui";

const tileSubtitle = (poll: RunCommunityPoll): string => {
	if (poll.outcome === "correct")
		return `${poll.detail?.agreedPercent}% agreed`;
	if (poll.outcome === "partial") return "partial";
	if (poll.outcome === "wrong") return "failed";
	return "missed";
};

const AVATAR_TONES = [
	"bg-cerulean",
	"bg-fuchsia",
	"bg-saffron text-indigo-950",
	"bg-viridian",
	"bg-vermillion",
	"bg-lavender text-indigo-950",
];

const initialsOf = (displayName: string): string =>
	displayName
		.split(/\s+/)
		.map((part) => part[0])
		.join("")
		.slice(0, 2)
		.toLowerCase();

/** All voters in one row, deliberately untruncated — the player base is small. */
const VoterRow = ({
	voters,
	label,
	tone,
}: {
	voters: CommunityVoter[];
	label: string;
	tone: "viridian" | "cinnabar";
}) => (
	<div className="flex items-center gap-3">
		<div className="flex -space-x-1">
			{voters.map((voter, index) => (
				<span
					key={voter.id}
					title={voter.displayName}
					className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs text-white ring-2 ring-zinc-950 ${AVATAR_TONES[index % AVATAR_TONES.length]}`}
				>
					{initialsOf(voter.displayName)}
				</span>
			))}
		</div>
		<Paragraph as="span" size="sm" tone={tone}>
			{label}
		</Paragraph>
	</div>
);

const AgreementBar = ({ detail }: { detail: RunCommunityPollDetail }) => (
	<div className="space-y-2">
		<div className="flex h-2 overflow-hidden rounded-full bg-zinc-800">
			<div
				className="bg-cinnabar/80"
				style={{ width: `${detail.agreedPercent}%` }}
			/>
			<div
				className="bg-viridian/80"
				style={{ width: `${detail.gotItRightPercent}%` }}
			/>
		</div>
		<div className="flex justify-between">
			<Paragraph as="span" size="sm" tone="muted">
				{detail.agreedPercent}% picked what you picked
			</Paragraph>
			<Paragraph as="span" size="sm" tone="muted">
				{detail.gotItRightPercent}% got it right
			</Paragraph>
		</div>
	</div>
);

const ExpandedPoll = ({ poll }: { poll: RunCommunityPoll }) => {
	if (!poll.detail || poll.outcome === "missed") return null;
	return (
		<div className="space-y-5 rounded-md border border-zinc-700 bg-zinc-900/60 p-6">
			<div className="flex items-baseline justify-between gap-4">
				<Title as="h3">
					<span className={outcomeText({ outcome: poll.outcome })}>
						Poll {poll.index + 1}
					</span>
				</Title>
				<Paragraph as="span" size="sm" tone="muted">
					{poll.question}
				</Paragraph>
			</div>
			<PollOptionReview
				options={poll.detail.optionLabels}
				picked={poll.detail.yourPickLabels}
				correct={poll.detail.correctLabels}
				answerType={poll.detail.answerType}
				outcome={poll.outcome}
			/>
			<AgreementBar detail={poll.detail} />
			<div className="space-y-3">
				<Paragraph size="sm" tone="muted">
					Who picked what
				</Paragraph>
				<VoterRow
					voters={poll.detail.gotItRightVoters}
					label="got it right"
					tone="viridian"
				/>
				<VoterRow
					voters={poll.detail.pickedYoursVoters}
					label="picked what you picked (incl. you)"
					tone="cinnabar"
				/>
			</div>
		</div>
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
}: RunCommunityBoardProps) => {
	const [expandedPollId, setExpandedPollId] = useState<number | null>(null);
	const expanded = polls.find((poll) => poll.pollId === expandedPollId);

	return (
		<section className="space-y-8">
			<header className="space-y-1">
				<Title as="h2">How you compared</Title>
				<Paragraph size="sm" tone="muted">
					{totalPlayers} player{totalPlayers === 1 ? "" : "s"} climbed today
				</Paragraph>
			</header>

			<div className="grid grid-cols-5 gap-2">
				{polls.map((poll) => (
					<OutcomeTile
						key={poll.pollId}
						title={`Poll ${poll.index + 1}`}
						subtitle={tileSubtitle(poll)}
						outcome={poll.outcome}
						expanded={expandedPollId === poll.pollId}
						disabled={poll.outcome === "missed"}
						onClick={() =>
							setExpandedPollId(
								expandedPollId === poll.pollId ? null : poll.pollId
							)
						}
					/>
				))}
			</div>

			{expanded && <ExpandedPoll poll={expanded} />}

			{topPercent !== null && (
				<Paragraph as="footer" size="sm" tone="muted">
					top <span className="text-cerulean">{topPercent}%</span> of players
					today
				</Paragraph>
			)}
		</section>
	);
};
