import { clsx } from "clsx";

const BOX =
	"inline-flex size-5 shrink-0 items-center justify-center text-[0.625rem] leading-none ring-1 ring-inset transition-colors disabled:cursor-not-allowed disabled:opacity-40";
const SQUARE = "rounded-md";
const ROUND = "rounded-full";
const RESTING =
	"ring-theme-faint text-transparent enabled:hover:ring-theme-soft";
const PICKED = "press-theme press-theme-armed ring-theme-soft";

const PICK_COLOR = "cerulean";
const TICK = "✓";
const DOT = "●";

export type PickShape = "checkbox" | "radio";

export type PickProps = {
	label: string;
	checked: boolean;
	onToggle: () => void;
	disabled?: boolean;
	shape?: PickShape;
};

export const Pick = ({
	label,
	checked,
	onToggle,
	disabled,
	shape = "checkbox",
}: PickProps) => (
	<button
		type="button"
		role={shape}
		data-screen-theme={PICK_COLOR}
		aria-checked={checked}
		aria-label={label}
		disabled={disabled}
		onClick={onToggle}
		className={clsx(
			BOX,
			shape === "radio" ? ROUND : SQUARE,
			checked ? PICKED : RESTING
		)}
	>
		<span aria-hidden>{shape === "radio" ? DOT : TICK}</span>
	</button>
);
