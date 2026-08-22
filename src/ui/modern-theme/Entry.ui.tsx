import type { ReactNode } from "react";

import { clsx } from "clsx";

import { Action, type ActionProps } from "./Action.ui";
import { Mark, type MarkVariant } from "./Mark.ui";
import { Row } from "./Row.ui";
import { Text } from "./Text.ui";

const ENTRY = "group/entry";

// No caret: the whole row is the hit target, and the mark already sits where a
// caret would.
const SUMMARY =
	"cursor-pointer list-none rounded-md transition-colors hover:bg-surface-raised group-open/entry:bg-surface-raised focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cerulean [&::-webkit-details-marker]:hidden";

// pl-10 lands the facts under the name: px-3 of row padding, a 16px leading
// circle, and the gap-3 between them.
const FACTS = "flex flex-col gap-2 py-2 pl-10";

// Badges and unmet requirements sit with the name rather than in the trailing
// slot, so the buttons keep a column of their own.
const NOTES = "flex flex-wrap items-center gap-2";
const ACTIONS = "flex items-center gap-2";

type EntryBase = {
	label: ReactNode;
	/** Badges and unmet requirements, beside the name. */
	notes?: ReactNode;
	summary?: ReactNode;
	explainer?: ReactNode;
	defaultOpen?: boolean;
	dimmed?: boolean;
};

// A row is led by a verdict or by a control, and trails a value or buttons —
// never both of either, since each pair shares one slot.
export type EntryProps = EntryBase &
	(
		| { mark: MarkVariant; leading?: never }
		| { leading: ReactNode; mark?: never }
	) &
	(
		| { value?: ReactNode; actions?: never }
		| { actions: readonly ActionProps[]; value?: never }
	);

export const Entry = ({
	label,
	mark,
	leading,
	notes,
	value,
	actions,
	summary,
	explainer,
	defaultOpen = false,
	dimmed = false,
}: EntryProps) => {
	const expandable = Boolean(summary ?? explainer);

	const row = (
		<Row
			as={expandable ? "summary" : "div"}
			spacing="compact"
			dimmed={dimmed}
			leading={leading ?? (mark ? <Mark variant={mark} /> : null)}
			trailing={
				actions?.length ? (
					<span className={ACTIONS}>
						{actions.map((action) => (
							<Action key={action.label ?? action.cost} {...action} />
						))}
					</span>
				) : (
					value
				)
			}
			className={expandable ? SUMMARY : undefined}
		>
			<Text size="body">{label}</Text>
			{notes ? <span className={NOTES}>{notes}</span> : null}
		</Row>
	);

	if (!expandable) return row;

	return (
		<details open={defaultOpen} className={ENTRY}>
			{row}
			<div className={clsx(FACTS, dimmed && "opacity-50")}>
				{summary ? (
					<Text as="p" size="xxs" tone="muted">
						{summary}
					</Text>
				) : null}
				{explainer ? (
					// A step larger and brighter than the summary above it: the summary
					// states where the config stands, the explainer is what you opened
					// the row for.
					<Text as="p" size="meta">
						{explainer}
					</Text>
				) : null}
			</div>
		</details>
	);
};
