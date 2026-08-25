import { clsx } from "clsx";

import { Text } from "./Text.ui";
import { Tooltip } from "./Tooltip.ui";

// pl clears the clip-path nose: shrink one and the other follows, or the figure
// sits on the point.
const TAG =
	"inline-flex shrink-0 cursor-pointer items-center gap-1 py-1 pr-2.5 pl-4 [clip-path:polygon(0_50%,0.625rem_0,100%_0,100%_100%,0.625rem_100%)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cerulean disabled:cursor-not-allowed disabled:opacity-50";

const HOLE = "size-1 shrink-0 rounded-full bg-current opacity-60";

export type PriceTagState =
	"buyable" | "ready" | "owned" | "unaffordable" | "unavailable";

const READY = "group-open/entry:bg-celadon group-open/entry:text-black";

const STATE = {
	buyable: `bg-celadon/15 text-celadon ${READY}`,
	ready: "bg-surface-raised text-zinc-100",
	owned: "bg-surface-raised text-zinc-600 line-through",
	unaffordable: "bg-cinnabar/15 text-cinnabar",
	unavailable: "bg-zinc-100/10 text-zinc-500",
} satisfies Record<PriceTagState, string>;

export type PriceTagProps = {
	kb: number;
	on: string;
	label?: string;
	state?: PriceTagState;
	hint?: string;
	onUse: () => void;
};

const priceOf = (kb: number) => (kb === 0 ? "free" : `${kb} KB`);

const REFUSED: readonly PriceTagState[] = [
	"owned",
	"unaffordable",
	"unavailable",
];

export const PriceTag = ({
	kb,
	on,
	label = "install",
	state = "buyable",
	hint,
	onUse,
}: PriceTagProps) => {
	const buyable = state === "buyable";
	const verb = kb === 0 ? label : `${label} · ${priceOf(kb)}`;

	const tag = (
		<button
			type="button"
			disabled={REFUSED.includes(state)}
			aria-label={
				REFUSED.includes(state)
					? [`${on} ${priceOf(kb)}`, hint].filter(Boolean).join(", ")
					: `${label} ${on} for ${priceOf(kb)}`
			}
			onClick={(event) => {
				const row = event.currentTarget.closest("details");
				if (row && !row.open) {
					row.open = true;
					return;
				}

				event.stopPropagation();
				onUse();
			}}
			className={clsx(TAG, STATE[state], kb === 0 && buyable && "text-celadon")}
		>
			<span aria-hidden className={HOLE} />
			<Text size="meta" tone="inherit">
				{state === "ready" ? (
					verb
				) : (
					<>
						<span className={buyable ? "group-open/entry:hidden" : undefined}>
							{priceOf(kb)}
						</span>
						{buyable ? (
							<span className="hidden group-open/entry:inline">{verb}</span>
						) : null}
					</>
				)}
			</Text>
		</button>
	);

	return hint ? <Tooltip hint={hint}>{tag}</Tooltip> : tag;
};
