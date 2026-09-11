import { clsx } from "clsx";

import { Badge } from "./Badge.ui";
import type { KantoColor } from "./colors";

const BOX =
	"flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-theme-faint px-4 py-2 text-sm";

const PRESSABLE =
	"cursor-pointer enabled:hover:bg-theme-soft disabled:cursor-not-allowed disabled:opacity-40";
const ARMED = "press-theme-armed border-theme-soft";

const EMPTY_WORDS = "text-theme-muted";
const CASH_WORDS = "text-theme-soft";

const EMPTY_LABEL = "empty slot";
const CASH_LABEL = "cash this slot back";
const CASH_GLYPH = "−";
const SEPARATOR = "·";
const REFUND_COLOR: KantoColor = "viridian";

export type SlotCash = {
	refund: string;
	armed?: boolean;
	onPress?: () => void;
};

export type SlotBoxProps = {
	cash?: SlotCash;
	label?: string;
};

export const SlotBox = ({ cash, label = EMPTY_LABEL }: SlotBoxProps) => {
	if (cash === undefined) {
		return (
			<div aria-hidden className={BOX}>
				<span className={EMPTY_WORDS}>{label}</span>
			</div>
		);
	}

	const { refund, armed = false, onPress } = cash;

	return (
		<button
			type="button"
			aria-label={`${CASH_LABEL} ${SEPARATOR} ${refund}`}
			aria-pressed={armed}
			disabled={onPress === undefined}
			onClick={onPress}
			className={clsx(BOX, PRESSABLE, armed && ARMED)}
		>
			<span aria-hidden className={CASH_WORDS}>
				{CASH_GLYPH}
			</span>
			<span className={CASH_WORDS}>{CASH_LABEL}</span>
			<Badge color={REFUND_COLOR}>{refund}</Badge>
		</button>
	);
};
