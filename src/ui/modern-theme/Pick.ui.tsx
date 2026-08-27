import type { ReactNode } from "react";

import { clsx } from "clsx";

import { Caret } from "./Caret.ui";
import {
	Disclosure,
	DisclosureBody,
	DISCLOSURE_SUMMARY,
	isExpandable,
} from "./Disclosure.ui";
import { RARITY_WASH, type Rarity } from "./rarity";
import { RarityStripe } from "./RarityStripe.ui";
import { Row } from "./Row.ui";
import { Text } from "./Text.ui";

export type PickVariant = "remove" | "draft";

const PICK = "cursor-pointer rounded-md transition-colors";
const IDLE = "hover:bg-zinc-100/5";

const WASH = {
	remove: "bg-cinnabar/5 hover:bg-cinnabar/10",
	draft: "bg-theme-soft hover:bg-theme-soft",
} satisfies Record<PickVariant, string>;

const CONTROL =
	"size-4 shrink-0 appearance-none border border-control-edge transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cerulean";

const BOX = {
	remove: "rounded checked:border-cinnabar checked:bg-cinnabar",
	draft: "rounded-full checked:border-theme checked:bg-theme",
} satisfies Record<PickVariant, string>;

const STRUCK = "line-through";
const NOTES = "flex flex-wrap items-center gap-2";
// Right-aligned inside the row's own content, so every figure down a deal sits
// in one column while the trailing slot stays free for a press.
const VALUE = "ml-auto shrink-0 tabular-nums";

const EXPANDABLE = "relative rounded-md transition-colors";
const SUMMARY = `${DISCLOSURE_SUMMARY} rounded-md transition-colors`;
const PICKER = "flex shrink-0 cursor-pointer items-center gap-3";
// Ruled and indented under the name, the same way an Entry's facts are: a
// column of open rows would otherwise run together.
const FACTS =
	"ml-13 flex flex-col gap-1 border-l border-edge-strong py-1 pr-3 pl-3";

export type PickProps = {
	label: ReactNode;
	rarity?: Rarity;
	checked: boolean;
	onToggle: (checked: boolean) => void;
	notes?: ReactNode;
	/** The row's figure, right-aligned in a column shared down the list. */
	value?: ReactNode;
	trailing?: ReactNode;
	variant?: PickVariant;
	summary?: ReactNode;
	explainer?: ReactNode;
	defaultOpen?: boolean;
};

export const Pick = ({
	label,
	rarity,
	checked,
	onToggle,
	notes,
	value,
	trailing,
	variant = "remove",
	summary,
	explainer,
	defaultOpen = false,
}: PickProps) => {
	const expandable = isExpandable(summary, explainer);
	const wash = checked
		? WASH[variant]
		: clsx(IDLE, rarity && RARITY_WASH[rarity]);

	const control = (
		<input
			type="checkbox"
			checked={checked}
			onChange={(event) => onToggle(event.target.checked)}
			className={clsx(CONTROL, BOX[variant])}
		/>
	);

	const name = (
		<Text
			size="meta"
			className={clsx(checked && variant === "remove" && STRUCK)}
		>
			{label}
		</Text>
	);

	const marks = notes ? <span className={NOTES}>{notes}</span> : null;
	const figure = value == null ? null : <span className={VALUE}>{value}</span>;
	const stripe = rarity ? <RarityStripe rarity={rarity} /> : null;

	if (!expandable)
		return (
			<Row
				as="label"
				spacing="compact"
				className={clsx(PICK, wash)}
				leading={control}
				trailing={trailing}
			>
				{stripe}
				{name}
				{marks}
				{figure}
			</Row>
		);

	return (
		<Disclosure
			scope="row"
			defaultOpen={defaultOpen}
			className={clsx(EXPANDABLE, wash)}
		>
			<Row
				as="summary"
				spacing="compact"
				className={SUMMARY}
				leading={<Caret scope="row" />}
				trailing={trailing}
			>
				<label className={PICKER} onClick={(event) => event.stopPropagation()}>
					{control}
					{stripe}
					{name}
				</label>
				{marks}
				{figure}
			</Row>
			<DisclosureBody
				className={FACTS}
				summary={summary}
				explainer={explainer}
			/>
		</Disclosure>
	);
};
