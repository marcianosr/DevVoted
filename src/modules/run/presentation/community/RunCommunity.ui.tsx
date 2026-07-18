import { useState } from "react";

import type {
	CommunityVoter,
	RunCommunityPoll,
	RunCommunityPollDetail,
} from "~/modules/run/api/community.handlers";
import { OutcomeTile, outcomeText } from "../poll/OutcomeTile.ui";

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
		<span className={tone === "viridian" ? "text-viridian" : "text-cinnabar"}>
			{label}
		</span>
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
		<div className="flex justify-between text-sm text-zinc-400">
			<span>{detail.agreedPercent}% picked what you picked</span>
			<span>{detail.gotItRightPercent}% got it right</span>
		</div>
	</div>
);

const ExpandedPoll = ({ poll }: { poll: RunCommunityPoll }) => {
	if (!poll.detail) return null;
	return (
		<div className="space-y-5 rounded-md border border-zinc-700 bg-zinc-900/60 p-6 font-mono">
			<div className="flex items-baseline justify-between gap-4">
				<h3 className={`text-lg ${outcomeText({ outcome: poll.outcome })}`}>
					Poll {poll.index + 1} — expanded
				</h3>
				<span className="text-sm text-zinc-500">{poll.question}</span>
			</div>
			<div className="space-y-1">
				<p className="text-zinc-100">
					You picked: “{poll.detail.yourPickLabels.join("”, “")}”
				</p>
				<p className="text-viridian">
					Correct: “{poll.detail.correctLabels.join("”, “")}”
				</p>
			</div>
			<AgreementBar detail={poll.detail} />
			<div className="space-y-3">
				<p className="text-sm text-zinc-500">Who picked what</p>
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
			<header className="space-y-1 font-mono">
				<h2 className="text-3xl text-zinc-50">How you compared</h2>
				<p className="text-zinc-400">
					{totalPlayers} player{totalPlayers === 1 ? "" : "s"} climbed today
				</p>
			</header>

			<div className="flex flex-wrap gap-4">
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
				<footer className="font-mono text-zinc-400">
					top <span className="text-cerulean">{topPercent}%</span> of players
					today
				</footer>
			)}
		</section>
	);
};
