import type { ReactNode } from "react";

import { clsx } from "clsx";

import { Caret } from "./Caret.ui";
import { Disclosure, DISCLOSURE_SUMMARY } from "./Disclosure.ui";
import { Glyph, type GlyphName } from "./Glyph.ui";
import { Text } from "./Text.ui";

const CONTROL = "rounded-lg border";

const FRAME = {
	dashed: "border-dashed border-zinc-700",
	solid: "border-edge",
};

const ROW = "flex items-start gap-3 p-3";
const SUMMARY = `${DISCLOSURE_SUMMARY} rounded-lg transition-colors hover:bg-surface-raised`;

const BARE = "mt-0.5 text-zinc-500";

const BODY = "flex min-w-0 flex-1 flex-col gap-1";

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
			<Glyph name={icon} framed />
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
		<Disclosure
			scope="entry"
			defaultOpen={defaultOpen}
			className={clsx(CONTROL, FRAME[frame])}
		>
			<summary className={clsx(ROW, SUMMARY)}>
				<Caret scope="entry" />
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
		</Disclosure>
	);
};
