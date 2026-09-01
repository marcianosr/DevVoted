import type { ReactNode } from "react";

import { Action, type ActionProps } from "./Action.ui";
import {
	Disclosure,
	DisclosureBody,
	DISCLOSURE_SUMMARY,
	isExpandable,
} from "./Disclosure.ui";
import { Mark, type MarkVariant } from "./Mark.ui";
import { Row } from "./Row.ui";
import { SlotMark } from "./SlotMark.ui";
import { Text } from "./Text.ui";

const SUMMARY = `${DISCLOSURE_SUMMARY} rounded-md transition-colors hover:bg-zinc-100/5`;

const FRAMED = "rounded-md";

const FACTS =
	"ml-9 flex flex-col gap-1 border-l border-edge-strong py-1 pr-3 pl-3";

const NAMING = "flex min-w-0 items-center gap-1";

const NOTES = "flex flex-wrap items-center gap-2";
const ACTIONS = "flex items-center gap-2";

const STACK = "flex min-w-0 flex-1 flex-col gap-0.5";
const EFFECT_LINE = "flex min-w-0 items-baseline gap-3";
const META_LINE = "flex min-w-0 items-center gap-3";
const NAME_COL = "w-32 shrink-0 truncate";
const EFFECT_COL = "min-w-0 flex-1";
const FIGURE = "ml-auto shrink-0";

const sizeMark = (
	slots: number | undefined,
	hint: string | undefined
): ReactNode =>
	slots === undefined ? null : <SlotMark slots={slots} hint={hint} />;

type LinesProps = {
	label: ReactNode;
	slots?: number;
	sizeHint?: string;
	notes?: ReactNode;
	figure?: ReactNode;
};

const OneLine = ({ label, slots, sizeHint, notes }: LinesProps) => (
	<>
		<span className={NAMING}>
			{sizeMark(slots, sizeHint)}
			<Text size="meta">{label}</Text>
		</span>
		{notes ? <span className={NOTES}>{notes}</span> : null}
	</>
);

const TwoLine = ({
	label,
	slots,
	sizeHint,
	notes,
	figure,
	gives,
}: LinesProps & { gives: ReactNode }) => (
	<span className={STACK}>
		<span className={EFFECT_LINE}>
			<Text size="meta" className={NAME_COL}>
				{label}
			</Text>
			<Text size="meta" className={EFFECT_COL}>
				{gives}
			</Text>
		</span>
		<span className={META_LINE}>
			<span className={NAME_COL}>{sizeMark(slots, sizeHint)}</span>
			{notes ? <span className={NOTES}>{notes}</span> : null}
			<span className={FIGURE}>{figure}</span>
		</span>
	</span>
);

type EntryBase = {
	label: ReactNode;
	slots?: number;
	sizeHint?: string;
	notes?: ReactNode;
	gives?: ReactNode;
	summary?: ReactNode;
	explainer?: ReactNode;
	defaultOpen?: boolean;
	dimmed?: boolean;
};

export type EntryProps = EntryBase &
	(
		| { mark: MarkVariant; leading?: never }
		| { leading?: ReactNode; mark?: never }
	) &
	(
		| { value?: ReactNode; actions?: never }
		| { actions: readonly ActionProps[]; value?: never }
	);

export const Entry = ({
	label,
	slots,
	sizeHint,
	mark,
	leading,
	notes,
	gives,
	value,
	actions,
	summary,
	explainer,
	defaultOpen = false,
	dimmed = false,
}: EntryProps) => {
	const expandable = isExpandable(summary, explainer);
	const figure = actions?.length ? (
		<span className={ACTIONS}>
			{actions.map((action) => (
				<Action key={action.label ?? action.cost} {...action} />
			))}
		</span>
	) : (
		value
	);
	const lines = { label, slots, sizeHint, notes, figure };

	const row = (
		<Row
			as={expandable ? "summary" : "div"}
			spacing="tight"
			dimmed={dimmed}
			leading={leading ?? (mark ? <Mark variant={mark} /> : null)}
			trailing={gives === undefined ? figure : undefined}
			className={expandable ? SUMMARY : FRAMED}
		>
			{gives === undefined ? (
				<OneLine {...lines} />
			) : (
				<TwoLine {...lines} gives={gives} />
			)}
		</Row>
	);

	if (!expandable) return row;

	return (
		<Disclosure scope="entry" defaultOpen={defaultOpen} className={FRAMED}>
			{row}
			<DisclosureBody
				className={FACTS}
				dimmed={dimmed}
				summary={summary}
				explainer={explainer}
			/>
		</Disclosure>
	);
};
