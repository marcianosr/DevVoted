import { clsx } from "clsx";

export type PriceTagVariant =
	"pay" | "short" | "armed" | "recurring" | "bill" | "receive";

const VARIANT = {
	pay: "bg-saffron/15 text-saffron",
	short: "bg-zinc-100/5 text-zinc-500",
	armed: "bg-saffron/30 text-pallet",
	recurring: "bg-saffron/15 text-saffron",
	bill: "bg-cinnabar/20 text-vermillion",
	receive: "bg-viridian/15 text-celadon",
} satisfies Record<PriceTagVariant, string>;

const TAG =
	"inline-flex shrink-0 items-center gap-1.5 py-px text-xs tabular-nums whitespace-nowrap transition-colors disabled:cursor-not-allowed";
const POINTS_OUT =
	"pr-2.5 pl-3 [clip-path:polygon(6px_0,100%_0,100%_100%,6px_100%,0_50%)]";
const POINTS_IN =
	"pr-3 pl-2.5 [clip-path:polygon(0_0,calc(100%_-_6px)_0,100%_50%,calc(100%_-_6px)_100%,0_100%)]";
const NOTCH = "size-1 rounded-full bg-current opacity-70";
const UNIT = /\b(KB|MB)\b/;
const UNIT_TEXT = "ml-0.5";

const spellPrice = (label: string) =>
	label
		.split(UNIT)
		.filter((part) => part !== "")
		.map((part, index) =>
			UNIT.test(part) ? (
				<span key={`${part}-${index}`} className={UNIT_TEXT}>
					{part}
				</span>
			) : (
				<span key={`${part}-${index}`}>{part}</span>
			)
		);

export type PriceTagProps = {
	label: string;
	variant?: PriceTagVariant;
	disabled?: boolean;
	className?: string;
	onUse?: () => void;
};

export const PriceTag = ({
	label,
	variant = "pay",
	disabled = false,
	className,
	onUse,
}: PriceTagProps) => {
	const pointsIn = variant === "receive";
	const notch = <span aria-hidden className={NOTCH} />;
	const spelled = spellPrice(label);
	const shape = clsx(TAG, pointsIn ? POINTS_IN : POINTS_OUT, VARIANT[variant]);
	const body = pointsIn ? (
		<>
			{spelled}
			{notch}
		</>
	) : (
		<>
			{notch}
			{spelled}
		</>
	);

	if (onUse === undefined) {
		return <span className={clsx(shape, className)}>{body}</span>;
	}

	return (
		<button
			type="button"
			disabled={disabled}
			onClick={onUse}
			className={clsx(shape, "enabled:hover:brightness-125", className)}
		>
			{body}
		</button>
	);
};
