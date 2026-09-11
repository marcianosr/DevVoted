import { clsx } from "clsx";

import { Badge } from "./Badge.ui";
import type { KantoColor } from "./colors";

const STUB =
	"flex w-full items-center justify-center gap-2 rounded-lg border border-theme-soft bg-hatched-theme px-4 py-2 text-sm";

const PRESSABLE =
	"cursor-pointer enabled:hover:bg-theme-soft disabled:cursor-not-allowed disabled:opacity-40";
const ARMED = "press-theme-armed border-theme";

const WORDS = "text-theme-soft";

const SLOT_NUMBER = "font-bold tabular-nums text-theme-faint";

const REFUSAL = "text-theme-soft";

const BUY_VERB = "buy";
const SLOT_WORD = "slot";
const BUY_GLYPH = "+";
const SEPARATOR = "·";

const AFFORDABLE_COLOR: KantoColor = "viridian";
const REFUSED_COLOR: KantoColor = "cinnabar";

const priceColorOf = (refusal?: string) =>
	refusal === undefined ? AFFORDABLE_COLOR : REFUSED_COLOR;

export type SlotOfferProps = {
	slot: number;
	price: string;
	refusal?: string;
	armed?: boolean;
	verb?: string;
	onPress?: () => void;
};

export const SlotOffer = ({
	slot,
	price,
	refusal,
	armed = false,
	verb = BUY_VERB,
	onPress,
}: SlotOfferProps) => {
	const action = `${verb} ${SLOT_WORD}`;
	const deal = [`${action} ${slot}`, price, refusal]
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
			{refusal === undefined ? null : (
				<span data-screen-theme={REFUSED_COLOR} className={REFUSAL}>
					{refusal}
				</span>
			)}
		</button>
	);
};
