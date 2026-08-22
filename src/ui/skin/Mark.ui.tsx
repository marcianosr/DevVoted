import { cva } from "class-variance-authority";

// Variant names are StatusBadge's, so a row and a verdict badge cannot disagree
// about what "part" means.
export type MarkVariant = "pass" | "part" | "fail" | "skip" | "run";

const MARK =
	"inline-flex size-4 shrink-0 items-center justify-center rounded-full text-xs leading-none font-bold";

// Solid fills carry black glyphs; skip is the only outline, since a dead config
// has no verdict to shout.
const FILL = {
	pass: "bg-viridian text-black",
	part: "bg-saffron text-black",
	fail: "bg-cinnabar text-black",
	skip: "border border-edge-strong text-pewter",
	run: "bg-cerulean text-black",
} satisfies Record<MarkVariant, string>;

const GLYPH = {
	pass: "✓",
	part: "!",
	fail: "✕",
	skip: "–",
	run: "▸",
} as const satisfies Record<MarkVariant, string>;

const SPOKEN = {
	pass: "passing",
	part: "warning",
	fail: "failing",
	skip: "skipped",
	run: "running",
} as const satisfies Record<MarkVariant, string>;

const markVariants = cva(MARK, { variants: { variant: FILL } });

export const Mark = ({ variant }: { variant: MarkVariant }) => (
	<span
		role="img"
		aria-label={SPOKEN[variant]}
		className={markVariants({ variant })}
	>
		{GLYPH[variant]}
	</span>
);
