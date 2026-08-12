import type { ReactNode } from "react";
import { clsx } from "clsx";

import { Paragraph } from "~/ui/typography/Paragraph.component";

type PipelineTableProps = {
	children: ReactNode;
	/**
	 * Adds a leading gutter for slot numbers. Only the surfaces that *are* the
	 * pipeline's slots (configure, shop) number their rows; the gate report has
	 * no slots to count, and would only gain an empty indent.
	 */
	numbered?: boolean;
};

/**
 * The shared pipeline list: a three-column grid — state mark · config ·
 * counter — whose rows are subgrids, so every pipeline surface (configure,
 * answering, gate report, shop) lines its marks, names, and counters up the
 * same way on any screen width. Children are the rows: PipelineReportRow
 * layout="table" (collapsed one-liners that fold open on tap), empty slots,
 * and trailing controls spanning the grid.
 */
/**
 * A row's slot number in the leading gutter. A sibling cell rather than part of
 * the row, so a row's own box (the ghost's dashed border) never wraps it. No
 * explicit row: it auto-places beside the row it belongs to. `leading-6` lines
 * the digit up with the config chip on the row's first line rather than
 * centring it against the whole unfolded row.
 */
export const SlotNumberCell = ({ slot }: { slot: number }) => (
	<Paragraph
		as="span"
		size="xs"
		tone="faint"
		className="col-start-1 self-start py-2 leading-6 tabular-nums"
	>
		{slot}
	</Paragraph>
);

export const PipelineTable = ({
	children,
	numbered = false,
}: PipelineTableProps) => (
	<div
		className={clsx(
			"grid items-start gap-x-4",
			numbered
				? "grid-cols-[auto_auto_minmax(0,1fr)_auto]"
				: "grid-cols-[auto_minmax(0,1fr)_auto]"
		)}
	>
		{children}
	</div>
);
