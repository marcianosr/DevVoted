import { Figures } from "./Figures.ui";
import { Meter } from "./Meter.ui";
import { Row } from "./Row.ui";
import { Text } from "./Text.ui";

const READING = "flex flex-col items-end gap-1";
const VALUE_LINE = "flex items-baseline gap-1.5";

export type LedgerRow = {
	name: string;
	figure?: string;
	value?: string;
	from?: string;
	gauge?: {
		label: string;
		percent: number;
	};
	muted?: boolean;
};

export type LedgerProps = {
	rows: readonly LedgerRow[];
};

const readingOf = (row: LedgerRow) => {
	if (row.figure !== undefined) return <Figures text={row.figure} />;

	const value = (
		<span className={VALUE_LINE}>
			{row.from === undefined ? null : (
				<Text tone="faint" size="caption">
					{row.from} →
				</Text>
			)}
			<Text
				tone={row.muted ? "muted" : "default"}
				size={row.muted ? "base" : "title"}
				className={row.muted ? undefined : "font-bold"}
			>
				{row.value}
			</Text>
		</span>
	);

	if (row.gauge === undefined) return value;

	return (
		<span className={READING}>
			{value}
			<Meter
				percent={row.gauge.percent}
				label={row.gauge.label}
				className="w-24"
			/>
		</span>
	);
};

export const Ledger = ({ rows }: LedgerProps) => (
	<div className="divide-y divide-edge">
		{rows.map((row) => (
			<Row key={row.name} name={row.name} trailing={readingOf(row)} />
		))}
	</div>
);
