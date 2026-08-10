import { Paragraph } from "~/ui/typography/Paragraph.component";

type StorageGaugeProps = {
	usedKb: number;
	capKb: number;
};

const percentOf = (part: number, whole: number): number =>
	whole <= 0 ? 0 : Math.max(0, Math.min(100, (part / whole) * 100));

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
			<span
				role="progressbar"
				aria-label="storage used"
				aria-valuenow={used}
				aria-valuemin={0}
				aria-valuemax={capKb}
				className="block h-1.5 w-full overflow-hidden rounded-full bg-zinc-800"
			>
				<span
					className="block h-full rounded-full bg-zinc-400 transition-all"
					style={{ width: `${percentOf(used, capKb)}%` }}
				/>
			</span>
		</span>
	);
};
