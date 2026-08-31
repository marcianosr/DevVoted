import { Fragment } from "react";

import { clsx } from "clsx";

import { signed, valueTone } from "./format";
import { Text } from "./Text.ui";

const PANEL = "flex flex-col gap-3 border-t border-edge pt-6";
const ROW = "flex flex-wrap items-center justify-between gap-x-6 gap-y-4";

const FACTORS = "flex flex-wrap items-center gap-x-3 gap-y-2";
const FACTOR = "flex flex-col items-center";
// A config is the half of the sum the player chose; the box is what separates it
// from the terms the gate sets.
const CHOSEN = "rounded-lg border border-edge-strong px-3 py-1.5";

const TOTAL = "flex flex-col items-end";

const FIGURE = "text-2xl font-bold tabular-nums text-zinc-100";
const PAID = "text-3xl font-bold tabular-nums";
const SUFFIX = "text-lg";

const PAID_TONE = {
	celadon: "text-celadon",
	cinnabar: "text-cinnabar",
	muted: "text-pewter",
} as const;

const BRACKET = "text-lg text-zinc-600";

const factorFigure = (value: number): string =>
	(Math.round(value * 100) / 100).toFixed(2).replace(/0$/, "");

export type FactorOp = "times" | "plus";

export type EquationFactor = {
	label: string;
	value: number;
	op?: FactorOp;
	chosen?: boolean;
};

export type EquationProps = {
	factors: readonly EquationFactor[];
	paid: number;
	note?: string;
};

const OPERATOR = { times: "×", plus: "+" } as const satisfies Record<
	FactorOp,
	string
>;

const figureOf = (factor: EquationFactor): string =>
	factor.op === "plus" ? signed(factor.value) : factorFigure(factor.value);

const Factor = ({ factor }: { factor: EquationFactor }) => (
	<span className={clsx(FACTOR, factor.chosen === true && CHOSEN)}>
		<span className={FIGURE}>{figureOf(factor)}</span>
		<Text size="xxs" tone="muted">
			{factor.label}
		</Text>
	</span>
);

const Operator = ({ op }: { op: FactorOp }) => (
	<Text size="meta" tone="muted">
		{OPERATOR[op]}
	</Text>
);

const Bracket = ({ side }: { side: "(" | ")" }) => (
	<span aria-hidden className={BRACKET}>
		{side}
	</span>
);

export const Equation = ({ factors, paid, note }: EquationProps) => {
	const [base, ...rest] = factors;
	const adds = rest.filter((factor) => factor.op === "plus");
	const times = rest.filter((factor) => factor.op !== "plus");
	const bracketed = adds.length > 0 && times.length > 0;

	return (
		<section className={PANEL}>
			<div className={ROW}>
				{base ? (
					<div className={FACTORS}>
						{bracketed ? <Bracket side="(" /> : null}
						<Factor factor={base} />
						{adds.map((factor) => (
							<Fragment key={factor.label}>
								<Operator op="plus" />
								<Factor factor={factor} />
							</Fragment>
						))}
						{bracketed ? <Bracket side=")" /> : null}
						{times.map((factor) => (
							<Fragment key={factor.label}>
								<Operator op="times" />
								<Factor factor={factor} />
							</Fragment>
						))}
					</div>
				) : null}
				<div className={TOTAL}>
					<span
						aria-label={`${signed(paid)}%`}
						className={clsx(PAID, PAID_TONE[valueTone(paid)])}
					>
						{signed(paid)}
						<span className={SUFFIX}>%</span>
					</span>
					<Text size="meta" tone="muted">
						coverage {paid < 0 ? "lost" : "earned"}
					</Text>
				</div>
			</div>
			{note ? (
				<Text as="p" size="meta" tone="muted">
					{note}
				</Text>
			) : null}
		</section>
	);
};
