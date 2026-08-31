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
import { SlotMark } from "./SlotMark.ui";
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
const DISABLED_CONTROL = "cursor-not-allowed opacity-50";
const NOTES = "flex flex-wrap items-center gap-2";
const VALUE = "ml-auto shrink-0 tabular-nums";

const EXPANDABLE = "relative rounded-md transition-colors";
const SUMMARY = `${DISCLOSURE_SUMMARY} rounded-md transition-colors`;
const PICKER = "flex shrink-0 cursor-pointer items-center gap-3";
const FACTS =
	"ml-13 flex flex-col gap-1 border-l border-edge-strong py-1 pr-3 pl-3";

export type PickProps = {
	label: ReactNode;
	slots?: number;
	checked: boolean;
	onToggle: (checked: boolean) => void;
	notes?: ReactNode;
	value?: ReactNode;
	trailing?: ReactNode;
	variant?: PickVariant;
	summary?: ReactNode;
	explainer?: ReactNode;
	defaultOpen?: boolean;
	sizeHint?: string;
	disabled?: boolean;
};

const sizeFor = (
	slots: number | undefined,
	hint: string | undefined
): ReactNode =>
	slots === undefined ? null : <SlotMark slots={slots} hint={hint} />;

const washFor = (
	checked: boolean,
	variant: PickVariant,
	disabled: boolean
): string => {
	if (checked) return WASH[variant];
	return disabled ? "" : IDLE;
};

export const Pick = ({
	label,
	slots,
	checked,
	onToggle,
	notes,
	value,
	trailing,
	variant = "remove",
	summary,
	explainer,
	defaultOpen = false,
	disabled = false,
	sizeHint,
}: PickProps) => {
	const expandable = isExpandable(summary, explainer);
	const wash = washFor(checked, variant, disabled);

	const control = (
		<input
			type="checkbox"
			checked={checked}
			disabled={disabled}
			onChange={(event) => onToggle(event.target.checked)}
			className={clsx(CONTROL, BOX[variant], disabled && DISABLED_CONTROL)}
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
	const size = sizeFor(slots, sizeHint);

	if (!expandable)
		return (
			<Row
				as="label"
				spacing="compact"
				className={clsx(PICK, wash)}
				dimmed={disabled}
				leading={control}
				trailing={trailing}
			>
				{size}
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
				dimmed={disabled}
				leading={<Caret scope="row" />}
				trailing={trailing}
			>
				<label className={PICKER} onClick={(event) => event.stopPropagation()}>
					{control}
					{size}
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
