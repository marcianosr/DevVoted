import { clsx } from "clsx";

import { Text } from "./Text.ui";

const PLAN =
	"flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors";
const PICKABLE = "cursor-pointer";
const IDLE = "border-edge-strong hover:border-control-edge";
const ON = "border-theme bg-theme-soft";
const LOCKED = "border-transparent opacity-50";

const CONTROL =
	"size-4 shrink-0 appearance-none rounded-full border border-control-edge transition-colors checked:border-theme checked:bg-theme focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cerulean";

const SEALED =
	"size-4 shrink-0 rounded-full border border-dashed border-zinc-700";

const CAP = "w-20 shrink-0";
const TERMS = "min-w-0 flex-1";
const FIGURE = "shrink-0 tabular-nums";

const REDACTED = "???";

export type PlanProps =
	| {
			id: string;
			name: string;
			cap: string;
			terms: string;
			free?: boolean;
			figure?: string;
			selected: boolean;
			onSelect: (id: string) => void;
			locked?: never;
	  }
	| { id: string; locked: true; opensAt: string; cap?: never };

export const Plan = (props: PlanProps) => {
	if (props.locked)
		return (
			<div className={clsx(PLAN, LOCKED)}>
				<span aria-hidden className={SEALED} />
				<Text size="body" tone="muted" className={CAP}>
					{REDACTED}
				</Text>
				<Text size="meta" tone="muted" className={TERMS}>
					{props.opensAt}
				</Text>
			</div>
		);

	return (
		<label className={clsx(PLAN, PICKABLE, props.selected ? ON : IDLE)}>
			<input
				type="radio"
				name={props.name}
				checked={props.selected}
				onChange={() => props.onSelect(props.id)}
				className={CONTROL}
			/>
			<Text size="body" className={CAP}>
				{props.cap}
			</Text>{" "}
			<Text
				size="meta"
				tone={props.free ? "celadon" : "muted"}
				className={TERMS}
			>
				{props.terms}
			</Text>
			{props.figure ? (
				<>
					{" "}
					<Text size="meta" tone="muted" className={FIGURE}>
						{props.figure}
					</Text>
				</>
			) : null}
		</label>
	);
};
