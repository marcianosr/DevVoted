import { clsx } from "clsx";

import { Meter } from "~/ui/Meter.ui";
import { Paragraph } from "~/ui/typography/Paragraph.component";

/**
 * `compact` is the HUD's gauge: a fixed column that must not grow into the stats
 * beside it. `wide` is the reward screen's, where the gauge owns its own line at
 * the foot of a centred column and a 176px bar would read as an orphan.
 */
type StorageGaugeLayout = "compact" | "wide";

const LAYOUT: Record<StorageGaugeLayout, string> = {
	compact: "w-44 shrink-0",
	wide: "w-full items-center text-center",
};

type StorageGaugeProps = {
	usedKb: number;
	capKb: number;
	layout?: StorageGaugeLayout;
};

export const StorageGauge = ({
	usedKb,
	capKb,
	layout = "compact",
}: StorageGaugeProps) => {
	const used = Math.max(0, Math.min(usedKb, capKb));

	return (
		<span className={clsx("flex flex-col gap-1", LAYOUT[layout])}>
			<Paragraph as="span" tone="muted" size="xs">
				Free tier
			</Paragraph>
			<Paragraph as="span" size="xs">
				{used} / {capKb} KB stored
			</Paragraph>
			<Meter
				cap={capKb}
				label="storage used"
				value={used}
				segments={[
					{ value: used, className: "rounded-full bg-zinc-400 transition-all" },
				]}
			/>
		</span>
	);
};
