import { clsx } from "clsx";

import { Paragraph } from "~/ui/typography/Paragraph.component";

type StorageGaugeLayout = "compact" | "wide";

const LAYOUT: Record<StorageGaugeLayout, string> = {
	compact: "w-44 shrink-0",
	wide: "w-full items-center text-center",
};

type StorageGaugeProps = {
	usedKb: number;
	layout?: StorageGaugeLayout;
};

export const StorageGauge = ({
	usedKb,
	layout = "compact",
}: StorageGaugeProps) => (
	<span className={clsx("flex flex-col gap-1", LAYOUT[layout])}>
		<Paragraph as="span" size="xs">
			{usedKb} KB
		</Paragraph>
		<Paragraph as="span" tone="muted" size="xs">
			balance
		</Paragraph>
	</span>
);
