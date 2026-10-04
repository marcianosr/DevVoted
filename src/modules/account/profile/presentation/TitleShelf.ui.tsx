import type { ReactNode } from "react";

import { clsx } from "clsx";

import {
	TITLE_FILTERS,
	type CategoryRow,
	type LadderRung,
	type ShelfTitle,
	type TitleCategories,
	type TitleFilter,
	type TitleLadder,
	type TitleShelfView,
	type TitleSpecial,
} from "~/modules/account/profile/application/titleShelf.viewmodel";
import { Badge } from "~/ui/kanto-theme/Badge.ui";
import { Button } from "~/ui/kanto-theme/Button.ui";
import { Meter } from "~/ui/kanto-theme/Meter.ui";
import { Panel } from "~/ui/kanto-theme/Panel.ui";
import { Redaction } from "~/ui/kanto-theme/Redaction.ui";
import { Segmented } from "~/ui/kanto-theme/Segmented.ui";
import { Typography } from "~/ui/kanto-theme/Typography.ui";

const pollsPhrase = (polls: number) =>
	polls === 1 ? "1 poll" : `${polls} polls`;

export const COPY = {
	label: "Titles",
	filterLabel: "Show titles",
	filters: {
		all: "all",
		earned: "earned",
		closest: "closest",
	} satisfies Record<TitleFilter, string>,
	held: (held: number, total: number) => `${held} of ${total}`,
	redacted: "Title not yet earned",
	sections: {
		pollCount: "Poll count",
		category: "Category",
		special: "Special",
	},
	pollMeta: (held: number, total: number, polls: number) =>
		`${held} of ${total} · ${pollsPhrase(polls)} answered`,
	ladderStart: "1",
	ladderEnd: pollsPhrase,
	nextAt: "next title at",
	nextPolls: pollsPhrase,
	toGo: (count: number) => `${count} to go`,
	topReached: "Every poll-count title earned",
	categoryColumn: "category",
	answeredColumn: (target: number) => `${target} answered`,
	correctColumn: (target: number) => `${target} correct`,
	moreCategories: (count: number) =>
		`+ ${count} more ${count === 1 ? "category" : "categories"}`,
	fewerCategories: "show fewer",
	figure: (count: number, target: number) => `${count}/${target}`,
	noneEarned: "No titles earned here yet.",
	noneStarted: "No title started yet. Answer a poll to start a bar.",
} as const;

const FILTER_ITEMS = TITLE_FILTERS.map((value) => ({
	value,
	label: COPY.filters[value],
}));

const EARNED_THEME = "viridian";

const SECTION = "group/section border-t border-theme-faint";
const SECTION_SUMMARY =
	"flex cursor-pointer list-none flex-wrap items-center gap-3 bg-theme/5 px-4 py-3 select-none [&::-webkit-details-marker]:hidden";
const SECTION_CARET =
	"inline-block shrink-0 text-theme-muted transition-transform group-open/section:rotate-90";
const SECTION_META = "ml-auto text-xs font-bold text-theme-soft tabular-nums";
const SECTION_BODY = "flex flex-col gap-4 border-t border-theme-faint p-4";

const LADDER = "flex flex-col gap-2 px-2";
const TRACK = "relative h-5";
const TRACK_LINE =
	"absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-theme-raised";
const TRACK_FILL =
	"absolute top-1/2 left-0 h-1 -translate-y-1/2 rounded-full bg-theme";
const MARKER =
	"absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-sm";
const MARKER_EARNED = "bg-theme";
const MARKER_NEXT = "bg-theme-faint ring-2 ring-pallet";
const MARKER_AHEAD = "bg-theme-faint ring-1 ring-theme-soft";
const TRACK_ENDS = "flex justify-between text-xs text-theme-muted tabular-nums";
const CALLOUT =
	"flex flex-wrap items-center gap-3 rounded-md px-4 py-3 ring-1 ring-inset ring-theme-faint text-sm text-theme-muted";
const CALLOUT_FIGURE = "font-bold text-theme-soft";
const CALLOUT_BADGE = "ml-auto";
const CHIPS = "flex flex-wrap gap-2";
const CHIP =
	"flex items-center gap-2 rounded-md py-1 pr-1 pl-3 text-sm font-bold ring-1 ring-inset ring-theme-soft text-theme-soft";

const TABLE =
	"flex flex-col overflow-hidden rounded-md ring-1 ring-inset ring-theme-faint";
const TABLE_GRID = "grid grid-cols-1 sm:grid-cols-[10rem_1fr_1fr]";
const TABLE_HEAD = `${TABLE_GRID} hidden bg-theme-raised text-xs tracking-wide text-theme-muted uppercase sm:grid`;
const HEAD_CELL = "px-4 py-2";
const TABLE_ROW = `${TABLE_GRID} border-t border-theme-faint first:border-t-0 sm:first:border-t`;
const LABEL_CELL = "flex items-center px-4 py-3";
const CELL =
	"flex min-w-0 flex-col gap-2 px-4 py-3 sm:border-l sm:border-theme-faint";
