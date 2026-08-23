import { Chip, type ChipTone } from "./Chip.ui";

export type DeltaProps =
	{ kb: number; unit?: boolean } | { multiplier: number };

const toneForKb = (kb: number): ChipTone => {
	if (kb === 0) return "muted";
	return kb < 0 ? "cinnabar" : "celadon";
};

const signKb = (kb: number) => `${kb < 0 ? "−" : "+"}${Math.abs(kb)}`;

export const Delta = (props: DeltaProps) => {
	if ("multiplier" in props) {
		return <Chip tone="celadon">×{props.multiplier}</Chip>;
	}

	const { unit = true } = props;

	return (
		<Chip tone={toneForKb(props.kb)}>
			{signKb(props.kb)}
			{unit ? " KB" : null}
		</Chip>
	);
};
