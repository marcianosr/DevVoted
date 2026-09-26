import { clsx } from "clsx";

import { Action } from "./Action.ui";
import { Badge } from "./Badge.ui";
import { Button, type ButtonTone, type IconPlacement } from "./Button.ui";
import type { KantoColor } from "./colors";
import type { IconName } from "./Icon.ui";
import type { SwatchFill, SwatchMark } from "./Swatch.ui";
import { SwatchChip } from "./SwatchChip.ui";
import { Typography } from "./Typography.ui";

const FOOTER = "flex w-full flex-col gap-3";
const PRESS_BLOCK = "flex w-full flex-col gap-3";
const PRESS_BLOCK_INLINE = "sm:flex-row sm:items-center";
const PRESS_SEAT = "w-full";
const PRESS_BESIDE_ASIDE = "sm:min-w-0 sm:flex-1";
const FOOTER_RULE = "border-t border-theme-faint pt-4";
const STAKE_ROW = "flex w-full flex-wrap items-center justify-end gap-4";
const ASIDE_ROW = "flex w-full flex-wrap items-center gap-3";
const ASIDE_ROW_INLINE = "sm:w-auto sm:shrink-0";
const STAKE = "flex flex-wrap items-center gap-2";
const FIGURES = "flex flex-wrap items-center gap-2";
const ASIDE = "shrink-0";
const ASIDE_SHARE = "min-w-40 flex-1";
const SPARE_NOTE = "w-full min-w-0";

const ASIDE_SIZE = "lg";

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
	swatch?: SwatchMark;
	icon?: IconName;
	iconAt?: IconPlacement;
};

export type ScreenFooterProps = {
	stakes?: readonly Stake[];
	action: FooterAction;
	asides?: readonly FooterAction[];
	refusal?: string;
	note?: string;
	rule?: boolean;
};

type FooterLines = { press?: string; above?: string };

const footerLinesOf = (
	refusal: string | undefined,
	note: string | undefined,
	live: boolean
): FooterLines => {
	if (live) return { press: note, above: refusal };
	if (refusal === undefined) return { press: note };
	return { press: refusal, above: note };
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
	rule = true,
}: ScreenFooterProps) => {
	const lines = footerLinesOf(refusal, note, action.onPress !== undefined);
	const alongside = asides.length === 1;

	return (
		<footer className={clsx(FOOTER, rule && FOOTER_RULE)}>
			{stakes.length === 0 ? null : (
				<div className={STAKE_ROW}>
					{stakes.map((stake) => (
						<StakeReading key={stake.label} stake={stake} />
					))}
				</div>
			)}

			<div className={clsx(PRESS_BLOCK, alongside && PRESS_BLOCK_INLINE)}>
				{asides.length === 0 ? null : (
					<div className={clsx(ASIDE_ROW, alongside && ASIDE_ROW_INLINE)}>
						{asides.map((aside) => (
							<span
								key={aside.label}
								className={alongside ? ASIDE : ASIDE_SHARE}
							>
								<Button
									size={ASIDE_SIZE}
									width={alongside ? "auto" : "fill"}
									tone={ASIDE_TONE}
									label={aside.label}
									icon={aside.icon}
									iconAt={aside.iconAt}
									disabled={aside.onPress === undefined}
									onPress={aside.onPress}
								/>
							</span>
						))}
					</div>
				)}

				<div className={clsx(PRESS_SEAT, alongside && PRESS_BESIDE_ASIDE)}>
					<Action
						label={action.label}
						note={lines.press}
						swatch={action.swatch}
						icon={action.icon}
						onPress={action.onPress}
					/>
				</div>
			</div>

			{lines.above === undefined ? null : (
				<span className={SPARE_NOTE}>
					<Typography variant="hint" as="span">
						{lines.above}
					</Typography>
				</span>
			)}
		</footer>
	);
};

const BAR =
	"sticky bottom-0 z-20 -mx-4 flex flex-col px-4 py-3 sm:-mx-8 sm:px-8 md:static md:mx-0 md:px-4 md:py-4";
const BAR_GROUND =
	"border-t border-theme-faint bg-theme-faint md:rounded-2xl md:border";

const carriesMoreThanThePress = ({
	stakes = [],
	asides = [],
	refusal,
	note,
	action,
}: ScreenFooterProps) =>
	stakes.length > 0 ||
	asides.length > 0 ||
	footerLinesOf(refusal, note, action.onPress !== undefined).above !==
		undefined;

export const ScreenActions = (footer: ScreenFooterProps) => (
	<div className={clsx(BAR, carriesMoreThanThePress(footer) && BAR_GROUND)}>
		<ScreenFooter {...footer} rule={false} />
	</div>
);
