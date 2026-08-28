import { Fragment } from "react";

import { clsx } from "clsx";

import { Chip, type ChipTone } from "./Chip.ui";
import { signed, valueTone } from "./format";
import type { Rarity } from "./rarity";
import { Text } from "./Text.ui";

const PANEL = "flex flex-col gap-4 rounded-lg border border-edge px-5 py-4";

const FACTORS = "flex flex-wrap items-center gap-2";

const TOTAL = "flex items-baseline justify-between gap-6";
const DIVIDED = "border-t border-edge pt-4";

const PAID = "text-3xl font-bold tabular-nums";

const PAID_TONE = {
	celadon: "text-celadon",
	cinnabar: "text-cinnabar",
	muted: "text-pewter",
} as const;

const factorFigure = (value: number): string =>
	(Math.round(value * 100) / 100).toFixed(2).replace(/0$/, "");

export type FactorOp = "times" | "plus";

export type EquationFactor = {
	label: string;
	value: number;
	op?: FactorOp;
	tone?: ChipTone;
	rarity?: Rarity;
};

export type EquationProps = {
	factors: readonly EquationFactor[];
	paid: number;
};

const OPERATOR = { times: "×", plus: "+" } as const satisfies Record<
	FactorOp,
	string
>;

const figureOf = (factor: EquationFactor): string =>
	factor.op === "plus" ? signed(factor.value) : factorFigure(factor.value);

const FactorChip = ({ factor }: { factor: EquationFactor }) => {
	const label = `${factor.label} ${figureOf(factor)}`;
	if (factor.rarity) return <Chip rarity={factor.rarity}>{label}</Chip>;
	return <Chip tone={factor.tone ?? "raised"}>{label}</Chip>;
};

const Operator = ({ op }: { op: FactorOp }) => (
	<Text size="meta" tone="muted">
		{OPERATOR[op]}
	</Text>
);

const BRACKET = "text-zinc-600";

export const Equation = ({ factors, paid }: EquationProps) => {
	const [base, ...rest] = factors;
	const adds = rest.filter((factor) => factor.op === "plus");
	const times = rest.filter((factor) => factor.op !== "plus");
	const bracketed = adds.length > 0 && times.length > 0;

	return (
		<section className={PANEL}>
			{base ? (
				<div className={FACTORS}>
					{bracketed ? (
						<Text size="meta" className={BRACKET}>
							(
						</Text>
					) : null}
					<FactorChip factor={base} />
					{adds.map((factor) => (
						<Fragment key={factor.label}>
							<Operator op="plus" />
							<FactorChip factor={factor} />
						</Fragment>
					))}
					{bracketed ? (
						<Text size="meta" className={BRACKET}>
							)
						</Text>
					) : null}
					{times.map((factor) => (
						<Fragment key={factor.label}>
							<Operator op="times" />
							<FactorChip factor={factor} />
						</Fragment>
					))}
				</div>
			) : null}
			<div className={clsx(TOTAL, base !== undefined && DIVIDED)}>
				<Text size="body" tone="muted">
					this answer paid
				</Text>
				<span
					aria-label={`${signed(paid)}%`}
					className={clsx(PAID, PAID_TONE[valueTone(paid)])}
				>
					{signed(paid)}
					<span className="text-lg">%</span>
				</span>
			</div>
		</section>
	);
};
