import { ALL_SWATCHES } from "~/modules/run/gate/domain/swatch.model";
import { SwatchChips } from "~/modules/run/gate/presentation/SwatchChips.ui";
import { Stack } from "~/ui/Stack.ui";
import { Paragraph } from "~/ui/typography/Paragraph.component";

type SwatchdexPanelProps = {
	ownedSwatchIds: readonly string[];
};

/**
 * The swatch collection: one chip per gate, earned by clearing that gate in any
 * run (ADR-019). Unearned entries stay dashed and redacted, the Polldex
 * convention — the ladder's shape is a spoiler-free goal.
 */
export const SwatchdexPanel = ({ ownedSwatchIds }: SwatchdexPanelProps) => (
	<Stack gap="6">
		<Paragraph tone="muted">
			{ownedSwatchIds.length}/{ALL_SWATCHES.length} collected
		</Paragraph>
		<Paragraph size="sm" tone="muted">
			Swatches can be obtained in runs when defeating gates. They prove you
			mastered gates!
		</Paragraph>
		<SwatchChips
			swatches={ALL_SWATCHES}
			ownedIds={ownedSwatchIds}
			redactLocked
		/>
	</Stack>
);