const CELL_EARNED = "bg-theme/10";
const EARNED_NAME = "truncate text-sm font-bold text-theme-soft";
const LOCKED_NAME = "truncate text-sm font-bold text-theme-muted";
const PROGRESS = "flex items-center gap-3";
const METER = "flex-1";
const FIGURE = "shrink-0 text-xs text-theme-muted tabular-nums";
const TABLE_FOOT = "border-t border-theme-faint px-2 py-1";

const CARDS = "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4";
const CARD =
	"flex min-w-0 flex-col gap-2 rounded-md p-4 ring-1 ring-inset ring-theme-faint";
const CARD_EARNED = "bg-theme/10 ring-theme-soft";

const CLOSEST_ROW = "flex min-w-0 flex-1 flex-col gap-1";

export type TitleShelfProps = TitleShelfView & {
	onFilter: (filter: TitleFilter) => void;
	onMoreCategories: () => void;
};

const TitleName = ({ title }: { title: ShelfTitle }) =>
	title.locked ? (
		<span className={LOCKED_NAME}>
			<Redaction label={COPY.redacted} />
		</span>
	) : (
		<span className={title.earned ? EARNED_NAME : LOCKED_NAME}>
			{title.name}
		</span>
	);

const Progress = ({ title }: { title: ShelfTitle }) => (
	<span className={PROGRESS}>
		<span className={METER}>
			<Meter value={title.count} max={title.target} />
		</span>
		<span className={FIGURE}>{COPY.figure(title.count, title.target)}</span>
	</span>
);

const EarnedProgress = ({ title }: { title: ShelfTitle }) => (
	<span className={PROGRESS}>
		<span className={METER}>
			<Meter value={title.target} max={title.target} />
		</span>
	</span>
);

const Section = ({
	title,
	meta,
	children,
}: {
	title: string;
	meta: string;
	children: ReactNode;
}) => (
	<details open className={SECTION}>
		<summary className={SECTION_SUMMARY}>
			<span aria-hidden className={SECTION_CARET}>
				›
			</span>
			<Typography variant="title" as="h3">
				{title}
			</Typography>
			<span className={SECTION_META}>{meta}</span>
		</summary>
		<div className={SECTION_BODY}>{children}</div>
	</details>
);

const markerOf = (rung: LadderRung) => {
	if (rung.earned) return MARKER_EARNED;
	if (rung.next) return MARKER_NEXT;
	return MARKER_AHEAD;
};

const percentOf = (share: number) => `${share * 100}%`;

const LadderTrack = ({ ladder }: { ladder: TitleLadder }) => (
	<div className={LADDER}>
		<div aria-hidden className={TRACK}>
			<span className={TRACK_LINE} />
			<span className={TRACK_FILL} style={{ width: percentOf(ladder.fill) }} />
			{ladder.rungs.map((rung) => (
				<span
					key={rung.id}
					className={clsx(MARKER, markerOf(rung))}
					style={{ left: percentOf(rung.position) }}
				/>
			))}
		</div>
		<div className={TRACK_ENDS}>
			<span>{COPY.ladderStart}</span>
			<span>{COPY.ladderEnd(ladder.top)}</span>
		</div>
	</div>
);

const NextRung = ({ next }: Pick<TitleLadder, "next">) =>
	next === null ? (
		<div className={CALLOUT}>{COPY.topReached}</div>
	) : (
		<div className={CALLOUT}>
			<Redaction label={COPY.redacted} />
			<span>
				{COPY.nextAt}{" "}
				<span className={CALLOUT_FIGURE}>{COPY.nextPolls(next.at)}</span>
			</span>
			<span className={CALLOUT_BADGE}>
				<Badge>{COPY.toGo(next.toGo)}</Badge>
			</span>
		</div>
	);

const EarnedRungs = ({ earned }: { earned: readonly ShelfTitle[] }) =>
	earned.length === 0 ? null : (
		<div className={CHIPS}>
			{earned.map((title) => (
				<span key={title.id} className={CHIP}>
					<TitleName title={title} />
				</span>
			))}
		</div>
	);

const PollCountSection = ({ ladder }: { ladder: TitleLadder }) => (
	<Section
		title={COPY.sections.pollCount}
		meta={COPY.pollMeta(ladder.held, ladder.total, ladder.pollsAnswered)}
	>
		<LadderTrack ladder={ladder} />
		<NextRung next={ladder.next} />
		<EarnedRungs earned={ladder.earned} />
	</Section>
);

