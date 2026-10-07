import type { ReactNode } from "react";

import { clsx } from "clsx";

import { Typography } from "./Typography.ui";

export const FIELD_RING =
	"rounded-md text-theme-faint ring-1 ring-inset ring-theme-faint transition-colors focus-within:ring-theme-soft";
export const FIELD_CONTROL =
	"min-w-0 flex-1 bg-transparent font-bold outline-none placeholder:font-normal placeholder:text-theme-muted";

const STACK = "flex min-w-0 flex-col gap-1.5";
const CAPTION = "flex flex-wrap items-baseline gap-x-2";
const HIDDEN = "sr-only";

export type FieldCaption = "shown" | "hidden";

export type FieldProps = {
	id: string;
	label: string;
	note?: string;
	noteId: string;
	caption: FieldCaption;
	children: ReactNode;
};

export const Field = ({
	id,
	label,
	note,
	noteId,
	caption,
	children,
}: FieldProps) => (
	<span className={STACK}>
		<span className={clsx(CAPTION, caption === "hidden" && HIDDEN)}>
			<label htmlFor={id}>
				<Typography variant="label">{label}</Typography>
			</label>
			{note === undefined ? null : (
				<span id={noteId}>
					<Typography variant="hint" as="span">
						{note}
					</Typography>
				</span>
			)}
		</span>
		{children}
	</span>
);
