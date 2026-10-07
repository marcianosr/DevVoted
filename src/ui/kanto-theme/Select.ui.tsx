import { useId } from "react";

import { clsx } from "clsx";

import { Field, FIELD_RING, type FieldCaption } from "./Field.ui";
import { Icon } from "./Icon.ui";

const BOX = "relative flex h-7 w-full min-w-0 items-center";
const SELECT =
	"h-full w-full cursor-pointer appearance-none bg-transparent pr-7 text-xs font-bold outline-none scheme-dark";
const SELECT_PAD = { stacked: "pl-2", inline: "pl-1.5" } as const;
const INLINE_LABEL = "shrink-0 pl-2 text-xs text-theme-muted";
const CHEVRON =
	"pointer-events-none absolute right-2 size-3.5 rotate-90 text-theme-muted";

export type SelectOption = { value: string; label: string };

export type SelectLook = keyof typeof SELECT_PAD;

export type SelectProps = {
	label: string;
	value: string;
	options: readonly SelectOption[];
	onChange: (value: string) => void;
	note?: string;
	caption?: FieldCaption;
	look?: SelectLook;
	placeholder?: string;
};

export const Select = ({
	label,
	value,
	options,
	onChange,
	note,
	caption = "hidden",
	look = "stacked",
	placeholder,
}: SelectProps) => {
	const id = useId();
	const noteId = `${id}-note`;
	return (
		<Field id={id} label={label} note={note} noteId={noteId} caption={caption}>
			<span className={clsx(FIELD_RING, BOX)}>
				{look === "inline" ? (
					<span aria-hidden className={INLINE_LABEL}>
						{label}
					</span>
				) : null}
				<select
					id={id}
					value={value}
					aria-describedby={note === undefined ? undefined : noteId}
					onChange={(event) => onChange(event.target.value)}
					className={clsx(SELECT, SELECT_PAD[look])}
				>
					{placeholder === undefined ? null : (
						<option value="" disabled>
							{placeholder}
						</option>
					)}
					{options.map((option) => (
						<option key={option.value} value={option.value}>
							{option.label}
						</option>
					))}
				</select>
				<Icon name="chevron" className={CHEVRON} />
			</span>
		</Field>
	);
};
