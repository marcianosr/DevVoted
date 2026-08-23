import { clsx } from "clsx";

const LOCK =
	"relative inline-flex size-4 shrink-0 items-center justify-center rounded-full border transition-colors before:absolute before:-inset-1.5 before:content-['']";
const PRESSABLE =
	"focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cerulean";

export type LockState = "unlocked" | "locked" | "unavailable";

const STATE = {
	unlocked:
		"border-zinc-700 text-zinc-500 hover:border-zinc-500 hover:text-zinc-300",
	locked: "border-saffron text-saffron hover:bg-saffron/10",
	unavailable: "border-zinc-800 text-zinc-800",
} satisfies Record<LockState, string>;

const Padlock = () => (
	<svg
		viewBox="0 0 14 14"
		aria-hidden
		className="size-2.5"
		fill="none"
		stroke="currentColor"
		strokeWidth="1.4"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<rect x="3" y="6.25" width="8" height="5.25" rx="1.2" />
		<path d="M5.1 6.25V4.6a1.9 1.9 0 0 1 3.8 0v1.65" />
	</svg>
);

export type LockProps = { on: string } & (
	| { state: "unlocked"; cost: string; onToggle: () => void }
	| { state: "locked"; onToggle: () => void; cost?: never }
	| { state: "unavailable"; onToggle?: never; cost?: never }
);

export const Lock = (props: LockProps) => {
	if (props.state === "unavailable") {
		return <span aria-hidden className={clsx(LOCK, STATE.unavailable)} />;
	}

	const label =
		props.state === "locked"
			? `Release ${props.on}`
			: `Lock ${props.on} for ${props.cost}`;

	return (
		<button
			type="button"
			aria-pressed={props.state === "locked"}
			aria-label={label}
			onClick={(event) => {
				event.stopPropagation();
				props.onToggle();
			}}
			className={clsx(LOCK, PRESSABLE, STATE[props.state])}
		>
			<Padlock />
		</button>
	);
};
