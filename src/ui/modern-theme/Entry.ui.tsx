import type { ReactNode } from "react";

import { clsx } from "clsx";

import { Action, type ActionProps } from "./Action.ui";
import {
	Disclosure,
	DisclosureBody,
	DISCLOSURE_SUMMARY,
	isExpandable,
} from "./Disclosure.ui";
import { Mark, type MarkVariant } from "./Mark.ui";
import { RARITY_WASH, type Rarity } from "./rarity";
import { Row } from "./Row.ui";
import { Text } from "./Text.ui";

const SUMMARY = `${DISCLOSURE_SUMMARY} rounded-md transition-colors hover:bg-zinc-100/5`;

const FRAMED = "rounded-md";

const washedBy = (rarity?: Rarity) =>
	clsx(FRAMED, rarity && RARITY_WASH[rarity]);

const FACTS = "flex flex-col gap-2 py-2 pr-3 pl-10";

const NOTES = "flex flex-wrap items-center gap-2";
const ACTIONS = "flex items-center gap-2";

type EntryBase = {
	label: ReactNode;
	rarity?: Rarity;
	notes?: ReactNode;
	summary?: ReactNode;
	explainer?: ReactNode;
	defaultOpen?: boolean;
	dimmed?: boolean;
};

/** A row may lead with a verdict, with something of its own, or with nothing:
 * the rails that only list what the player owns have no status to claim. */
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
	rarity,
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
	const expandable = isExpandable(summary, explainer);

	const row = (
		<Row
			as={expandable ? "summary" : "div"}
			spacing="tight"
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
			className={expandable ? SUMMARY : washedBy(rarity)}
		>
			<Text size="meta">{label}</Text>
			{notes ? <span className={NOTES}>{notes}</span> : null}
		</Row>
	);

	if (!expandable) return row;

	return (
		<Disclosure
			scope="entry"
			defaultOpen={defaultOpen}
			className={washedBy(rarity)}
		>
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
