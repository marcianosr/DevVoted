import { useId } from "react";

import { clsx } from "clsx";

import {
	Field,
	FIELD_CONTROL,
	FIELD_RING,
	type FieldCaption,
} from "./Field.ui";

const BOX = "flex w-full min-w-0 px-2 py-1.5";
const AREA = "min-h-32 w-full resize-y leading-relaxed";
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
					className={clsx(FIELD_CONTROL, AREA)}
				/>
			</span>
		</Field>
	);
};
