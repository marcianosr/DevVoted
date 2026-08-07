import { clsx } from "clsx";

import {
	type GateSwatch,
	hasThemeColor,
} from "~/modules/run/gate/swatch.model";
import { SwatchMark, swatchNameClass } from "~/ui/SwatchMark.component";
import { swatchTheme } from "~/ui/theme/swatchTheme";

type SwatchLabelProps = {
	swatch: GateSwatch;
	/** What to call it here — the badge ("Boulder Swatch") or its gate. */
	label: string;
	size?: "sm" | "md" | "lg";
	testId?: string;
};

/**
 * A swatch's colour chip beside a name, in the swatch's own colour. Gates are
 * named after the badge they award, so the badge, its gate and its pip all read
 * in one colour wherever any of them appears — the reward report's payout line,
 * the shop's heading, the collection strips.
 *
 * Inline by design: it rides inside a sentence or a heading rather than owning a
 * line, and `align-middle` keeps the chip on the text's baseline when it does.
 */
export const SwatchLabel = ({
	swatch,
	label,
	size = "sm",
	testId,
}: SwatchLabelProps) => (
	<span
		data-testid={testId}
		{...(hasThemeColor(swatch) ? swatchTheme(swatch.theme) : {})}
		className="inline-flex items-center gap-1.5 align-middle"
	>
		<SwatchMark finish={swatch.finish} size={size} />
		<span className={clsx("font-bold", swatchNameClass(swatch.finish))}>
			{label}
		</span>
	</span>
);
