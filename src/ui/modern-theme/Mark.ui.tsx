import { cva } from "class-variance-authority";
import { clsx } from "clsx";

/** The four a config can be scored as. `blank` is deliberately not one of
 * them: it is the absence of a verdict, and callers that rank verdicts (the
 * poll screen's worst-status rail) must stay exhaustive over these four only. */
export type MarkVerdict = "pass" | "warn" | "fail" | "idle";
export type MarkVariant = MarkVerdict | "blank";
export type MarkShape = "disc" | "box";

const MARK =
	"inline-flex size-4 shrink-0 items-center justify-center text-xs leading-none font-bold";

// Shape carries what is being marked, not how it went: a disc is a config's
// verdict, a box is one of the poll categories a window was drawn from.
const SHAPE = {
	disc: "rounded-full",
	box: "rounded",
} satisfies Record<MarkShape, string>;

// A verdict is a filled disc with a dark glyph; idle is the only outline, since
// a config that is not running has no verdict to state.
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
	// blank states nothing, so it says nothing: an empty box on every row of a
	// ledger would otherwise announce itself four times before the first figure.
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
