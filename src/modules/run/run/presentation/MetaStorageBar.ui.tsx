import { Paragraph } from "~/ui/typography/Paragraph.component";
import { Subtitle } from "~/ui/typography/Subtitle.component";

type MetaStorageBarProps = {
	/** KB banked into the persistent meta archive for the next run. */
	carriedKb: number;
	/** Total leftover KB the run ended with (carried + lost). */
	totalKb: number;
};

const percentOf = (part: number, whole: number): number =>
	whole <= 0 ? 0 : Math.round((part / whole) * 100);

/**
 * How much of a finished run's leftover storage banks into the player's
 * persistent meta archive versus what is lost — the further the climb got, the
 * larger the carried share (see `storageCreditRate`).
 */
export const MetaStorageBar = ({ carriedKb, totalKb }: MetaStorageBarProps) => {
	const carried = Math.round(carriedKb);
	const total = Math.round(totalKb);
	const lost = Math.max(0, total - carried);
	const percent = percentOf(carried, total);

	return (
		<section className="flex flex-col gap-2">
			<Subtitle>Stored in meta storage</Subtitle>
			<Paragraph as="span" size="xs" tone="muted">
				archived to next run
			</Paragraph>
			<div className="h-2 w-full overflow-hidden rounded bg-zinc-800">
				<div
					className="h-full rounded bg-saffron transition-all"
					style={{ width: `${percent}%` }}
				/>
			</div>
			<div className="flex items-baseline justify-between gap-3">
				<Paragraph as="span" size="sm" tone="saffron" className="font-bold">
					{carried}KB carried{" "}
					<span className="font-normal text-zinc-400">
						· {percent}% of {total}KB
					</span>
				</Paragraph>
				<Paragraph as="span" size="sm" tone="muted">
					{lost}KB lost
				</Paragraph>
			</div>
		</section>
	);
};
