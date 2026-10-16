import { Button } from "~/ui/kanto-theme/Button.ui";
import { ClimberStack, type ClimberProps } from "./Climber.ui";
import type { KantoColor } from "~/ui/kanto-theme/colors";
import { CodeText } from "~/ui/kanto-theme/CodeText.ui";
import { Icon, type IconName } from "~/ui/kanto-theme/Icon.ui";
import { Panel } from "~/ui/kanto-theme/Panel.ui";
import { Typography } from "~/ui/kanto-theme/Typography.ui";

const CARDS = "flex flex-col gap-3 px-4 py-4";
const CARD =
	"grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 rounded-xl border border-edge bg-surface px-4 py-4";
const TILE =
	"flex size-12 shrink-0 items-center justify-center rounded-lg bg-theme-dim text-theme-soft";
const TILE_ICON = "size-6";
const STORY = "flex min-w-0 flex-col gap-1.5";
const CAPTION = "text-sm font-bold text-theme-soft";
const QUESTION = "line-clamp-2";
const GOT_IT = "flex items-center gap-2 text-sm text-theme-muted";
const FIGURE = "flex flex-col items-end";
const SHARE = "text-2xl font-extrabold tabular-nums text-theme-soft";
const EMPTY = "px-4 py-4";
const GOT_IT_FACES = 3;

export const COPY = {
	gotIt: "got it",
	hardest: "tripped up most players",
	easiest: "almost everyone nailed it",
} as const;

export type SpotlightKind = "hardest" | "easiest";

const KIND = {
	hardest: { icon: "flame", caption: COPY.hardest, color: "cinnabar" },
	easiest: { icon: "target", caption: COPY.easiest, color: "viridian" },
} as const satisfies Record<
	SpotlightKind,
	{ icon: IconName; caption: string; color: KantoColor }
>;

export type SpotlightPoll = {
	kind: SpotlightKind;
	question: string;
	rightShare: number;
	gotIt: readonly ClimberProps[];
};

export type PollSpotlightProps = {
	title: string;
	spotlights: readonly SpotlightPoll[];
	empty?: string;
	review?: { label: string; onReview: () => void };
};

const SpotlightCard = ({
	kind,
	question,
	rightShare,
	gotIt,
}: SpotlightPoll) => {
	const { icon, caption, color } = KIND[kind];

	return (
		<article data-screen-theme={color} className={CARD}>
			<span className={TILE}>
				<Icon name={icon} className={TILE_ICON} />
			</span>
			<span className={STORY}>
				<span className={CAPTION}>{caption}</span>
				<span className={QUESTION}>
					<Typography variant="caption" as="span">
						<CodeText text={question} />
					</Typography>
				</span>
				{gotIt.length === 0 ? null : (
					<span className={GOT_IT}>
						<ClimberStack climbers={gotIt} shown={GOT_IT_FACES} />
						{COPY.gotIt}
					</span>
				)}
			</span>
			<span className={FIGURE}>
				<span className={SHARE}>{`${rightShare}%`}</span>
				<Typography variant="hint" as="span">
					{COPY.gotIt}
				</Typography>
			</span>
		</article>
	);
};

export const PollSpotlight = ({
	title,
	spotlights,
	empty,
	review,
}: PollSpotlightProps) => (
	<Panel>
		<Panel.Header label={title} />
		{spotlights.length === 0 ? (
			<div className={EMPTY}>
				<Typography variant="hint">{empty}</Typography>
			</div>
		) : (
			<div className={CARDS}>
				{spotlights.map((poll) => (
					<SpotlightCard key={poll.kind} {...poll} />
				))}
			</div>
		)}
		{review === undefined ? null : (
			<Panel.Footer>
				<Button
					tone="primary"
					size="sm"
					label={review.label}
					onPress={review.onReview}
				/>
			</Panel.Footer>
		)}
	</Panel>
);
