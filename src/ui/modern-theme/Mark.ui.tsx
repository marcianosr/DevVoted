import { cva } from "class-variance-authority";
import { clsx } from "clsx";

/** `blank` is excluded: it is the absence of a verdict, and callers that rank
 * verdicts must stay exhaustive over these four. */
export type MarkVerdict = "pass" | "warn" | "fail" | "idle";
export type MarkVariant = MarkVerdict | "blank";
export type MarkShape = "disc" | "box";

const MARK =
	"inline-flex size-4 shrink-0 items-center justify-center text-xs leading-none font-bold";

const SHAPE = {
	disc: "rounded-full",
	box: "rounded",
} satisfies Record<MarkShape, string>;

const TONE = {
	pass: "bg-celadon text-black",
	warn: "bg-saffron text-black",
	fail: "bg-cinnabar text-black",
	idle: "border border-zinc-600 text-zinc-600",
	blank: "border border-zinc-700",
} satisfies Record<MarkVariant, string>;

const GLYPH = {
	pass: "✓",
	warn: "!",
	fail: "✕",
	idle: "−",
} as const satisfies Record<MarkVerdict, string>;

const SPOKEN = {
	pass: "passing",
	warn: "warning",
	fail: "failing",
	idle: "idle",
} as const satisfies Record<MarkVerdict, string>;

const markVariants = cva(MARK, { variants: { variant: TONE, shape: SHAPE } });

export type MarkProps = { variant: MarkVariant; shape?: MarkShape };

export const Mark = ({ variant, shape = "disc" }: MarkProps) => {
	// An empty box on every ledger row would otherwise announce itself four times
	// before the first figure.
	if (variant === "blank")
		return (
			<span aria-hidden className={clsx(markVariants({ variant, shape }))} />
		);

	return (
		<span
			role="img"
			aria-label={SPOKEN[variant]}
			className={clsx(markVariants({ variant, shape }))}
		>
			{GLYPH[variant]}
		</span>
	);
};
