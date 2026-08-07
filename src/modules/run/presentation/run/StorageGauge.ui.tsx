import { Paragraph } from "~/ui/typography/Paragraph.component";

type StorageGaugeProps = {
	usedKb: number;
	capKb: number;
};

const percentOf = (part: number, whole: number): number =>
	whole <= 0 ? 0 : Math.max(0, Math.min(100, (part / whole) * 100));

export const StorageGauge = ({ usedKb, capKb }: StorageGaugeProps) => {
	const used = Math.max(0, Math.min(usedKb, capKb));
	const free = Math.max(0, capKb - used);

	return (
		<span className="flex w-44 shrink-0 flex-col gap-1">
			<span className="flex items-baseline gap-1.5">
				<Paragraph as="span" className="text-2xl font-extrabold text-celadon">
					{free}
				</Paragraph>
				<Paragraph as="span" size="xs" tone="pewter">
					KB
				</Paragraph>
				<Paragraph as="span" size="xs" tone="faint">
					free
				</Paragraph>
			</span>
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
			{/* Both numbers carry the unit: "72 of 512 used" reads as a count of
			    something unnamed once the headline's KB has scrolled out of the eye. */}
			<Paragraph as="span" size="xs" tone="faint">
				{used}KB of {capKb}KB used
			</Paragraph>
		</span>
	);
};
