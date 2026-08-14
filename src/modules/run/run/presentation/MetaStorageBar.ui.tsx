import { Meter } from "~/ui/Meter.ui";
import { Paragraph } from "~/ui/typography/Paragraph.component";
import { Subtitle } from "~/ui/typography/Subtitle.component";

type MetaStorageBarProps = {
	/** KB banked into the persistent meta archive for the next run. */
	carriedKb: number;
	/** Total leftover KB the run ended with (carried + lost). */
	totalKb: number;
};

// The bar's width comes from Meter; this rounds the same share for the caption,
// where "37%" reads better than the exact fraction the fill uses.
const percentLabel = (part: number, whole: number): number =>
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
	const percent = percentLabel(carried, total);

	return (
		<section className="flex flex-col gap-2">
			<Subtitle>Stored in meta storage</Subtitle>
			<Paragraph as="span" size="xs" tone="muted">
				archived to next run
			</Paragraph>
			<Meter
				cap={total}
				segments={[
					{ value: carried, className: "rounded bg-saffron transition-all" },
				]}
				trackClassName="h-2 rounded"
			/>
			<div className="flex items-baseline justify-between gap-3">
				<Paragraph as="span" size="sm" tone="saffron" className="font-bold">
					{carried}KB carried{" "}
					<span className="font-normal text-pewter">
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
