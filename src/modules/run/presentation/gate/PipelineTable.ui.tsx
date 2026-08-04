import type { ReactNode } from "react";

/**
 * The shared pipeline list: a three-column grid — state mark · config ·
 * counter — whose rows are subgrids, so every pipeline surface (configure,
 * answering, gate report, shop) lines its marks, names, and counters up the
 * same way on any screen width. Children are the rows: PipelineReportRow
 * layout="table" (collapsed one-liners that fold open on tap), empty slots,
 * and trailing controls spanning the grid via col-span-3.
 */
export const PipelineTable = ({ children }: { children: ReactNode }) => (
	<div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-x-4">
		{children}
	</div>
);
