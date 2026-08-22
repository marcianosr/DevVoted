import type { ReactNode } from "react";

import { cva } from "class-variance-authority";
import { clsx } from "clsx";

import { CURSOR_BLOCKED, CURSOR_PICKABLE } from "./cursors";
import { Row } from "./Row.ui";
import { Subtitle } from "./Subtitle.ui";
import type { SkinTone } from "./tones";

// A drawn native input, not a hidden one: the ring is ours, the focus, keyboard
// and announcement stay the browser's. The inset shadow punches the hole.
const CONTROL =
	"size-4 shrink-0 appearance-none border border-control-edge transition-colors checked:border-theme checked:bg-theme checked:shadow-[inset_0_0_0_3px_var(--color-surface)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cerulean";

const SHAPE = { true: "rounded-sm", false: "rounded-full" };

const ROW = "transition-colors";
const PICKABLE = "hover:bg-surface-raised";
// A picked row wears the gate tint, so the chosen answer reads at a glance and
// not only through a 16px control.
const PICKED = "bg-theme-soft";
const LABEL = "truncate text-zinc-100";
const STRUCK = "line-through";

const controlVariants = cva(CONTROL, { variants: { multiple: SHAPE } });

export type ChoiceProps = {
	name: string;
	label: ReactNode;
	checked: boolean;
	onChange: (checked: boolean) => void;
	multiple?: boolean;
	disabled?: boolean;
	note?: ReactNode;
	noteTone?: SkinTone;
};

export const Choice = ({
	name,
	label,
	checked,
	onChange,
	multiple = false,
	disabled = false,
	note,
	noteTone = "cinnabar",
}: ChoiceProps) => (
	<Row
		as="label"
		spacing="spacious"
		dimmed={disabled}
		className={clsx(
			ROW,
			checked && PICKED,
			disabled ? CURSOR_BLOCKED : clsx(CURSOR_PICKABLE, PICKABLE)
		)}
		leading={
			<input
				type={multiple ? "checkbox" : "radio"}
				name={name}
				checked={checked}
				disabled={disabled}
				onChange={(event) => onChange(event.target.checked)}
				className={controlVariants({ multiple })}
			/>
		}
		trailing={note ? <Subtitle tone={noteTone}>{note}</Subtitle> : null}
	>
		<span className={clsx(LABEL, disabled && STRUCK)}>{label}</span>
	</Row>
);
