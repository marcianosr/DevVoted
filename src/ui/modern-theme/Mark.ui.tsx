import { cva } from "class-variance-authority";

export type MarkVariant = "pass" | "warn" | "fail" | "idle";

const MARK =
	"inline-flex size-4 shrink-0 items-center justify-center rounded-full text-xs leading-none font-bold";

// A verdict is a filled disc with a dark glyph; idle is the only outline, since
// a config that is not running has no verdict to state.
const TONE = {
	pass: "bg-viridian text-black",
	warn: "bg-saffron text-black",
	fail: "bg-cinnabar text-black",
	idle: "border border-zinc-600 text-zinc-600",
} satisfies Record<MarkVariant, string>;

const GLYPH = {
	pass: "✓",
	warn: "!",
	fail: "✕",
	idle: "−",
} as const satisfies Record<MarkVariant, string>;

const SPOKEN = {
	pass: "passing",
	warn: "warning",
	fail: "failing",
	idle: "idle",
} as const satisfies Record<MarkVariant, string>;

const markVariants = cva(MARK, { variants: { variant: TONE } });

export const Mark = ({ variant }: { variant: MarkVariant }) => (
	<span
		role="img"
		aria-label={SPOKEN[variant]}
		className={markVariants({ variant })}
	>
		{GLYPH[variant]}
	</span>
);
