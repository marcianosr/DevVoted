import { clsx } from "clsx";

import { Badge } from "./Badge.ui";
import { Button, type ButtonTone, type IconPlacement } from "./Button.ui";
import type { KantoColor } from "./colors";
import type { IconName } from "./Icon.ui";
import { Panel } from "./Panel.ui";
import type { SwatchFill } from "./Swatch.ui";
import { SwatchChip } from "./SwatchChip.ui";
import { Typography } from "./Typography.ui";

const FOOTER = "flex w-full flex-col gap-3";
const FOOTER_RULE = "border-t border-theme-faint pt-4";
const STAKE_ROW = "flex w-full flex-wrap items-center justify-end gap-4";
const ACTION_ROW = "flex w-full flex-wrap items-center gap-3";
const STAKE = "flex flex-wrap items-center gap-2";
const FIGURES = "flex flex-wrap items-center gap-2";
const ASIDE = "shrink-0";
const ACTION = "shrink-0 sm:ml-auto";
/**
 * Between the buttons once there is room, on its own line below them before
 * that. It is the only thing in the row that can give, and squeezing it is what
 * collapsed it to one word per line on a phone — so it drops instead, and the
 * buttons stay side by side at every width.
 */
const ROW_NOTE =
	"order-last w-full min-w-0 text-center sm:order-none sm:w-auto sm:flex-1";

const ACTION_SIZE = "md";

const LIVE_TONE: ButtonTone = "action";
const REFUSED_TONE: ButtonTone = "ambient";
const ASIDE_TONE: ButtonTone = "ambient";

export type StakeFigure = {
	label: string;
	color?: KantoColor;
	swatch?: SwatchFill;
};

export type Stake = { label: string; figures: readonly StakeFigure[] };

export type FooterAction = {
	label: string;
	onPress?: () => void;
	icon?: IconName;
	iconAt?: IconPlacement;
};

export type NotePlacement = "below" | "row";

export type ScreenFooterProps = {
	stakes?: readonly Stake[];
	action: FooterAction;
	/** Secondary exits, left of the action. Prep offers two: the shop and the board. */
	asides?: readonly FooterAction[];
	refusal?: string;
	note?: string;
	noteAt?: NotePlacement;
	rule?: boolean;
};

const Figure = ({ figure }: { figure: StakeFigure }) => {
	if (figure.swatch !== undefined) {
		return <SwatchChip swatch={figure.swatch} label={figure.label} />;
	}

	return <Badge color={figure.color}>{figure.label}</Badge>;
};

const StakeReading = ({ stake }: { stake: Stake }) => (
	<span className={STAKE}>
		<Typography variant="hint" as="span">
			{stake.label}
		</Typography>
		<span className={FIGURES}>
			{stake.figures.map((figure) => (
				<Figure key={figure.label} figure={figure} />
			))}
		</span>
	</span>
);

export const ScreenFooter = ({
	stakes = [],
	action,
	asides = [],
	refusal,
	note,
	noteAt = "below",
	rule = true,
}: ScreenFooterProps) => (
	<footer className={clsx(FOOTER, rule && FOOTER_RULE)}>
		{stakes.length === 0 ? null : (
			<div className={STAKE_ROW}>
				{stakes.map((stake) => (
					<StakeReading key={stake.label} stake={stake} />
				))}
			</div>
		)}

		<div className={ACTION_ROW}>
			{asides.map((aside) => (
				<span key={aside.label} className={ASIDE}>
					<Button
						size={ACTION_SIZE}
						tone={ASIDE_TONE}
						label={aside.label}
						icon={aside.icon}
						iconAt={aside.iconAt}
						disabled={aside.onPress === undefined}
						onPress={aside.onPress}
					/>
				</span>
			))}

			{note === undefined || noteAt === "below" ? null : (
				<span className={ROW_NOTE}>
					<Typography variant="hint" as="span">
						{note}
					</Typography>
				</span>
			)}

			<span className={ACTION}>
				<Button
					size={ACTION_SIZE}
					tone={action.onPress === undefined ? REFUSED_TONE : LIVE_TONE}
					label={action.label}
					icon={action.icon}
					iconAt={action.iconAt}
					disabled={action.onPress === undefined}
					onPress={action.onPress}
				/>
			</span>
		</div>

		{note === undefined || noteAt === "row" ? null : (
			<Typography variant="hint">{note}</Typography>
		)}

		{refusal === undefined ? null : (
			<Typography variant="hint">{refusal}</Typography>
		)}
	</footer>
);

/**
 * The press a screen is asking for, pinned to the foot of a phone the way the
 * poll's build footer is. A long build list, shop shelf or debrief would
 * otherwise push the one action below the fold, and the panel's own opaque
 * surface is what lets the content scroll behind it.
 *
 * `PollScreen` deliberately does not use this: `BuildFooter` already holds that
 * screen's sticky bottom slot, and two pinned bars would land on each other.
 */
const PINNED = "sticky bottom-0 z-20 md:static";

export const ScreenActions = (footer: ScreenFooterProps) => (
	<Panel className={PINNED}>
		<Panel.Body>
			<ScreenFooter {...footer} rule={false} />
		</Panel.Body>
	</Panel>
);
