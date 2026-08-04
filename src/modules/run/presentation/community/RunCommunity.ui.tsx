import { useState } from "react";

import { Avatar } from "~/domains/users/components/Avatar.component";
import type {
	CommunityOptionResult,
	CommunityStandout,
	CommunityVoter,
	RunCommunityPoll,
} from "~/modules/run/api/community.handlers";
import { Swatch } from "~/ui/Swatch.component";
import { categoryTheme } from "~/ui/theme/categoryTheme";
import { Tooltip } from "~/ui/Tooltip.component";
import { Paragraph } from "~/ui/typography/Paragraph.component";
import { Title } from "~/ui/typography/Title.component";

// The shared Avatar (photo or identity-colored initial) in a ring: cerulean
// marks the viewer, zinc separates overlapping chips. tabIndex makes the chip
// focusable so a mobile tap can reveal the tooltip.
const VoterAvatar = ({
	voter,
	focusable = false,
}: {
	voter: CommunityVoter;
	focusable?: boolean;
}) => (
	<span
		tabIndex={focusable ? 0 : undefined}
		className={`inline-flex cursor-default rounded-full ring-2 ${voter.you ? "ring-cerulean" : "ring-zinc-950"}`}
	>
		<Avatar
			user={{
				id: voter.id,
				displayName: voter.displayName,
				photoUrl: voter.photoUrl,
			}}
			size="sm"
			noTitle
		/>
	</span>
);

// The name lives in the chip's tooltip: hover on desktop, tap on mobile.
const VoterChip = ({ voter }: { voter: CommunityVoter }) => (
	<Tooltip compact content={voter.you ? "you" : voter.displayName}>
		<VoterAvatar voter={voter} focusable />
	</Tooltip>
);

// A standout names its winner outright — three rows earn the space the
// option chips save by hiding names.
const StandoutRow = ({ standout }: { standout: CommunityStandout }) => (
	<div className="flex items-center gap-2">
		<VoterAvatar voter={standout.voter} />
		<Paragraph
			as="span"
			tone={standout.voter.you ? "cerulean" : "default"}
			className="font-semibold"
		>
			{standout.voter.you ? "you" : standout.voter.displayName}
		</Paragraph>
		<Paragraph as="span" tone="muted" className="min-w-0 flex-1">
			{standout.title}
		</Paragraph>
		<Paragraph as="span" tone="saffron" className="font-bold tabular-nums">
			{standout.value}
		</Paragraph>
	</div>
);

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
				tone={option.isRight ? "celadon" : empty ? "faint" : "default"}
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

// Folded by default on phones (options are a tap away behind the question),
// open on anything sm and up. Checked once at mount — the board only renders
// client-side (behind a query), so matchMedia is safe; the guards keep jsdom
// and SSR on the open default.
const startsOpen = (): boolean =>
	typeof window === "undefined" ||
	typeof window.matchMedia !== "function" ||
	window.matchMedia("(min-width: 640px)").matches;

const PollSection = ({ poll }: { poll: RunCommunityPoll }) => {
	const [open, setOpen] = useState(startsOpen);

	// Skipped/linted: the poll may reappear in a later seed — reveal nothing,
	// not even the question (mirrors the handler's sealed detail).
	if (!poll.detail)
		return (
			<Paragraph tone="faint">
				Poll {poll.index + 1} · skipped — results stay sealed until you meet it
				again
			</Paragraph>
		);

	const rightPercent = Math.round(
		(poll.detail.gotItRightCount / poll.detail.answeredCount) * 100
	);

	return (
		<section
			{...(poll.category ? categoryTheme(poll.category) : {})}
			className="space-y-2"
		>
			<button
				type="button"
				onClick={() => setOpen((current) => !current)}
				className="flex w-full cursor-pointer items-center gap-2 text-left"
			>
				{poll.category && <Swatch size="sm" />}
				{/* extrabold, not bold: JetBrains Mono ships 400/500/700/800 — the
				    options' semibold already renders at 700, so 800 is the only
				    weight that visibly separates the question. */}
				<Paragraph as="span" className="min-w-0 font-extrabold">
					{poll.question}
				</Paragraph>
				{poll.detail.answerType === "multiple" && (
					<Paragraph as="span" tone="faint">
						multi
					</Paragraph>
				)}
				<span className="flex-1" />
				{!open && (
					<Paragraph as="span" tone="muted" className="shrink-0">
						<Paragraph as="span" tone="celadon">
							{rightPercent}%
						</Paragraph>{" "}
						had it correct
					</Paragraph>
				)}
				<span aria-hidden className="text-xs text-zinc-500">
					{open ? "▾" : "▸"}
				</span>
			</button>
			{open && (
				<ul className="space-y-1">
					{poll.detail.options.map((option) => (
						<OptionRow key={option.label} option={option} />
					))}
				</ul>
			)}
		</section>
	);
};

export type RunCommunityBoardProps = {
	totalPlayers: number;
	topPercent: number | null;
	standouts: CommunityStandout[];
	polls: RunCommunityPoll[];
};

export const RunCommunityBoard = ({
	totalPlayers,
	topPercent,
	standouts,
	polls,
}: RunCommunityBoardProps) => (
	<section className="space-y-5">
		<header className="flex flex-wrap items-baseline justify-between gap-2">
			<Title as="h2">Community</Title>
			<Paragraph as="span" tone="muted">
				{totalPlayers} player{totalPlayers === 1 ? "" : "s"} answered today
			</Paragraph>
		</header>

		{polls.map((poll) => (
			<PollSection key={poll.pollId} poll={poll} />
		))}

		{standouts.length > 0 && (
			<section className="space-y-2">
				<Paragraph tone="faint">standouts today</Paragraph>
				{standouts.map((standout) => (
					<StandoutRow key={standout.title} standout={standout} />
				))}
			</section>
		)}

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
