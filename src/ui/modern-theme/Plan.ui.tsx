import { clsx } from "clsx";

import { Row } from "./Row.ui";
import { Text } from "./Text.ui";

// Padding and layout come from Row, so a rung sits at the same rhythm as every
// other list item in the kit. Only the frame is the plan's own.
const PLAN = "rounded-lg border transition-colors";
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
			<Row
				spacing="tight"
				className={clsx(PLAN, LOCKED)}
				leading={<span aria-hidden className={SEALED} />}
			>
				<Text size="meta" tone="muted" className={CAP}>
					{REDACTED}
				</Text>
				<Text size="meta" tone="muted" className={TERMS}>
					{props.opensAt}
				</Text>
			</Row>
		);

	return (
		<Row
			as="label"
			spacing="tight"
			className={clsx(PLAN, PICKABLE, props.selected ? ON : IDLE)}
			leading={
				<input
					type="radio"
					name={props.name}
					checked={props.selected}
					// Stated rather than gathered off the label: the three figures sit in
					// separate spans, so the computed name ran them together.
					aria-label={[props.cap, props.terms, props.figure]
						.filter(Boolean)
						.join(" ")}
					onChange={() => props.onSelect(props.id)}
					className={CONTROL}
				/>
			}
			trailing={
				props.figure ? (
					<Text size="meta" tone="muted" className={FIGURE}>
						{props.figure}
					</Text>
				) : null
			}
		>
			<Text size="meta" className={CAP}>
				{props.cap}
			</Text>
			<Text
				size="meta"
				tone={props.free ? "celadon" : "muted"}
				className={TERMS}
			>
				{props.terms}
			</Text>
		</Row>
	);
};
