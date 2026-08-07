import { clsx } from "clsx";
import {
	type GateSwatch,
	hasThemeColor,
} from "~/modules/run/gate/swatch.model";
import {
	SwatchMark,
	swatchBorderClass,
	swatchNameClass,
} from "~/ui/SwatchMark.component";
import { swatchTheme } from "~/ui/theme/swatchTheme";
import { Paragraph } from "~/ui/typography/Paragraph.component";

type SwatchChipProps = {
	swatch: GateSwatch;
	/** Unowned chips go dashed and grey — the collection surface's locked state. */
	owned?: boolean;
	/** Redact an unearned name to `???`, the Polldex convention. */
	redact?: boolean;
	testId?: string;
};

/**
 * One swatch as a bordered chip: its mark, its name, and a border in its own
 * badge colour. The single shape a swatch wears wherever it is *named* — the
 * collection strips and the gate's payout line alike — so the badge you just
 * won and the same badge in your collection are visibly one thing.
 *
 * A `span`, not an `li`: it sits inside the rewards list on one screen and owns
 * its own list item on another, and only the caller knows which.
 */
export const SwatchChip = ({
	swatch,
	owned = true,
	redact = false,
	testId,
}: SwatchChipProps) => {
	const themed = owned && hasThemeColor(swatch);
	return (
		<span
			data-testid={testId}
			{...(themed ? swatchTheme(swatch.theme) : {})}
			className={clsx(
				"inline-flex items-center gap-2 rounded-lg border px-2 py-1 align-middle",
				owned
					? swatchBorderClass(swatch.finish)
					: "border-dashed border-zinc-700"
			)}
		>
			{owned ? (
				<SwatchMark finish={swatch.finish} />
			) : (
				<span className="inline-block h-3.5 w-3.5 rounded bg-zinc-800" />
			)}
			<Paragraph
				as="span"
				size="xs"
				tone={owned ? "default" : "faint"}
				className={clsx(owned && swatchNameClass(swatch.finish))}
			>
				{owned || !redact ? swatch.name : "???"}
			</Paragraph>
		</span>
	);
};

type SwatchChipsProps = {
	swatches: readonly GateSwatch[];
	/** Swatch ids the player owns; omit to show every chip as earned. */
	ownedIds?: readonly string[];
	/** Redact unearned names to `???`, the Polldex convention. */
	redactLocked?: boolean;
};

/**
 * A swatch collection strip: earned chips wear their badge colour (the summit
 * pair their gradient), unearned ones stay dashed and grey. Drives both the
 * in-run "what you collected" lists and the account-wide collection surface.
 */
export const SwatchChips = ({
	swatches,
	ownedIds,
	redactLocked = false,
}: SwatchChipsProps) => (
	<ul className="flex flex-wrap gap-2">
		{swatches.map((swatch) => (
			<li key={swatch.id}>
				<SwatchChip
					swatch={swatch}
					owned={ownedIds ? ownedIds.includes(swatch.id) : true}
					redact={redactLocked}
				/>
			</li>
		))}
	</ul>
);
