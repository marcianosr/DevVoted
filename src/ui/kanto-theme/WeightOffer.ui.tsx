import { clsx } from "clsx";

import { Badge } from "./Badge.ui";
import type { KantoColor } from "./colors";
import { Figures } from "./Figures.ui";

const STUB =
	"flex w-full items-center justify-center gap-2 rounded-lg border border-theme-soft bg-hatched-theme px-4 py-2 text-sm";

const PRESSABLE =
	"cursor-pointer enabled:hover:bg-theme-soft disabled:cursor-not-allowed disabled:opacity-40";
const ARMED = "press-theme-armed border-theme";

const WORDS = "text-theme-soft";
const WEIGHT_NUMBER = "font-bold tabular-nums text-theme-faint";
const CLIMB = "text-theme-muted tabular-nums";
const REFUSAL = "text-theme-soft";
const OPENS = "text-theme-muted";

const BUY_VERB = "carry";
const FREE_WORD = "free";
const WEIGHT_WORD = "weight";
const BUY_GLYPH = "+";
const ARROW_GLYPH = "→";
const SEPARATOR = "·";

const AFFORDABLE_COLOR: KantoColor = "viridian";
const REFUSED_COLOR: KantoColor = "cinnabar";
const OPENS_GAIN: KantoColor = "pewter";

type Offered = {
	from: number;
	to: number;
	price: string;
	refusal?: string;
	armed?: boolean;
	onPress?: () => void;
	opensAt?: never;
};

type Locked = {
	to: number;
	opensAt: string;
	from?: never;
	price?: never;
	refusal?: never;
	armed?: never;
	onPress?: never;
};

export type WeightOfferProps = Offered | Locked;

const priceColorOf = (refusal?: string) =>
	refusal === undefined ? AFFORDABLE_COLOR : REFUSED_COLOR;

const Rung = ({ weight }: { weight: number }) => (
	<span className={WEIGHT_NUMBER}>{weight}</span>
);

const LockedRung = ({ to, opensAt }: Locked) => (
	<div className={STUB}>
		<Rung weight={to} />
		<span className={WORDS}>{FREE_WORD}</span>
		<span aria-hidden className={OPENS}>
			{SEPARATOR}
		</span>
		<span className={OPENS}>
			<Figures text={opensAt} gain={OPENS_GAIN} />
		</span>
	</div>
);

const OfferedRung = ({
	from,
	to,
	price,
	refusal,
	armed = false,
	onPress,
}: Offered) => {
	const action = `${BUY_VERB} ${to} ${FREE_WORD} ${WEIGHT_WORD}`;
	const climb = `${from} ${ARROW_GLYPH} ${to}`;
	const deal = [action, climb, price, refusal]
		.filter((part) => part !== undefined)
		.join(` ${SEPARATOR} `);

	return (
		<button
			type="button"
			aria-label={deal}
			aria-pressed={armed}
			disabled={onPress === undefined}
			onClick={onPress}
			className={clsx(STUB, PRESSABLE, armed && ARMED)}
		>
			<span aria-hidden className={WORDS}>
				{BUY_GLYPH}
			</span>
			<span className={WORDS}>
				{BUY_VERB} <Rung weight={to} /> {FREE_WORD} {WEIGHT_WORD}
			</span>
			<span aria-hidden className={CLIMB}>
				{climb}
			</span>
			<Badge color={priceColorOf(refusal)}>{price}</Badge>
			{refusal === undefined ? null : (
				<span data-screen-theme={REFUSED_COLOR} className={REFUSAL}>
					{refusal}
				</span>
			)}
		</button>
	);
};

export const WeightOffer = (props: WeightOfferProps) =>
	props.opensAt === undefined ? (
		<OfferedRung {...props} />
	) : (
		<LockedRung {...props} />
	);
