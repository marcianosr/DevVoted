import type { ReactNode } from "react";

import {
	isWeightCell,
	type WikiArticle,
	type WikiBlock,
	type WikiCell,
	type WikiContentsEntry,
	type WikiSection,
	type WikiTable,
} from "~/modules/guide/wiki/application/wikiArticles.viewmodel";
import type { WikiTerm } from "~/modules/guide/wiki/application/wikiGlossary.viewmodel";
import { CoverageBar } from "~/ui/kanto-theme/CoverageBar.ui";
import { Lead } from "~/ui/kanto-theme/Lead.ui";
import { Panel } from "~/ui/kanto-theme/Panel.ui";
import { Prose } from "~/ui/kanto-theme/Prose.ui";
import { Screen } from "~/ui/kanto-theme/Screen.ui";
import { StatTiles } from "~/ui/kanto-theme/StatTiles.ui";
import { SwatchTrack } from "~/ui/kanto-theme/SwatchTrack.ui";
import { Typography } from "~/ui/kanto-theme/Typography.ui";
import { Weight } from "~/ui/kanto-theme/Weight.ui";
import { WeightTrack } from "~/ui/kanto-theme/WeightTrack.ui";

export const COPY = {
	title: "Wiki",
	lead: "How DevVoted plays, with every number read from the live game.",
	contents: "contents",
} as const;

const THEME = "pallet";

const LAYOUT =
	"grid w-full grid-cols-[minmax(0,1fr)] items-start gap-4 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]";
const CONTENTS = "lg:sticky lg:top-4";
const ENTRY = "flex min-w-0 flex-col gap-0.5";
const SECTION = "flex flex-col gap-2";
const TABLE_SCROLL =
	"w-full overflow-x-auto rounded-lg border border-theme-faint";
const TABLE = "w-full border-collapse text-left text-sm";
const HEAD_CELL =
	"bg-theme-raised px-3 py-1.5 text-xs font-normal whitespace-nowrap text-theme-muted";
const CELL = "border-t border-theme-faint px-3 py-1.5 align-top";
const TERMS =
	"grid gap-x-4 gap-y-2 sm:grid-cols-[minmax(0,10rem)_minmax(0,1fr)]";
const TERM_ROW = "contents";
const TERM = "font-bold";
const FIGURE = "flex flex-col gap-1.5 py-1";
const SWATCHES = "flex w-full justify-center overflow-x-auto py-1";

export type WikiScreenProps = {
	contents: readonly WikiContentsEntry[];
	article: WikiArticle;
	onNavigate?: (href: string) => void;
};

const Cell = ({ cell }: { cell: WikiCell }) => {
	if (isWeightCell(cell)) return <Weight slots={cell.weight} />;
	if (typeof cell === "string")
		return (
			<Typography variant="caption" as="span">
				{cell}
			</Typography>
		);
	return <Lead line={[cell]} variant="caption" as="span" />;
};

const Figure = ({
	caption,
	children,
}: {
	caption: string;
	children: ReactNode;
}) => (
	<figure className={FIGURE}>
		{children}
		<figcaption>
			<Typography variant="hint" as="span">
				{caption}
			</Typography>
		</figcaption>
	</figure>
);

const Table = ({ table }: { table: WikiTable }) => (
	<div className={TABLE_SCROLL}>
		<table className={TABLE}>
			<thead>
				<tr>
					{table.columns.map((column) => (
						<th key={column} scope="col" className={HEAD_CELL}>
							{column}
						</th>
					))}
				</tr>
			</thead>
			<tbody>
				{table.rows.map((row, rowIndex) => (
					<tr key={rowIndex}>
						{row.map((cell, index) => (
							<td key={table.columns[index]} className={CELL}>
								<Cell cell={cell} />
							</td>
						))}
					</tr>
				))}
			</tbody>
		</table>
	</div>
);

const Terms = ({ terms }: { terms: readonly WikiTerm[] }) => (
	<dl className={TERMS}>
		{terms.map(({ term, meaning }) => (
			<div key={term} className={TERM_ROW}>
				<dt className={TERM}>{term}</dt>
				<dd>
					<Prose text={meaning} />
				</dd>
			</div>
		))}
	</dl>
);

const Block = ({ block }: { block: WikiBlock }) => {
	if (block.kind === "prose") return <Prose text={block.text} />;
	if (block.kind === "table") return <Table table={block.table} />;
	if (block.kind === "stats") return <StatTiles stats={block.stats} />;
	if (block.kind === "swatches")
		return (
			<div className={SWATCHES}>
				<SwatchTrack swatches={block.swatches} size="large" />
			</div>
		);
	if (block.kind === "meter")
		return (
			<Figure caption={block.caption}>
				<CoverageBar {...block.meter} />
			</Figure>
		);
	if (block.kind === "build")
		return (
			<Figure caption={block.caption}>
				<WeightTrack {...block.track} />
			</Figure>
		);
	return <Terms terms={block.terms} />;
};

const Section = ({ section }: { section: WikiSection }) => (
	<section className={SECTION}>
		<Typography variant="subtitle" as="h3">
			{section.heading}
		</Typography>
		{section.blocks.map((block, index) => (
			<Block key={`${block.kind}-${index}`} block={block} />
		))}
	</section>
);

export const WikiScreen = ({
	contents,
	article,
	onNavigate,
}: WikiScreenProps) => (
	<Screen theme={THEME} width="wide">
		<Typography variant="headline" as="h1">
			{COPY.title}
		</Typography>
		<Prose text={COPY.lead} />

		<div className={LAYOUT}>
			<nav aria-label={COPY.title} className={CONTENTS}>
				<Panel>
					<Panel.Header label={COPY.contents} />
					<Panel.Rows>
						{contents.map((entry) => (
							<Panel.Row
								key={entry.id}
								href={entry.href}
								picked={entry.id === article.id}
								onNavigate={onNavigate}
							>
								<span className={ENTRY}>
									<Typography variant="label" as="span">
										{entry.title}
									</Typography>
									<Typography variant="hint" as="span">
										{entry.summary}
									</Typography>
								</span>
							</Panel.Row>
						))}
					</Panel.Rows>
				</Panel>
			</nav>

			<article>
				<Panel>
					<Panel.Header label={article.title} summary={article.summary} />
					<Panel.Body>
						{article.sections.map((section) => (
							<Section key={section.heading} section={section} />
						))}
					</Panel.Body>
				</Panel>
			</article>
		</div>
	</Screen>
);
