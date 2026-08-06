import { Paragraph } from "~/ui/typography/Paragraph.component";

type StorageGaugeProps = {
	/** KB the run currently holds. */
	usedKb: number;
	/** The storage ceiling (`STORAGE_CAP_KB`). */
	capKb: number;
};

const percentOf = (part: number, whole: number): number =>
	whole <= 0 ? 0 : Math.max(0, Math.min(100, (part / whole) * 100));

/**
 * Storage read as headroom rather than hoard: the big number is what you have
 * left to spend, with the filled bar and caption carrying what is already
 * committed. Framing it as "free" matches the disk metaphor the currency is
 * built on, and it keeps the number that matters at shop time in the largest
 * type — income past the cap is discarded, so free space is the real budget.
 */
export const StorageGauge = ({ usedKb, capKb }: StorageGaugeProps) => {
	const used = Math.max(0, Math.min(usedKb, capKb));
	const free = Math.max(0, capKb - used);

	return (
		<span className="flex w-44 shrink-0 flex-col gap-1">
			<span className="flex items-baseline gap-1.5">
				<Paragraph as="span" className="text-2xl font-extrabold text-celadon">
					{free}
				</Paragraph>
				<Paragraph as="span" size="sm" tone="pewter">
					KB
				</Paragraph>
				<Paragraph as="span" size="sm" tone="faint">
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
			<Paragraph as="span" size="xs" tone="faint">
				{used} of {capKb} used
			</Paragraph>
		</span>
	);
};
