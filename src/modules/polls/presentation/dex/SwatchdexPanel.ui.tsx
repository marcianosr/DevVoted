import { ALL_SWATCHES } from "~/modules/run/pipeline/swatch.model";
import { SwatchChips } from "~/modules/run/presentation/gate/SwatchChips.ui";
import { Stack } from "~/ui/Stack.ui";
import { Paragraph } from "~/ui/typography/Paragraph.component";

type SwatchdexPanelProps = {
	ownedSwatchIds: readonly string[];
};

/**
 * The swatch collection: one chip per unlockable slot, earned by widening a
 * pipeline that far in any run. Unearned entries stay dashed and redacted, the
 * Polldex convention — the ladder's shape is a spoiler-free goal.
 */
export const SwatchdexPanel = ({ ownedSwatchIds }: SwatchdexPanelProps) => (
	<Stack gap="6">
		<Paragraph tone="muted">
			{ownedSwatchIds.length}/{ALL_SWATCHES.length} collected
		</Paragraph>
		<Paragraph size="sm" tone="muted">
			Each slot you unlock earns its gym-badge swatch — kept forever, across
			every run.
		</Paragraph>
		<SwatchChips
			swatches={ALL_SWATCHES}
			ownedIds={ownedSwatchIds}
			redactLocked
		/>
	</Stack>
);
