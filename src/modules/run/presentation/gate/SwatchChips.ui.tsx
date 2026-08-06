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

type SwatchChipsProps = {
	swatches: readonly GateSwatch[];
	/** Swatch ids the player owns; omit to show every chip as earned. */
	ownedIds?: readonly string[];
	/** Redact unearned names to `???`, the Polldex convention. */
	redactLocked?: boolean;
};

const chip = (swatch: GateSwatch, owned: boolean, redact: boolean) => {
	const themed = owned && hasThemeColor(swatch);
	return (
		<li
			key={swatch.id}
			{...(themed ? swatchTheme(swatch.theme) : {})}
			className={clsx(
				"flex items-center gap-2 rounded-lg border px-2 py-1",
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
		</li>
	);
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
		{swatches.map((swatch) =>
			chip(swatch, ownedIds ? ownedIds.includes(swatch.id) : true, redactLocked)
		)}
	</ul>
);
