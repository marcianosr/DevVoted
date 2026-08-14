import { Meter } from "~/ui/Meter.ui";
import { Paragraph } from "~/ui/typography/Paragraph.component";

type StorageGaugeProps = {
	usedKb: number;
	capKb: number;
};

export const StorageGauge = ({ usedKb, capKb }: StorageGaugeProps) => {
	const used = Math.max(0, Math.min(usedKb, capKb));

	return (
		<span className="flex w-44 shrink-0 flex-col gap-1">
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
