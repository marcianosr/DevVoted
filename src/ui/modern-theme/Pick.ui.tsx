import type { ReactNode } from "react";

import { clsx } from "clsx";

import { Caret } from "./Caret.ui";
import {
	Disclosure,
	DisclosureBody,
	DISCLOSURE_SUMMARY,
	isExpandable,
} from "./Disclosure.ui";
import { Row } from "./Row.ui";
import { Text } from "./Text.ui";

export type PickVariant = "remove" | "draft";

const PICK = "cursor-pointer rounded-md transition-colors";
const IDLE = "hover:bg-surface-raised";

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

const EXPANDABLE = "rounded-md transition-colors";
const SUMMARY = `${DISCLOSURE_SUMMARY} rounded-md transition-colors`;
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
	const expandable = isExpandable(summary, explainer);

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
		<Disclosure
			scope="row"
			defaultOpen={defaultOpen}
			className={clsx(EXPANDABLE, checked ? WASH[variant] : IDLE)}
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
