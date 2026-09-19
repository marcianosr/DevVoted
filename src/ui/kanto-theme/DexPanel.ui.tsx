import type { ReactNode } from "react";

import { Badge } from "./Badge.ui";
import { Panel } from "./Panel.ui";
import { Typography } from "./Typography.ui";

/**
 * The shell every Dex tab wears: a counted header and a footer stating the rule
 * that governs the collection. Only the body differs, so only the body is
 * passed in.
 *
 * The count rides in `meta` rather than in the header's own `badge` slot, which
 * would seat it left of the axis line; on a collection screen the tally is the
 * last thing read, not the first.
 */
export type DexPanelProps = {
	label: string;
	/** Held against the roster, e.g. "187 of 423". */
	count: string;
	/** The axis the tab is read along, e.g. "12 categories". */
	meta: string;
	/** How a thing enters this collection. */
	note: string;
	children: ReactNode;
};

export const DexPanel = ({
	label,
	count,
	meta,
	note,
	children,
}: DexPanelProps) => (
	<Panel>
		<Panel.Header
			label={label}
			meta={
				<>
					{meta}
					<Badge>{count}</Badge>
				</>
			}
		/>
		{children}
		<Panel.Footer>
			<Typography variant="hint">{note}</Typography>
		</Panel.Footer>
	</Panel>
);
