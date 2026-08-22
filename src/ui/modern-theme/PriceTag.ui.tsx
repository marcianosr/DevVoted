import { clsx } from "clsx";

import { Text } from "./Text.ui";

const TAG =
	"inline-flex shrink-0 items-center gap-1.5 py-1.5 pr-3 pl-5 [clip-path:polygon(0_50%,0.875rem_0,100%_0,100%_100%,0.875rem_100%)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cerulean";

const HOLE = "size-1 shrink-0 rounded-full bg-current opacity-60";

export type PriceTagState = "buyable" | "ready" | "owned" | "unaffordable";

const READY = "group-open/entry:bg-viridian group-open/entry:text-black";

const STATE = {
	buyable: `bg-surface-raised text-zinc-100 ${READY}`,
	ready: "bg-surface-raised text-zinc-100",
	owned: "bg-surface-raised text-zinc-600 line-through",
	unaffordable: "bg-surface-raised text-cinnabar",
} satisfies Record<PriceTagState, string>;

export type PriceTagProps = {
	kb: number;
	on: string;
	/** The verb the open row offers, e.g. "install". */
	label?: string;
	state?: PriceTagState;
	onUse: () => void;
};

const priceOf = (kb: number) => (kb === 0 ? "free" : `${kb} KB`);

export const PriceTag = ({
	kb,
	on,
	label = "install",
	state = "buyable",
	onUse,
}: PriceTagProps) => {
	const buyable = state === "buyable";
	const verb = kb === 0 ? label : `${label} · ${kb}`;

	return (
		<button
			type="button"
			disabled={state === "owned" || state === "unaffordable"}
			aria-label={
				state === "owned" || state === "unaffordable"
					? `${on} ${priceOf(kb)}`
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
			className={clsx(
				TAG,
				STATE[state],
				kb === 0 && buyable && "text-viridian"
			)}
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
};
