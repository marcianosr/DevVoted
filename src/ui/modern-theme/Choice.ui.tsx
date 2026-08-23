import type { ReactNode } from "react";

import { clsx } from "clsx";

import { Letter } from "./Letter.ui";
import { Text } from "./Text.ui";
import type { ModernTone } from "./tones";

const CARD =
	"flex w-full cursor-pointer items-center gap-3 rounded-lg border border-edge bg-surface/40 px-4 py-2.5 transition-colors hover:border-control-edge has-[:checked]:border-theme has-[:checked]:bg-theme-soft";
const BLOCKED = "cursor-not-allowed opacity-50 hover:border-edge";

// The radio is the control; the letter is what you see it as. Hiding the native
// circle costs nothing as long as focus lands somewhere visible, which is what
// the peer-focus-visible ring below is for.
const CONTROL = "sr-only peer";
const MARKER =
	"peer-checked:border-theme peer-checked:bg-theme-soft peer-checked:text-theme peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-cerulean";

const LABEL = "min-w-0 flex-1 truncate";
const STRUCK = "line-through";

export type ChoiceProps = {
	name: string;
	letter: string;
	label: ReactNode;
	checked: boolean;
	onChange: (checked: boolean) => void;
	blocked?: boolean;
	note?: ReactNode;
	noteTone?: ModernTone;
};

export const Choice = ({
	name,
	letter,
	label,
	checked,
	onChange,
	blocked = false,
	note,
	noteTone = "cinnabar",
}: ChoiceProps) => (
	<label className={clsx(CARD, blocked && BLOCKED)}>
		<input
			type="radio"
			name={name}
			checked={checked}
			disabled={blocked}
			onChange={(event) => onChange(event.target.checked)}
			className={CONTROL}
		/>
		{/* A real space, or name computation runs the spans together and the radio
		    announces itself as "Aarr.slice(-2)". Flex drops whitespace-only nodes,
		    so nothing shifts. */}
		<Letter letter={letter} className={MARKER} />{" "}
		<Text size="body" className={clsx(LABEL, blocked && STRUCK)}>
			{label}
		</Text>
		{note ? (
			<>
				{" "}
				<Text size="meta" tone={noteTone}>
					{note}
				</Text>
			</>
		) : null}
	</label>
);
