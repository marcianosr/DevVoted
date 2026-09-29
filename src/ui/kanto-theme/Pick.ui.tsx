import { clsx } from "clsx";

const BOX =
	"inline-flex size-5 shrink-0 items-center justify-center rounded-md text-[0.625rem] leading-none ring-1 ring-inset transition-colors disabled:cursor-not-allowed disabled:opacity-40";
const RESTING =
	"ring-theme-faint text-transparent enabled:hover:ring-theme-soft";
const PICKED = "press-theme press-theme-armed ring-theme-soft";

const PICK_COLOR = "cerulean";
const TICK = "✓";

export type PickProps = {
	label: string;
	checked: boolean;
	onToggle: () => void;
	disabled?: boolean;
};

export const Pick = ({ label, checked, onToggle, disabled }: PickProps) => (
	<button
		type="button"
		role="checkbox"
		data-screen-theme={PICK_COLOR}
		aria-checked={checked}
		aria-label={label}
		disabled={disabled}
		onClick={onToggle}
		className={clsx(BOX, checked ? PICKED : RESTING)}
	>
		<span aria-hidden>{TICK}</span>
	</button>
);
