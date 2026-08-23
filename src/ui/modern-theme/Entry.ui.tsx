import type { ReactNode } from "react";

import { clsx } from "clsx";

import { Action, type ActionProps } from "./Action.ui";
import { Mark, type MarkVariant } from "./Mark.ui";
import { Row } from "./Row.ui";
import { Text } from "./Text.ui";

const ENTRY = "group/entry";

const SUMMARY =
	"cursor-pointer list-none rounded-md transition-colors hover:bg-surface-raised group-open/entry:bg-surface-raised focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cerulean [&::-webkit-details-marker]:hidden";

const FACTS = "flex flex-col gap-2 py-2 pl-10";

const NOTES = "flex flex-wrap items-center gap-2";
const ACTIONS = "flex items-center gap-2";

type EntryBase = {
	label: ReactNode;
	notes?: ReactNode;
	summary?: ReactNode;
	explainer?: ReactNode;
	defaultOpen?: boolean;
	dimmed?: boolean;
};

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
					<Text as="p" size="meta">
						{explainer}
					</Text>
				) : null}
			</div>
		</details>
	);
};
