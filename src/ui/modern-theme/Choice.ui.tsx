import type { ReactNode } from "react";

import { clsx } from "clsx";

import { Text } from "./Text.ui";
import type { ModernTone } from "./tones";

const CARD =
	"flex w-full cursor-pointer items-center gap-3 rounded-lg border border-edge bg-surface/40 px-4 py-2.5 transition-colors hover:border-control-edge has-[:checked]:border-theme has-[:checked]:bg-theme-soft";
const BLOCKED = "cursor-not-allowed opacity-50 hover:border-edge";

const CONTROL =
	"size-4 shrink-0 appearance-none rounded-full border border-control-edge transition-colors checked:border-theme checked:bg-theme checked:shadow-[inset_0_0_0_3px_var(--color-zinc-950)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cerulean";

const LABEL = "min-w-0 flex-1 truncate";
const STRUCK = "line-through";

export type ChoiceProps = {
	name: string;
	label: ReactNode;
	checked: boolean;
	onChange: (checked: boolean) => void;
	blocked?: boolean;
	note?: ReactNode;
	noteTone?: ModernTone;
};

export const Choice = ({
	name,
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
