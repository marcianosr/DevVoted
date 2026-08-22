import type { ReactNode } from "react";

import { clsx } from "clsx";

import { Definitions, type Definition } from "./Definitions.ui";
import { Dot } from "./Dot.ui";
import { Mark, type MarkVariant } from "./Mark.ui";
import { Row } from "./Row.ui";
import { Subtitle } from "./Subtitle.ui";
import type { SkinTone } from "./tones";

const LABEL = "truncate text-zinc-100";
const DETAIL = "truncate";
const DOT = "mr-1.5";
const VALUE = "font-bold tabular-nums";

const FACTS = "pb-1.5 pl-7";

// No chevron: the row is the hit target, so hover is what says it opens. The mark
// already sits where a caret would, and a caret-sized target is a missed tap.
const FOLD_ROW =
	"cursor-pointer list-none hover:bg-surface-raised [&::-webkit-details-marker]:hidden";

const DIMMED = "opacity-60";

export type EntryProps = {
	label: ReactNode;
	mark?: MarkVariant;
	dot?: SkinTone;
	detail?: ReactNode;
	value?: ReactNode;
	valueTone?: SkinTone;
	facts?: readonly Definition[];
	defaultOpen?: boolean;
	dimmed?: boolean;
};

export const Entry = ({
	label,
	mark,
	dot,
	detail,
	value,
	valueTone = "default",
	facts,
	defaultOpen = false,
	dimmed = false,
}: EntryProps) => {
	const foldable = Boolean(facts?.length);

	const row = (
		<Row
			as={foldable ? "summary" : "div"}
			className={foldable ? FOLD_ROW : undefined}
			dimmed={dimmed}
			leading={mark ? <Mark variant={mark} /> : null}
			trailing={
				value != null ? (
					<Subtitle tone={valueTone} className={VALUE}>
						{value}
					</Subtitle>
				) : null
			}
		>
			<span className={LABEL}>
				{dot ? <Dot tone={dot} className={DOT} /> : null}
				{label}
			</span>
			{detail ? <Subtitle className={DETAIL}>{detail}</Subtitle> : null}
		</Row>
	);

	if (!facts?.length) return row;

	return (
		<details open={defaultOpen}>
			{row}
			<div className={clsx(FACTS, dimmed && DIMMED)}>
				<Definitions items={facts} variant="nested" />
			</div>
		</details>
	);
};
