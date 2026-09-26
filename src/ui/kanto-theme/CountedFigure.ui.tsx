import type { CSSProperties } from "react";

const COUNT = "figure-count tabular-nums";
const READER_ONLY = "sr-only";

type CountStyle = CSSProperties & Record<"--figure-count", number>;

const countStyle = (value: number): CountStyle => ({ "--figure-count": value });

export type CountedFigureProps = {
	value: number;
	unit?: string;
};

export const CountedFigure = ({ value, unit }: CountedFigureProps) => (
	<>
		<span aria-hidden className={COUNT} style={countStyle(value)} />
		<span className={READER_ONLY}>{value}</span>
		{unit === undefined ? null : <span>&nbsp;{unit}</span>}
	</>
);
