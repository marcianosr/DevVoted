import type { SwatchTheme } from "~/modules/run/gate/domain/swatch.model";

import { Badge } from "../Badge.ui";
import { Button } from "../Button.ui";
import { Figures } from "../Figures.ui";
import { Panel } from "../Panel.ui";
import { Section } from "../Section.ui";
import { Text } from "../Text.ui";

const FOOTER = "flex items-center justify-end border-t border-edge pt-4";
const HEAD_LINE = "flex items-center gap-3 @max-md:items-start";
const FACTS = "ml-7 flex flex-col gap-1.5";
const FACT = "flex items-center gap-3";
const FACT_NAME = "w-24 shrink-0";
const EXPLAINER = "ml-7 leading-relaxed";

export type ReviewRow = {
	id: string;
	category: string;
	question: string;
	pollLabel?: string;
	expected?: string;
	picked?: string;
	cost?: string;
	gain?: string;
	explainer?: string;
};

export type ReviewScreenProps = {
	title: string;
	meta: string;
	theme?: SwatchTheme;
	failed: {
		meta: string;
		rows: readonly ReviewRow[];
	};
	passed: {
		meta: string;
		rows: readonly ReviewRow[];
	};
	backLabel: string;
	onBack?: () => void;
};

const hasFacts = (row: ReviewRow) =>
	row.expected !== undefined ||
	row.picked !== undefined ||
	row.cost !== undefined ||
	row.gain !== undefined;

const FailedRow = ({ row }: { row: ReviewRow }) => (
	<div className="flex flex-col gap-1.5 py-2">
		<div className={HEAD_LINE}>
			<Text tone="cinnabar">×</Text>
			<Badge tone="celadon">{row.category}</Badge>
			<Text className="min-w-0 flex-1">{row.question}</Text>
			{row.pollLabel === undefined ? null : (
				<Text tone="muted" className="shrink-0">
					{row.pollLabel}
				</Text>
			)}
		</div>
		{hasFacts(row) ? (
			<div className={FACTS}>
				{row.expected === undefined ? null : (
					<span className={FACT}>
						<Text tone="muted" className={FACT_NAME}>
							expected
						</Text>
						<Badge tone="viridian">{row.expected}</Badge>
					</span>
				)}
				{row.picked === undefined ? null : (
					<span className={FACT}>
						<Text tone="muted" className={FACT_NAME}>
							you picked
						</Text>
						<Badge tone="cinnabar">{row.picked}</Badge>
					</span>
				)}
				{row.cost === undefined ? null : (
					<span className={FACT}>
						<Text tone="muted" className={FACT_NAME}>
							cost
						</Text>
						<Text tone="cinnabar">
							<Figures text={row.cost} />
						</Text>
					</span>
				)}
				{row.gain === undefined ? null : (
					<span className={FACT}>
						<Text tone="muted" className={FACT_NAME}>
							banked
						</Text>
						<Figures text={row.gain} />
					</span>
				)}
			</div>
		) : null}
		{row.explainer === undefined ? null : (
			<Text as="p" tone="muted" size="caption" className={EXPLAINER}>
				{row.explainer}
			</Text>
		)}
	</div>
);

const PassedRow = ({ row }: { row: ReviewRow }) => (
	<div className="flex items-center gap-3 py-2 @max-md:items-start">
		<Text tone="viridian">✓</Text>
		<Badge tone="celadon">{row.category}</Badge>
		<Text className="min-w-0 flex-1">{row.question}</Text>
		{row.gain === undefined ? null : <Figures text={row.gain} />}
	</div>
);

export const ReviewScreen = ({
	title,
	meta,
	theme,
	failed,
	passed,
	backLabel,
	onBack,
}: ReviewScreenProps) => (
	<Panel theme={theme}>
		<header className="flex items-center justify-between gap-4 border-b border-edge pb-3">
			<Text size="title" className="font-bold">
				{title}
			</Text>
			<Text tone="muted">{meta}</Text>
		</header>

		<Section label="Failed" meta={failed.meta} divided>
			{failed.rows.map((row) => (
				<FailedRow key={row.id} row={row} />
			))}
		</Section>

		<Section label="Passed" meta={passed.meta} defaultOpen={false} divided>
			{passed.rows.map((row) => (
				<PassedRow key={row.id} row={row} />
			))}
		</Section>

		<footer className={FOOTER}>
			<Button label={backLabel} className="@max-md:w-full" onUse={onBack} />
		</footer>
	</Panel>
);
