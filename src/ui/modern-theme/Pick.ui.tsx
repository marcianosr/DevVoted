import type { ReactNode } from "react";

import { clsx } from "clsx";

import { Caret } from "./Caret.ui";
import { Row } from "./Row.ui";
import { Text } from "./Text.ui";

/** The two jobs a tickable row has. Wash, control colour, control shape and the
 * strikethrough all move together, so one closed variant beats four props that
 * could be combined into states no screen wants. */
export type PickVariant = "remove" | "draft";

const PICK = "cursor-pointer rounded-md transition-colors";
const IDLE = "hover:bg-surface-raised";

// Each wash carries its own hover, so an unticked row's hover and a ticked
// row's never both apply and fight over source order.
const WASH = {
	remove: "bg-cinnabar/5 hover:bg-cinnabar/10",
	draft: "bg-theme-soft hover:bg-theme-soft",
} satisfies Record<PickVariant, string>;

const CONTROL =
	"size-4 shrink-0 appearance-none border border-control-edge transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cerulean";

// Drafting draws a circle because that is the mock; the element underneath
// stays a checkbox, so pick-three still announces itself as pick-three.
const BOX = {
	remove: "rounded checked:border-cinnabar checked:bg-cinnabar",
	draft: "rounded-full checked:border-theme checked:bg-theme",
} satisfies Record<PickVariant, string>;

const STRUCK = "line-through";
const NOTES = "flex flex-wrap items-center gap-2";

// Mirrors Entry's disclosure exactly, so a config reads the same whether you are
// picking it or watching it run. `group/row`, not `group/fold`: these rows sit
// inside a Fold, and sharing the name would rotate this caret off that one.
const EXPANDABLE = "group/row rounded-md transition-colors";
const SUMMARY =
	"cursor-pointer list-none rounded-md transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cerulean [&::-webkit-details-marker]:hidden";
const PICKER = "flex shrink-0 cursor-pointer items-center gap-3";
const FACTS = "flex flex-col gap-1 py-2 pl-14";

export type PickProps = {
	label: ReactNode;
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
	checked,
	onToggle,
	notes,
	trailing,
	variant = "remove",
	summary,
	explainer,
	defaultOpen = false,
}: PickProps) => {
	const expandable = Boolean(summary ?? explainer);

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
				className={clsx(PICK, checked ? WASH[variant] : IDLE)}
				leading={control}
				trailing={trailing}
			>
				{name}
				{marks}
			</Row>
		);

	return (
		<details
			open={defaultOpen}
			className={clsx(EXPANDABLE, checked ? WASH[variant] : IDLE)}
		>
			<Row
				as="summary"
				spacing="compact"
				className={SUMMARY}
				leading={<Caret scope="row" />}
				trailing={trailing}
			>
				{/* The picker is its own target inside the summary, so ticking a
				    config never also folds it. */}
				<label className={PICKER} onClick={(event) => event.stopPropagation()}>
					{control}
					{name}
				</label>
				{marks}
			</Row>
			<div className={FACTS}>
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
