import type { CommunityStandout } from "~/modules/run/api/community.handlers";
import { SwatchMark } from "~/ui/SwatchMark.component";
import { swatchTheme } from "~/ui/theme/swatchTheme";
import { Paragraph } from "~/ui/typography/Paragraph.component";
import { Title } from "~/ui/typography/Title.component";

import { VoterChip } from "./Voter.ui";

/**
 * Your haul, beside the heading rather than on a row of its own — a line saying
 * "you won three of these" would be longer than a row of the things themselves.
 *
 * Numerals, not words: the list runs to nine now, and spelling only the small
 * numbers produced "you took three of 9".
 */
const standoutSummary = (standouts: CommunityStandout[]): string | null => {
	const yours = standouts.filter((standout) => standout.voter.you).length;
	if (yours === 0) return null;
	if (yours < standouts.length)
		return `you took ${yours} of ${standouts.length}`;
	return standouts.length === 1 ? "you took it" : `you took all ${yours}`;
};

/**
 * The avatar carries the winner the same way it does on an option row: ringed
 * cerulean when it is you, named on hover otherwise. Spelling the name out here
 * would make every row "Gary Oak fastest answer 9s", when the value is the point.
 */
const StandoutRow = ({ standout }: { standout: CommunityStandout }) => (
	<div className="flex items-center gap-3 py-1">
		<VoterChip voter={standout.voter} />
		<Paragraph as="span" className="min-w-0 flex-1 truncate">
			{standout.title}
		</Paragraph>
		<span className="flex shrink-0 items-center gap-1.5">
			{standout.swatch && (
				<span {...swatchTheme(standout.swatch.theme)}>
					<SwatchMark finish={standout.swatch.finish} size="sm" />
				</span>
			)}
			<Paragraph as="span" tone="saffron" className="font-bold tabular-nums">
				{standout.value}
			</Paragraph>
		</span>
	</div>
);

export type StandoutsPanelProps = {
	standouts: CommunityStandout[];
};

/**
 * The day's awards, leading the page. Two columns on anything wide enough, laid
 * out with CSS columns rather than a grid: columns fill top-to-bottom, so the
 * order the handler emits — today's awards, then the climb's — becomes the split
 * down the middle, without having to know how many of each survived.
 */
export const StandoutsPanel = ({ standouts }: StandoutsPanelProps) => {
	if (standouts.length === 0) return null;
	const summary = standoutSummary(standouts);

	return (
		<section className="space-y-3">
			<header className="flex flex-wrap items-baseline justify-between gap-2">
				<Title as="h2">Standouts today</Title>
				{summary && (
					<Paragraph as="span" tone="muted">
						{summary}
					</Paragraph>
				)}
			</header>

			<div className="gap-x-10 sm:columns-2">
				{standouts.map((standout) => (
					<div key={standout.title} className="break-inside-avoid">
						<StandoutRow standout={standout} />
					</div>
				))}
			</div>
		</section>
	);
};
