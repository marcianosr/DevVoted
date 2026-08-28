import type { ReactNode } from "react";

import { clsx } from "clsx";

import { Letter, type LetterTone } from "./Letter.ui";
import { Text } from "./Text.ui";
import type { ModernTone } from "./tones";

const CARD =
	"flex w-full items-center gap-3 rounded-lg border border-edge bg-surface/40 px-4 py-2.5 transition-colors";
const LIVE =
	"cursor-pointer hover:border-control-edge has-[:checked]:border-theme has-[:checked]:bg-theme-soft";
const BLOCKED = "cursor-not-allowed opacity-50";
const SETTLED = "cursor-default";

const SETTLED_WASH = {
	celadon: "border-celadon/50 bg-celadon/10",
	cinnabar: "border-cinnabar/50 bg-cinnabar/10",
	muted: "opacity-50",
} satisfies Record<LetterTone, string>;

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
	settled?: boolean;
	letterTone?: LetterTone;
	note?: ReactNode;
	noteTone?: ModernTone;
	trailing?: ReactNode;
};

export const Choice = ({
	name,
	letter,
	label,
	checked,
	onChange,
	blocked = false,
	settled = false,
	letterTone,
	note,
	noteTone = "cinnabar",
	trailing,
}: ChoiceProps) => (
	<label
		className={clsx(
			CARD,
			!blocked && !settled && LIVE,
			blocked && BLOCKED,
			settled && SETTLED,
			settled && SETTLED_WASH[letterTone ?? "muted"]
		)}
	>
		<input
			type="radio"
			name={name}
			checked={checked}
			disabled={blocked || settled}
			onChange={(event) => onChange(event.target.checked)}
			className={CONTROL}
		/>
		<Letter
			letter={letter}
			tone={letterTone}
			className={settled ? undefined : MARKER}
		/>{" "}
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
		{trailing ? (
			<span className="flex shrink-0 items-center gap-1.5">{trailing}</span>
		) : null}
	</label>
);
