import { clsx } from "clsx";

import { TERMINAL_TONE, type TerminalTone } from "./tones";

export type PressProps = {
	label: string;
	tone?: TerminalTone;
	disabled?: boolean;
	onUse?: () => void;
};

export const Press = ({
	label,
	tone = "muted",
	disabled = false,
	onUse,
}: PressProps) => (
	<button
		type="button"
		disabled={disabled}
		onClick={onUse}
		className={clsx(
			"text-sm whitespace-nowrap transition-[filter] enabled:hover:brightness-150 disabled:cursor-not-allowed disabled:opacity-40",
			TERMINAL_TONE[tone]
		)}
	>
		{label}
	</button>
);
