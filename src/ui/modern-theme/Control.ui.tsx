import type { ReactNode } from "react";

import { clsx } from "clsx";

import { Caret } from "./Caret.ui";
import { Glyph, type GlyphName } from "./Glyph.ui";
import { Text } from "./Text.ui";

// Two group names on one element: `entry` is what a PriceTag inside watches for
// its two-tap, `fold` is what the Caret watches to rotate. It is both.
const CONTROL = "group/entry group/fold rounded-lg border";

const FRAME = {
	dashed: "border-dashed border-zinc-700",
	solid: "border-edge",
};

const ROW = "flex items-start gap-3 p-3";
const SUMMARY =
	"cursor-pointer list-none rounded-lg transition-colors hover:bg-surface-raised focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cerulean [&::-webkit-details-marker]:hidden";

const DISC =
	"inline-flex size-6 shrink-0 items-center justify-center rounded-full border border-dashed border-zinc-700 text-zinc-500";
const BARE = "mt-0.5 text-zinc-500";

const BODY = "flex min-w-0 flex-1 flex-col gap-1";

// Clears the caret and the glyph, so the folded text hangs under the title.
const FACTS = "flex flex-col gap-1 px-3 pb-3 pl-12";
const HEADING = "flex flex-wrap items-baseline gap-2";

export type ControlFrame = keyof typeof FRAME;

export type ControlProps = {
	icon: GlyphName;
	title?: ReactNode;
	note?: ReactNode;
	children: ReactNode;
	footnote?: ReactNode;
	action: ReactNode;
	frame?: ControlFrame;
	defaultOpen?: boolean;
};

export const Control = ({
	icon,
	title,
	note,
	children,
	footnote,
	action,
	frame = "solid",
	defaultOpen = false,
}: ControlProps) => {
	const glyph =
		frame === "dashed" ? (
			<span className={DISC}>
				<Glyph name={icon} className="size-3" />
			</span>
		) : (
			<Glyph name={icon} className={BARE} />
		);

	if (title === undefined) {
		return (
			<div className={clsx(CONTROL, FRAME[frame], ROW)}>
				{glyph}
				<div className={BODY}>
					<Text as="p" size="meta" tone="muted">
						{children}
					</Text>
				</div>
				{action}
			</div>
		);
	}

	return (
		<details open={defaultOpen} className={clsx(CONTROL, FRAME[frame])}>
			<summary className={clsx(ROW, SUMMARY)}>
				<Caret />
				{glyph}
				<span className={clsx(BODY, HEADING)}>
					<Text size="body">{title}</Text>
					{note ? (
						<Text size="meta" tone="muted">
							{note}
						</Text>
					) : null}
				</span>
				{action}
			</summary>
			<div className={FACTS}>
				<Text as="p" size="meta" tone="muted">
					{children}
				</Text>
				{footnote ? (
					<Text as="p" size="xxs" tone="muted">
						{footnote}
					</Text>
				) : null}
			</div>
		</details>
	);
};
