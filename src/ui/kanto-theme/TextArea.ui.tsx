import { useId } from "react";

import { clsx } from "clsx";

import {
	Field,
	FIELD_CONTROL,
	FIELD_RING,
	type FieldCaption,
} from "./Field.ui";

const BOX = "flex w-full min-w-0 flex-col gap-1 px-2 py-1.5";
const AREA = "w-full text-xs leading-relaxed";
const AREA_SIZE = {
	regular: "min-h-32 resize-y",
	fit: "field-sizing-content min-h-0 resize-none",
} as const;
const COUNT = "self-end text-[10px] tabular-nums text-theme-faint";
const COUNT_OVER = "text-saffron";

export type TextAreaSize = keyof typeof AREA_SIZE;
const DEFAULT_ROWS = 4;

export type TextAreaProps = {
	label: string;
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	note?: string;
	caption?: FieldCaption;
	rows?: number;
	maxLength?: number;
	limit?: number;
	size?: TextAreaSize;
};

export const TextArea = ({
	label,
	value,
	onChange,
	placeholder,
	note,
	caption = "hidden",
	rows = DEFAULT_ROWS,
	maxLength,
	limit,
	size = "regular",
}: TextAreaProps) => {
	const id = useId();
	const noteId = `${id}-note`;
	return (
		<Field id={id} label={label} note={note} noteId={noteId} caption={caption}>
			<span className={clsx(FIELD_RING, BOX)}>
				<textarea
					id={id}
					value={value}
					placeholder={placeholder}
					rows={rows}
					maxLength={maxLength}
					aria-describedby={note === undefined ? undefined : noteId}
					onChange={(event) => onChange(event.target.value)}
					className={clsx(FIELD_CONTROL, AREA, AREA_SIZE[size])}
				/>
				{limit === undefined ? null : (
					<span
						aria-hidden
						className={clsx(COUNT, value.length > limit && COUNT_OVER)}
					>
						{value.length}/{limit}
					</span>
				)}
			</span>
		</Field>
	);
};
