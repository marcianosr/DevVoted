import { clsx } from "clsx";

import { Badge } from "./Badge.ui";
import type { KantoColor } from "./colors";

const STUB =
	"flex w-full items-center justify-center gap-2 rounded-lg border border-theme-soft bg-hatched-theme px-4 py-2 text-sm";

const RUNG =
	"flex w-full items-center justify-center gap-2 rounded-lg border border-theme-faint px-4 py-2 text-sm opacity-60";

const PRESSABLE =
	"cursor-pointer enabled:hover:bg-theme-soft disabled:cursor-not-allowed disabled:opacity-40";
const ARMED = "press-theme-armed border-theme";

const WORDS = "text-theme-soft";
const LOCKED_WORDS = "text-theme-muted";

const SLOT_NUMBER = "font-bold tabular-nums text-theme-faint";
const LOCKED_NUMBER = "font-bold tabular-nums text-theme-muted";

const REFUSAL = "text-theme-soft";
const SOURCE = "text-theme-muted";

const BUY_VERB = "buy";
const SLOT_WORD = "slot";
const BUY_GLYPH = "+";
const SEPARATOR = "·";
const AFTER_WORD = "after this one";

const AFFORDABLE_COLOR: KantoColor = "viridian";
const REFUSED_COLOR: KantoColor = "cinnabar";

type Offered = {
	slot: number;
	price: string;
	from?: string;
	refusal?: string;
	armed?: boolean;
	verb?: string;
	onPress?: () => void;
	locked?: never;
};

type Locked = {
	slot: number;
	price: string;
	from?: never;
	locked: true;
	refusal?: never;
	armed?: never;
	verb?: never;
	onPress?: never;
};

export type SlotOfferProps = Offered | Locked;

const priceColorOf = (refusal?: string) =>
	refusal === undefined ? AFFORDABLE_COLOR : REFUSED_COLOR;

const LockedRung = ({ slot, price }: Locked) => (
	<div
		aria-label={`${SLOT_WORD} ${slot} ${SEPARATOR} ${price} ${SEPARATOR} ${AFTER_WORD}`}
		className={RUNG}
	>
		<span className={LOCKED_WORDS}>
			{SLOT_WORD} <span className={LOCKED_NUMBER}>{slot}</span>
		</span>
		<Badge>{price}</Badge>
	</div>
);

const OfferedRung = ({
	slot,
	price,
	from,
	refusal,
	armed = false,
	verb = BUY_VERB,
	onPress,
}: Offered) => {
	const action = `${verb} ${SLOT_WORD}`;
	const deal = [`${action} ${slot}`, price, from, refusal]
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
				{action} <span className={SLOT_NUMBER}>{slot}</span>
			</span>
			<Badge color={priceColorOf(refusal)}>{price}</Badge>
			{from === undefined ? null : <span className={SOURCE}>{from}</span>}
			{refusal === undefined ? null : (
				<span data-screen-theme={REFUSED_COLOR} className={REFUSAL}>
					{refusal}
				</span>
			)}
		</button>
	);
};

export const SlotOffer = (props: SlotOfferProps) =>
	props.locked === undefined ? (
		<OfferedRung {...props} />
	) : (
		<LockedRung {...props} />
	);
