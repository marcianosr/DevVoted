import { Swatch, type SwatchFill } from "./Swatch.ui";

const CHIP =
	"inline-flex items-center gap-2 rounded-md bg-theme-raised px-2 py-0.5 text-xs font-bold text-theme-soft";
const SIZE = "small";

export type SwatchChipProps = { swatch: SwatchFill; label: string };

export const SwatchChip = ({ swatch, label }: SwatchChipProps) => (
	<span className={CHIP}>
		<Swatch {...swatch} size={SIZE} />
		{label}
	</span>
);
