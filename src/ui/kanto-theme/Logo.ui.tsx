import { clsx } from "clsx";
import type { ReactNode } from "react";

const COPY = { name: "devvoted" } as const;

const LOCKUP = "inline-flex items-center gap-[0.65em] font-bold";
const MARK = "size-[1.3em] shrink-0 text-brand-sand";
const WORD = "text-brand-bone leading-none";
const HIDDEN = "sr-only";
const STACK = "flex min-w-0 flex-col gap-1.5";

export type LogoSize = "sm" | "md" | "lg";

const SIZE = {
	sm: "text-sm",
	md: "text-xl",
	lg: "text-display",
} satisfies Record<LogoSize, string>;

export type LogoProps = {
	size?: LogoSize;
	markOnly?: boolean;
	below?: ReactNode;
};

const Mark = () => (
	<svg
		aria-hidden
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		className={MARK}
	>
		<rect
			x="1"
			y="1"
			width="22"
			height="22"
			rx="5"
			strokeDasharray="4.41 2.21"
			strokeDashoffset="2.21"
		/>
	</svg>
);

const Word = ({ markOnly }: Required<Pick<LogoProps, "markOnly">>) => (
	<span className={markOnly ? HIDDEN : WORD}>{COPY.name}</span>
);

export const Logo = ({ size = "md", markOnly = false, below }: LogoProps) => (
	<span className={clsx(LOCKUP, SIZE[size])}>
		<Mark />
		{below === undefined ? (
			<Word markOnly={markOnly} />
		) : (
			<span className={STACK}>
				<Word markOnly={markOnly} />
				{below}
			</span>
		)}
	</span>
);
