import { clsx } from "clsx";

const PRESS =
	"inline-flex h-7 shrink-0 cursor-pointer items-center gap-2 rounded-md px-2 text-xs ring-1 ring-inset ring-theme-faint transition-colors hover:ring-theme-soft focus-visible:outline-none focus-visible:ring-theme-soft";
const TRACK =
	"relative inline-flex h-4 w-7 shrink-0 items-center rounded-full transition-colors";
const TRACK_ON = "bg-theme";
const TRACK_OFF = "bg-edge-strong";
const KNOB = "absolute size-3 rounded-full bg-pallet transition-transform";
const KNOB_ON = "translate-x-3.5";
const KNOB_OFF = "translate-x-0.5";
const LABEL = {
	on: "font-bold text-theme-soft",
	off: "text-theme-faint",
} as const;
const COUNT = "tabular-nums text-theme-muted";

export type SwitchProps = {
	label: string;
	checked: boolean;
	count?: number;
	onChange: (checked: boolean) => void;
};

export const Switch = ({ label, checked, count, onChange }: SwitchProps) => (
	<button
		type="button"
		role="switch"
		aria-checked={checked}
		aria-label={count === undefined ? label : `${label} ${count}`}
		onClick={() => onChange(!checked)}
		className={PRESS}
	>
		<span aria-hidden className={clsx(TRACK, checked ? TRACK_ON : TRACK_OFF)}>
			<span className={clsx(KNOB, checked ? KNOB_ON : KNOB_OFF)} />
		</span>
		<span aria-hidden className={checked ? LABEL.on : LABEL.off}>
			{label}
		</span>
		{count === undefined ? null : (
			<span aria-hidden className={COUNT}>
				{count}
			</span>
		)}
	</button>
);
