import { Row } from "./Row.ui";
import { Text } from "./Text.ui";

const DISC =
	"inline-block size-4 shrink-0 rounded-full border border-dashed border-zinc-700";

export type SlotProps = {
	gate?: number;
};

export const Slot = ({ gate }: SlotProps) => (
	<Row
		spacing="compact"
		dimmed={gate !== undefined}
		leading={<span aria-hidden className={DISC} />}
	>
		<Text size="meta" tone="muted">
			{gate === undefined ? "empty" : `opens when gate ${gate} clears`}
		</Text>
	</Row>
);
