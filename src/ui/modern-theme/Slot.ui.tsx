import { Row } from "./Row.ui";
import { Text } from "./Text.ui";

// Dashed, not solid: an open slot is a shape waiting to be filled rather than a
// config that happens to be blank.
const DISC =
	"inline-block size-4 shrink-0 rounded-full border border-dashed border-zinc-700";

export type SlotProps = {
	/** The gate whose clear opens it. Absent for a slot the run already owns. */
	gate?: number;
};

// One row per slot rather than a "slots 4–6 open" summary: the pipeline's width
// is the thing a build is planned around, and a column of six shows it at a
// glance where a sentence has to be counted.
export const Slot = ({ gate }: SlotProps) => (
	<Row
		spacing="compact"
		dimmed={gate !== undefined}
		leading={<span aria-hidden className={DISC} />}
	>
		{/* A step under a config's name: a slot is a gap in the list, not an item
		    competing with the ones that are really there. */}
		<Text size="meta" tone="muted">
			{gate === undefined ? "empty" : `opens at gate ${gate}`}
		</Text>
	</Row>
);
