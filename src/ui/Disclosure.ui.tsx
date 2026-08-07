import type { ReactNode } from "react";

import { clsx } from "clsx";

import { Paragraph } from "~/ui/typography/Paragraph.component";

/**
 * A tail of content folded behind one faint line.
 *
 * Native `<details>` rather than state: the fold survives a re-render, works
 * before hydration, and gives the summary keyboard and screen-reader behaviour
 * for free. The caret is the only affordance — a tail is not a button, it is the
 * rest of a list that did not earn its space by default.
 *
 * Named `group/disclosure` so a caller can nest one inside its own `group`
 * without the two carets rotating together.
 */
export type DisclosureProps = {
	/** The always-visible line. Rendered inside a faint Paragraph, caret appended. */
	summary: ReactNode;
	children: ReactNode;
	defaultOpen?: boolean;
	className?: string;
};

export const Disclosure = ({
	summary,
	children,
	defaultOpen = false,
	className,
}: DisclosureProps) => (
	<details className={clsx("group/disclosure", className)} open={defaultOpen}>
		<summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">
			<Paragraph as="span" tone="faint">
				{summary}{" "}
				<span
					aria-hidden
					className="inline-block transition-transform group-open/disclosure:rotate-90"
				>
					▸
				</span>
			</Paragraph>
		</summary>
		<div className="pt-2">{children}</div>
	</details>
);
