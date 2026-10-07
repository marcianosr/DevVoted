import { useId } from "react";

import { clsx } from "clsx";

import {
	Field,
	FIELD_CONTROL,
	FIELD_RING,
	type FieldCaption,
} from "./Field.ui";

const BOX = "flex w-full min-w-0 items-center";
const BOX_SIZE = { sm: "h-7 px-2", lg: "h-11 px-3" } as const;
const TEXT_SIZE = { sm: "text-xs", lg: "text-sm" } as const;

export type TextFieldType = "text" | "url";

export type TextFieldSize = keyof typeof BOX_SIZE;

export type TextFieldProps = {
	label: string;
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	note?: string;
	caption?: FieldCaption;
	type?: TextFieldType;
	maxLength?: number;
	size?: TextFieldSize;
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
	size = "sm",
}: TextFieldProps) => {
	const id = useId();
	const noteId = `${id}-note`;
	return (
		<Field id={id} label={label} note={note} noteId={noteId} caption={caption}>
			<span className={clsx(FIELD_RING, BOX, BOX_SIZE[size])}>
				<input
					id={id}
					type={type}
					value={value}
					placeholder={placeholder}
					maxLength={maxLength}
					aria-describedby={note === undefined ? undefined : noteId}
					onChange={(event) => onChange(event.target.value)}
					className={clsx(FIELD_CONTROL, TEXT_SIZE[size])}
				/>
			</span>
		</Field>
	);
};
