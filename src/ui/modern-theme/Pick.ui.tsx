import type { ReactNode } from "react";

import { clsx } from "clsx";

import { Caret } from "./Caret.ui";
import {
	Disclosure,
	DisclosureBody,
	DISCLOSURE_SUMMARY,
	isExpandable,
} from "./Disclosure.ui";
import { RARITY_FILL, RARITY_WASH, type Rarity } from "./rarity";
import { Row } from "./Row.ui";
import { Text } from "./Text.ui";

export type PickVariant = "remove" | "draft";

const PICK = "relative cursor-pointer rounded-md transition-colors";
// Translucent, so a rarity tint underneath survives the hover.
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

// Absolute rather than a left border: the legendary's rail is a gradient, and no
// border can hold one.
const RAIL = "pointer-events-none absolute inset-y-1 left-0 w-1 rounded-full";

const STRUCK = "line-through";
const NOTES = "flex flex-wrap items-center gap-2";

const EXPANDABLE = "relative rounded-md transition-colors";
const SUMMARY = `${DISCLOSURE_SUMMARY} rounded-md transition-colors`;
const PICKER = "flex shrink-0 cursor-pointer items-center gap-3";
const FACTS = "flex flex-col gap-1 py-2 pl-14";

export type PickProps = {
	label: ReactNode;
	/** Tints the row until it is picked, when the pick's own wash takes over. */
	rarity?: Rarity;
	checked: boolean;
	onToggle: (checked: boolean) => void;
	notes?: ReactNode;
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
	trailing,
	variant = "remove",
	summary,
	explainer,
	defaultOpen = false,
}: PickProps) => {
	const expandable = isExpandable(summary, explainer);
	// The rail stays whatever the rarity is; only the fill answers to the pick.
	const wash = checked
		? WASH[variant]
		: clsx(rarity && RARITY_WASH[rarity], IDLE);

	const rail = rarity ? (
		<span aria-hidden className={`${RAIL} ${RARITY_FILL[rarity]}`} />
	) : null;

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

	if (!expandable)
		return (
			<Row
				as="label"
				spacing="compact"
				className={clsx(PICK, wash)}
				leading={control}
				trailing={trailing}
			>
				{rail}
				{name}
				{marks}
			</Row>
		);

	return (
		<Disclosure
			scope="row"
			defaultOpen={defaultOpen}
			className={clsx(EXPANDABLE, wash)}
		>
			{rail}
			<Row
				as="summary"
				spacing="compact"
				className={SUMMARY}
				leading={<Caret scope="row" />}
				trailing={trailing}
			>
				<label className={PICKER} onClick={(event) => event.stopPropagation()}>
					{control}
					{name}
				</label>
				{marks}
			</Row>
			<DisclosureBody
				className={FACTS}
				summary={summary}
				explainer={explainer}
			/>
		</Disclosure>
	);
};
