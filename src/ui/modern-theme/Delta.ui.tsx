import { Chip, type ChipTone } from "./Chip.ui";

export type DeltaProps =
	{ kb: number; unit?: boolean } | { multiplier: number };

const toneForKb = (kb: number): ChipTone => {
	if (kb === 0) return "muted";
	return kb < 0 ? "cinnabar" : "viridian";
};

const signKb = (kb: number) => `${kb < 0 ? "−" : "+"}${Math.abs(kb)}`;

export const Delta = (props: DeltaProps) => {
	// A multiplier is a gain, so it wears the same green a credit does. Against a
	// column of six configs the tint is what makes the earning ones countable
	// without reading a single word.
	if ("multiplier" in props) {
		return <Chip tone="viridian">×{props.multiplier}</Chip>;
	}

	// KB is the run's currency, so a bare number is the exception: `unit={false}`
	// is for a column tight enough that the unit is already understood.
	const { unit = true } = props;

	return (
		<Chip tone={toneForKb(props.kb)}>
			{signKb(props.kb)}
			{unit ? " KB" : null}
		</Chip>
	);
};
