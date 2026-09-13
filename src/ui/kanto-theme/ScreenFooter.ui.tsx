import { Badge } from "./Badge.ui";
import { Button, type ButtonTone, type IconPlacement } from "./Button.ui";
import type { KantoColor } from "./colors";
import type { IconName } from "./Icon.ui";
import type { SwatchFill } from "./Swatch.ui";
import { SwatchChip } from "./SwatchChip.ui";
import { Typography } from "./Typography.ui";

const FOOTER = "flex w-full flex-col gap-3 border-t border-theme-faint pt-4";
const STAKE_ROW = "flex w-full flex-wrap items-center justify-end gap-4";
const ACTION_ROW = "flex w-full flex-wrap items-center gap-3";
const STAKE = "flex flex-wrap items-center gap-2";
const FIGURES = "flex flex-wrap items-center gap-2";
const ASIDE = "shrink-0";
const ACTION = "ml-auto shrink-0";
const ROW_NOTE = "min-w-0 flex-1 text-center";

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
	aside?: FooterAction;
	refusal?: string;
	note?: string;
	noteAt?: NotePlacement;
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
	aside,
	refusal,
	note,
	noteAt = "below",
}: ScreenFooterProps) => (
	<footer className={FOOTER}>
		{stakes.length === 0 ? null : (
			<div className={STAKE_ROW}>
				{stakes.map((stake) => (
					<StakeReading key={stake.label} stake={stake} />
				))}
			</div>
		)}

		<div className={ACTION_ROW}>
			{aside === undefined ? null : (
				<span className={ASIDE}>
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
			)}

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
