import { clsx } from "clsx";
import type { SlotSwatch } from "~/modules/run/pipeline/swatch.model";
import { Swatch } from "~/ui/Swatch.component";
import { swatchTheme } from "~/ui/theme/swatchTheme";
import { Paragraph } from "~/ui/typography/Paragraph.component";

type SwatchChipsProps = {
	swatches: readonly SlotSwatch[];
	/** Swatch ids the player owns; omit to show every chip as earned. */
	ownedIds?: readonly string[];
	/** Redact unearned names to `???`, the Polldex convention. */
	redactLocked?: boolean;
};

const chip = (swatch: SlotSwatch, owned: boolean, redact: boolean) => (
	<li
		key={swatch.id}
		{...(swatch.legendary || !owned ? {} : swatchTheme(swatch.theme))}
		className={clsx(
			"flex items-center gap-2 rounded-lg border px-2 py-1",
			owned && swatch.legendary && "border-transparent legendary-ring",
			owned && !swatch.legendary && "border-theme",
			!owned && "border-dashed border-zinc-700"
		)}
	>
		{owned && swatch.legendary ? (
			<span className="inline-block h-3.5 w-3.5 rounded legendary-ring" />
		) : null}
		{owned && !swatch.legendary ? <Swatch /> : null}
		{owned ? null : (
			<span className="inline-block h-3.5 w-3.5 rounded bg-zinc-800" />
		)}
		<Paragraph
			as="span"
			size="xs"
			tone={owned ? "default" : "faint"}
			className={clsx(owned && !swatch.legendary && "text-theme")}
		>
			{owned || !redact ? swatch.name : "???"}
		</Paragraph>
	</li>
);

/**
 * A swatch collection strip: earned chips wear their badge color (the Elite
 * Four its legendary ring), unearned ones stay dashed and grey. Drives both the
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
