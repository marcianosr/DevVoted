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

/** Factors are read, not summed: "1.25", never "+1.25". Two decimals at most,
 * and a whole factor keeps one so "correct 1.0" still reads as a figure. */
const factorFigure = (value: number): string =>
	(Math.round(value * 100) / 100).toFixed(2).replace(/0$/, "");

/**
 * How a factor joins the chain. `plus` is for a config that adds a flat amount
 * rather than multiplying: it carries the coverage it actually contributed —
 * the same figure its rail row badges — so the two surfaces never quote one
 * config two ways. Adds land before the multipliers, grouped, because that is
 * the order the earn is computed in: `(base + adds) × multipliers`.
 */
export type FactorOp = "times" | "plus";

export type EquationFactor = {
	label: string;
	value: number;
	op?: FactorOp;
	tone?: ChipTone;
	/** A config's chip wears its rarity instead of a tone. */
	rarity?: Rarity;
};

export type EquationProps = {
	/** The earn's arithmetic, base first. Empty on a miss: nothing was
	 * multiplied, and the paid line carries the loss alone. */
	factors: readonly EquationFactor[];
	/** Signed coverage the answer paid. */
	paid: number;
};

const OPERATOR = { times: "×", plus: "+" } as const satisfies Record<
	FactorOp,
	string
>;

// An add is quoted verbatim, never re-rounded: the figure arrives already
// rounded from the same breakdown the rail badges, and rounding it twice is how
// the two surfaces would drift apart by a tenth.
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

/**
 * The base and its adds are bracketed whenever multipliers follow, because the
 * multipliers scale their sum rather than the base alone — without the brackets
 * the row would read as `base + (add × mult)` and stop matching the total.
 */
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
				{/* aria-label carries the whole figure, since the subscript % splits
			    the text node. */}
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
