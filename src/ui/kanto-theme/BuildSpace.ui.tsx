import { clsx } from "clsx";

import { kbLabel } from "~/shared/lib/storage";

import { Badge } from "./Badge.ui";
import type { KantoColor } from "./colors";
import { Figures } from "./Figures.ui";
import { Panel } from "./Panel.ui";
import { Typography } from "./Typography.ui";

const RUNGS = "flex w-full flex-wrap items-center gap-2";
const RUNG =
	"inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm";
const EDGE = "border-theme-faint";
const EDGE_LIT = "border-theme";
const DIM = "opacity-60";
const PRESSABLE =
	"cursor-pointer transition-colors enabled:hover:bg-theme-soft enabled:hover:opacity-100";
const WEIGHT = "font-bold tabular-nums text-theme";
const PRICE = "tabular-nums text-theme-muted";
const MORE = "pl-1 text-xs text-theme-muted tabular-nums";

const TITLE = "build space";
const WEIGHT_WORD = "weight";
const FREE_WORD = "free";
const A_GATE = "a gate";
const SEPARATOR = "·";
const RECURRING_GLYPH = "↻";
const HELD_WORD = "held";

const BILLED_COLOR: KantoColor = "saffron";
const FREE_COLOR: KantoColor = "viridian";
const OVER_COLOR: KantoColor = "cinnabar";

const NO_UPKEEP = 0;
const NOTHING_ELIDED = 0;

export type BuildSpaceRungProps = {
	weight: number;
	kb: number;
	onPick?: () => void;
};

export type BuildSpaceProps = {
	rungs: readonly BuildSpaceRungProps[];
	held: number;
	weight: number;
	more?: number;
};

export const upkeepLabelOf = (kb: number): string =>
	kb === NO_UPKEEP ? FREE_WORD : `${kbLabel(kb)} ${A_GATE}`;

const priceOf = (kb: number) => (kb === NO_UPKEEP ? FREE_WORD : kbLabel(kb));

const heldRungOf = (rungs: readonly BuildSpaceRungProps[], held: number) =>
	rungs.find((rung) => rung.weight === held);

const nextRungOf = (rungs: readonly BuildSpaceRungProps[], held: number) =>
	rungs.find((rung) => rung.weight > held);

export const buildSpaceLineOf = ({
	rungs,
	held,
	weight,
}: BuildSpaceProps): string => {
	if (weight > held)
		return `${weight - held} ${WEIGHT_WORD} over the ${held} mark. Drop it, or take more room.`;

	const room = `Sitting at the ${held} mark. ${held - weight} ${WEIGHT_WORD} of room`;
	const next = nextRungOf(rungs, held);
	if (next === undefined) return `${room} before the ladder runs out.`;

	return `${room} before ${next.weight} takes it to ${upkeepLabelOf(next.kb)}.`;
};

const Rung = ({ weight, kb, onPick }: BuildSpaceRungProps) => {
	const label = `${weight} ${WEIGHT_WORD} ${SEPARATOR} ${priceOf(kb)}`;
	const body = (
		<>
			<span className={WEIGHT}>{weight}</span>
			<span aria-hidden className={PRICE}>
				{SEPARATOR}
			</span>
			<span className={PRICE}>{priceOf(kb)}</span>
		</>
	);

	if (onPick === undefined)
		return <span className={clsx(RUNG, EDGE, DIM)}>{body}</span>;

	return (
		<button
			type="button"
			aria-label={label}
			onClick={onPick}
			className={clsx(RUNG, EDGE, DIM, PRESSABLE)}
		>
			{body}
		</button>
	);
};

const HeldRung = ({ weight, kb }: BuildSpaceRungProps) => (
	<span
		aria-label={`${weight} ${WEIGHT_WORD} ${SEPARATOR} ${priceOf(kb)} ${SEPARATOR} ${HELD_WORD}`}
		aria-current="true"
		className={clsx(RUNG, EDGE_LIT)}
	>
		<span className={WEIGHT}>{weight}</span>
		<span aria-hidden className={PRICE}>
			{SEPARATOR}
		</span>
		<span className={PRICE}>{priceOf(kb)}</span>
	</span>
);

export const BuildSpace = (props: BuildSpaceProps) => {
	const { rungs, held, weight, more = NOTHING_ELIDED } = props;
	const bill = heldRungOf(rungs, held)?.kb ?? NO_UPKEEP;
	const over = weight > held;

	return (
		<Panel>
			<Panel.Header
				label={TITLE}
				meta={
					<>
						<span data-screen-theme={over ? OVER_COLOR : undefined}>
							{weight} {WEIGHT_WORD}
						</span>
						<Badge color={bill > NO_UPKEEP ? BILLED_COLOR : FREE_COLOR}>
							{RECURRING_GLYPH} {upkeepLabelOf(bill)}
						</Badge>
					</>
				}
			/>

			<Panel.Body>
				<div className={RUNGS}>
					{rungs.map((rung) =>
						rung.weight === held ? (
							<HeldRung key={rung.weight} {...rung} />
						) : (
							<Rung key={rung.weight} {...rung} />
						)
					)}
					{more === NOTHING_ELIDED ? null : (
						<span aria-hidden className={MORE}>
							+{more}
						</span>
					)}
				</div>
			</Panel.Body>

			<Panel.Footer>
				<Typography variant="hint">
					<Figures text={buildSpaceLineOf(props)} />
				</Typography>
			</Panel.Footer>
		</Panel>
	);
};
