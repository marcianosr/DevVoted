import { useId } from "react";

import { clsx } from "clsx";

import {
	Field,
	FIELD_CONTROL,
	FIELD_RING,
	type FieldCaption,
} from "./Field.ui";

const BOX = "flex h-7 w-full min-w-0 items-center px-2";

export type TextFieldType = "text" | "url";

export type TextFieldProps = {
	label: string;
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	note?: string;
	caption?: FieldCaption;
	type?: TextFieldType;
	maxLength?: number;
};

export const TextField = ({
	label,
	value,
	onChange,
	placeholder,
	note,
	caption = "hidden",
	type = "text",
	maxLength,
}: TextFieldProps) => {
	const id = useId();
	const noteId = `${id}-note`;
	return (
		<Field id={id} label={label} note={note} noteId={noteId} caption={caption}>
			<span className={clsx(FIELD_RING, BOX)}>
				<input
					id={id}
					type={type}
					value={value}
					placeholder={placeholder}
					maxLength={maxLength}
					aria-describedby={note === undefined ? undefined : noteId}
					onChange={(event) => onChange(event.target.value)}
					className={FIELD_CONTROL}
				/>
			</span>
		</Field>
	);
};
