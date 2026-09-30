import { Badge } from "./Badge.ui";

export const COPY = {
	run: "run",
	gate: "gate",
	of: "of",
	divider: "·",
} as const;

const READOUT = "flex flex-wrap items-center gap-2 text-xs text-theme-muted";

export type RunReadoutProps = {
	runNumber: number | null;
	gate: number;
	gates: number;
};

export const RunReadout = ({ runNumber, gate, gates }: RunReadoutProps) => (
	<span className={READOUT}>
		{runNumber === null ? null : (
			<>
				{COPY.run}
				<Badge>{`#${runNumber}`}</Badge>
				{COPY.divider}
			</>
		)}
		{COPY.gate}
		<Badge>{gate}</Badge>
		{COPY.of}
		<Badge>{gates}</Badge>
	</span>
);