const CategoryCell = ({ title }: { title: ShelfTitle }) => (
	<div
		data-screen-theme={title.earned ? EARNED_THEME : undefined}
		className={clsx(CELL, title.earned && CELL_EARNED)}
	>
		<TitleName title={title} />
		{title.earned ? (
			<EarnedProgress title={title} />
		) : (
			<Progress title={title} />
		)}
	</div>
);

const CategoryTableRow = ({ row }: { row: CategoryRow }) => (
	<div className={TABLE_ROW}>
		<div className={LABEL_CELL}>
			<Badge>{row.label}</Badge>
		</div>
		<CategoryCell title={row.answered} />
		<CategoryCell title={row.correct} />
	</div>
);

const CategoryTableHead = ({ first }: { first: CategoryRow }) => (
	<div aria-hidden className={TABLE_HEAD}>
		<span className={HEAD_CELL}>{COPY.categoryColumn}</span>
		<span className={HEAD_CELL}>
			{COPY.answeredColumn(first.answered.target)}
		</span>
		<span className={HEAD_CELL}>
			{COPY.correctColumn(first.correct.target)}
		</span>
	</div>
);

const MoreCategories = ({
	categories,
	onMoreCategories,
}: {
	categories: TitleCategories;
	onMoreCategories: () => void;
}) => {
	if (categories.overflow === 0 && !categories.expanded) return null;
	return (
		<div className={TABLE_FOOT}>
			<Button
				size="sm"
				tone="bare"
				label={
					categories.expanded
						? COPY.fewerCategories
						: COPY.moreCategories(categories.overflow)
				}
				expanded={categories.expanded}
				onPress={onMoreCategories}
			/>
		</div>
	);
};

const NoneEarned = () => (
	<Typography variant="hint" as="p">
		{COPY.noneEarned}
	</Typography>
);

const CategorySection = ({
	categories,
	onMoreCategories,
}: {
	categories: TitleCategories;
	onMoreCategories: () => void;
}) => {
	const [first] = categories.rows;
	return (
		<Section
			title={COPY.sections.category}
			meta={COPY.held(categories.held, categories.total)}
		>
			{first === undefined ? (
				<NoneEarned />
			) : (
				<div className={TABLE}>
					<CategoryTableHead first={first} />
					{categories.rows.map((row) => (
						<CategoryTableRow key={row.code} row={row} />
					))}
					<MoreCategories
						categories={categories}
						onMoreCategories={onMoreCategories}
					/>
				</div>
			)}
		</Section>
	);
};

const SpecialCard = ({ title }: { title: ShelfTitle }) => (
	<div
		data-screen-theme={title.earned ? EARNED_THEME : undefined}
		className={clsx(CARD, title.earned && CARD_EARNED)}
	>
		<TitleName title={title} />
		<Typography variant="hint" as="p">
			{title.earnedWhen}
		</Typography>
		{!title.earned && title.target > 1 ? <Progress title={title} /> : null}
	</div>
);

const SpecialSection = ({ special }: { special: TitleSpecial }) => (
	<Section
		title={COPY.sections.special}
		meta={COPY.held(special.held, special.total)}
	>
		{special.titles.length === 0 ? (
			<NoneEarned />
		) : (
			<div className={CARDS}>
				{special.titles.map((title) => (
					<SpecialCard key={title.id} title={title} />
				))}
			</div>
		)}
	</Section>
);

const ClosestList = ({ closest }: { closest: readonly ShelfTitle[] }) =>
	closest.length === 0 ? (
		<Panel.Body>
			<Typography variant="hint" as="p">
				{COPY.noneStarted}
			</Typography>
		</Panel.Body>
	) : (
		<Panel.Rows>
			{closest.map((title) => (
				<Panel.Row
					key={title.id}
					trailing={<Badge>{COPY.toGo(title.target - title.count)}</Badge>}
				>
					<span className={CLOSEST_ROW}>
						<TitleName title={title} />
						<Typography variant="hint" as="span">
							{title.earnedWhen}
						</Typography>
						<Progress title={title} />
					</span>
				</Panel.Row>
			))}
		</Panel.Rows>
	);

export const TitleShelf = ({
	filter,
	held,
	total,
	ladder,
	categories,
	special,
	closest,
	onFilter,
	onMoreCategories,
}: TitleShelfProps) => (
	<Panel>
		<Panel.Header
			label={COPY.label}
			meta={<Badge>{COPY.held(held, total)}</Badge>}
			trailing={
				<Segmented
					label={COPY.filterLabel}
					items={FILTER_ITEMS}
					value={filter}
					onSelect={onFilter}
				/>
			}
		/>
		{filter === "closest" ? (
			<ClosestList closest={closest} />
		) : (
			<>
				<PollCountSection ladder={ladder} />
				<CategorySection
					categories={categories}
					onMoreCategories={onMoreCategories}
				/>
				<SpecialSection special={special} />
			</>
		)}
	</Panel>
);
