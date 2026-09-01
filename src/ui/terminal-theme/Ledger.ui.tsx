import { Figures } from "./Figures.ui";
import { Row } from "./Row.ui";
import { Text } from "./Text.ui";

export type LedgerRow = {
	name: string;
	figure?: string;
	value?: string;
	muted?: boolean;
};

export type LedgerProps = {
	rows: readonly LedgerRow[];
};

const readingOf = (row: LedgerRow) => {
	if (row.figure !== undefined) return <Figures text={row.figure} />;
	return (
		<Text
			tone={row.muted ? "muted" : "default"}
			size={row.muted ? "base" : "title"}
			className={row.muted ? undefined : "font-bold"}
		>
			{row.value}
		</Text>
	);
};

export const Ledger = ({ rows }: LedgerProps) => (
	<div className="divide-y divide-edge">
		{rows.map((row) => (
			<Row key={row.name} name={row.name} trailing={readingOf(row)} />
		))}
	</div>
);
