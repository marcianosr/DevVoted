import type { ReactNode } from "react";

import { clsx } from "clsx";

import { Chip } from "./Chip.ui";
import { Text } from "./Text.ui";
import type { ModernTone } from "./tones";

const LEDGER = "flex min-w-0 flex-1 flex-col gap-3 px-5 py-4";

const ROWS = "flex flex-col";
const ROW = "flex items-center gap-3 py-1";
const SPENT = "opacity-50";

const LEAD = "flex size-4 shrink-0 items-center justify-center";
const NAME = "min-w-32 shrink-0";
const NOTES = "flex w-44 shrink-0 flex-wrap items-center gap-1.5";

const TOTAL =
	"mt-auto flex items-center justify-between gap-6 border-t border-edge pt-3";

const VALUE = "ml-auto shrink-0 tabular-nums";

export type LedgerUnit = "%" | "KB";

export type LedgerEntry = {
	id: string;
	name: string;
	lead?: ReactNode;
	notes?: readonly string[];
	value: number;
	dimmed?: boolean;
};

export type LedgerFooter = {
	label: string;
	value: string;
	tone?: ModernTone;
};

export type LedgerProps = {
	title: string;
	unit: LedgerUnit;
	entries: readonly LedgerEntry[];
	footer?: LedgerFooter;
	showDetail: boolean;
};

export const ledgerTotal = (entries: readonly LedgerEntry[]): number =>
	Math.round(entries.reduce((sum, entry) => sum + entry.value, 0) * 10) / 10;

const toneFor = (value: number): ModernTone => {
	if (value === 0) return "muted";
	return value < 0 ? "cinnabar" : "celadon";
};

const signed = (value: number) => `${value < 0 ? "−" : "+"}${Math.abs(value)}`;

const entryLabel = (value: number, unit: LedgerUnit) =>
	unit === "KB" ? `${signed(value)} KB` : signed(value);

export const ledgerTotalLabel = (
	entries: readonly LedgerEntry[],
	unit: LedgerUnit
): string => {
	const total = signed(ledgerTotal(entries));
	return unit === "%" ? `${total}%` : `${total} ${unit}`;
};

export const Ledger = ({
	title,
	unit,
	entries,
	footer,
	showDetail,
}: LedgerProps) => (
	<section className={LEDGER}>
		<Text as="h3" size="label">
			{title}
		</Text>

		{showDetail ? (
			<ul className={ROWS}>
				{entries.map(({ id, name, lead, notes, value, dimmed }) => (
					<li key={id} className={clsx(ROW, dimmed && SPENT)}>
						<span className={LEAD}>{lead}</span>
						<Text size="body" className={NAME}>
							{name}
						</Text>
						<span className={NOTES}>
							{notes?.map((note) => (
								<Chip key={note} tone="muted">
									{note}
								</Chip>
							))}
						</span>
						<Text size="body" tone={toneFor(value)} className={VALUE}>
							{entryLabel(value, unit)}
						</Text>
					</li>
				))}
			</ul>
		) : null}

		<div className={TOTAL}>
			<Text size="body" tone="muted">
				{footer?.label ?? "total"}
			</Text>
			<Text size="body" tone={footer?.tone} className={VALUE}>
				{footer?.value ?? ledgerTotalLabel(entries, unit)}
			</Text>
		</div>
	</section>
);
