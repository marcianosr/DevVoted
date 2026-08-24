import { Chip } from "./Chip.ui";
import { signed, valueTone } from "./format";

export type DeltaProps =
	| { kb: number }
	| { multiplier: number }
	| { coverage: number }
	| { percent: number };

export const Delta = (props: DeltaProps) => {
	if ("multiplier" in props) {
		return <Chip tone="celadon">×{props.multiplier}</Chip>;
	}

	// Coverage wears no suffix, the way a Ledger row states one — the column it
	// sits in already says what the figure is.
	if ("coverage" in props) {
		return (
			<Chip tone={valueTone(props.coverage)}>{signed(props.coverage)}</Chip>
		);
	}

	// Suffixed where coverage is not: a bare figure in a config row would read as
	// coverage, and a percentage of held storage is a different axis entirely.
	if ("percent" in props) {
		return (
			<Chip tone={valueTone(props.percent)}>{signed(props.percent)}%</Chip>
		);
	}

	return <Chip tone={valueTone(props.kb)}>{signed(props.kb)} KB</Chip>;
};
