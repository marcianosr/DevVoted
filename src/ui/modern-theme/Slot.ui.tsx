import { Row } from "./Row.ui";
import { Text } from "./Text.ui";

const DISC =
	"inline-block size-4 shrink-0 rounded-full border border-dashed border-zinc-700";

export type SlotProps = {
	gate?: number;
	coverage?: number;
};

const opensLabel = ({ gate, coverage }: SlotProps): string => {
	if (gate !== undefined && coverage !== undefined)
		return `Unlocks at gate ${gate} or ${coverage}% coverage`;
	if (gate !== undefined) return `opens when gate ${gate} clears`;
	return `Unlocks at ${coverage}% coverage`;
};

export const Slot = ({ gate, coverage }: SlotProps) => {
	const locked = gate !== undefined || coverage !== undefined;
	return (
		<Row
			spacing="compact"
			dimmed={locked}
			leading={<span aria-hidden className={DISC} />}
		>
			<Text size="meta" tone="muted">
				{locked ? opensLabel({ gate, coverage }) : "Not filled yet"}
			</Text>
		</Row>
	);
};
