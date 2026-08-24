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
import { RARITY_FILL, RARITY_WASH, type Rarity } from "./rarity";
import { Row } from "./Row.ui";
import { Text } from "./Text.ui";

// Translucent rather than the opaque surface it used to raise to, so a rarity
// tint underneath survives the hover instead of blinking out of it.
const SUMMARY = `${DISCLOSURE_SUMMARY} rounded-md transition-colors hover:bg-zinc-100/5 group-open/entry:bg-zinc-100/5`;

const FRAMED = "relative rounded-md";

const railedBy = (rarity?: Rarity) =>
	rarity ? `${FRAMED} ${RARITY_WASH[rarity]}` : FRAMED;

// Absolute rather than a left border, because the legendary's rail is a gradient
// and no border can hold one. Inset so it reads as a spine on the row, not as a
// rule between rows.
const RAIL = "pointer-events-none absolute inset-y-1 left-0 w-1 rounded-full";

const railOf = (rarity?: Rarity) =>
	rarity ? (
		<span aria-hidden className={`${RAIL} ${RARITY_FILL[rarity]}`} />
	) : null;

const FACTS = "flex flex-col gap-2 py-2 pl-10";

const NOTES = "flex flex-wrap items-center gap-2";
const ACTIONS = "flex items-center gap-2";

type EntryBase = {
	label: ReactNode;
	/** Tints the whole row with the config's rarity. The Dot states it exactly;
	 * this is what makes a build's spread readable without counting dots. */
	rarity?: Rarity;
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
			className={clsx(
				expandable ? SUMMARY : undefined,
				!expandable && railedBy(rarity)
			)}
		>
			{expandable ? null : railOf(rarity)}
			<Text size="meta">{label}</Text>
			{notes ? <span className={NOTES}>{notes}</span> : null}
		</Row>
	);

	if (!expandable) return row;

	return (
		<Disclosure
			scope="entry"
			defaultOpen={defaultOpen}
			className={railedBy(rarity)}
		>
			{railOf(rarity)}
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
