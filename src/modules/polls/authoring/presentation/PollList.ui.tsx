import { Fragment } from "react";

import type {
	ActiveFilter,
	FilterKey,
	PollListChoices,
	PollListFilter,
	PollRow,
	QuestionSegment,
} from "~/modules/polls/authoring/application/pollList.viewmodel";
import { pickedOf } from "~/modules/polls/authoring/application/pollList.viewmodel";
import type { PollStatus } from "~/modules/polls/poll/domain/poll.model";
import { SUGGEST_A_POLL, YOUR_SUGGESTED_POLLS } from "~/shared/lib/copy";
import { NOTHING_SHOWN } from "~/shared/lib/displayValue";
import { Badge } from "~/ui/kanto-theme/Badge.ui";
import { Button } from "~/ui/kanto-theme/Button.ui";
import { Climber } from "~/ui/kanto-theme/Climber.ui";
import type { KantoColor } from "~/ui/kanto-theme/colors";
import { Panel, type PanelColumn } from "~/ui/kanto-theme/Panel.ui";
import { Screen } from "~/ui/kanto-theme/Screen.ui";
import { SearchField } from "~/ui/kanto-theme/SearchField.ui";
import { Segmented } from "~/ui/kanto-theme/Segmented.ui";
import { Select } from "~/ui/kanto-theme/Select.ui";
import { Switch } from "~/ui/kanto-theme/Switch.ui";
import { Typography } from "~/ui/kanto-theme/Typography.ui";

export const COPY = {
	adminHeading: "Polls",
	ownHeading: YOUR_SUGGESTED_POLLS,
	suggest: SUGGEST_A_POLL,
	reward: (reward: string) =>
		`Every poll we publish banks ${reward} in your archive.`,
	search: "Search questions",
	searchPlaceholder: "search questions…",
	status: "status",
	answerType: "answer",
	dealt: "dealt",
	reviewed: "reviewed",
	changed: "changed",
	reviewedOn: (date: string) => `reviewed ${date}`,
	updatedOn: (date: string) => `updated ${date}`,
	withCode: "with code",
	withExplanation: "with explanation",
	category: "Category",
	creator: "creator",
	clear: (label: string) => `Clear ${label}`,
	clearAll: "clear all",
	numberColumn: "#",
	categoryColumn: "category",
	questionColumn: "question",
	byColumn: "by",
	statusColumn: "status",
	showingLead: "showing ",
	showingTrail: (matching: number) => ` of ${matching}`,
	loadMore: "load more",
	empty: "No polls match these filters.",
	loading: "Loading polls…",
	loadError: (reason: string) => `Error loading polls: ${reason}`,
	yesterdayHeading: "Dealt yesterday",
} as const;

const THEME: KantoColor = "pallet";
const ERROR_THEME: KantoColor = "cinnabar";

const REVIEWED_COLOR: KantoColor = "celadon";
const CHANGED_COLOR: KantoColor = "vermillion";
const SEPARATOR = " · ";

const STATUS_COLOR = {
	published: "viridian",
	draft: "saffron",
	archived: "pewter",
} satisfies Record<PollStatus, KantoColor>;

const TITLE_ROW = "flex w-full flex-wrap items-center gap-x-3 gap-y-2";
const COUNT = "text-theme-muted";
const SUGGEST = "ml-auto";
const TOOLBAR = "flex flex-wrap items-center gap-2";
const TABS = "border-y border-theme-faint px-2";
const SUMMARY = "flex flex-wrap items-center gap-2 px-4 py-3";
const SHOWN = "font-bold text-theme-soft";
const CHIP =
	"badge-theme inline-flex h-7 cursor-pointer items-center gap-2 rounded-md px-2.5 text-xs font-bold";
const CLEAR_ALL = "ml-auto";
const SEARCH = "min-w-48 flex-1 basis-64";
const CELLS =
	"flex w-full min-w-0 flex-wrap items-center gap-x-4 gap-y-2 md:flex-nowrap";
const COLUMN_HEADER = "hidden md:block";
const NUMBER = "shrink-0 text-xs text-theme-muted md:w-8";
const CATEGORY = "shrink-0 md:w-28";
const QUESTION =
	"order-last flex min-w-0 basis-full flex-col gap-0.5 md:order-none md:flex-1 md:basis-auto";
const QUESTION_TEXT = "text-sm wrap-break-word font-bold text-theme-faint";
const CODE = "rounded-xs bg-theme-raised px-1 text-theme";
const BY = "order-last flex shrink-0 items-center gap-2 md:order-none md:w-28";
const AUTHOR_NAME = "truncate text-xs text-theme-soft";
const STATUS =
	"ml-auto flex shrink-0 flex-wrap justify-end gap-1 md:ml-0 md:w-44";

const columnsOf = (admin: boolean): readonly PanelColumn[] => [
	{ label: COPY.numberColumn, width: NUMBER },
	{ label: COPY.categoryColumn, width: CATEGORY },
	{ label: COPY.questionColumn, width: QUESTION },
	...(admin ? [{ label: COPY.byColumn, width: BY }] : []),
	{ label: COPY.statusColumn, width: STATUS },
];

const Question = ({
	segments,
	facts,
	stamps,
}: {
	segments: readonly QuestionSegment[];
	facts: string;
	stamps: string;
}) => (
	<span className={QUESTION}>
		<span className={QUESTION_TEXT}>
			{segments.map((segment, index) =>
				segment.kind === "code" ? (
					<code key={`${index}-${segment.text}`} className={CODE}>
						{segment.text}
					</code>
				) : (
					<Fragment key={`${index}-${segment.text}`}>{segment.text}</Fragment>
				)
			)}
		</span>
		<Typography variant="hint" as="span">
			{facts}
		</Typography>
		{stamps === "" ? null : (
			<Typography variant="hint" as="span">
				{stamps}
			</Typography>
		)}
	</span>
);

const Author = ({ author }: Pick<PollRow, "author">) => (
	<span className={BY}>
		{author === undefined ? (
			<span className={COUNT}>{NOTHING_SHOWN}</span>
		) : (
			<>
				<Climber name={author.name} photoUrl={author.photoUrl} size="sm" />
				<span className={AUTHOR_NAME}>{author.name}</span>
			</>
		)}
	</span>
);

const ReviewBadge = ({ review }: Pick<PollRow, "review">) => {
	if (review === "current") {
		return <Badge color={REVIEWED_COLOR}>{COPY.reviewed}</Badge>;
	}
	if (review === "changed") {
		return <Badge color={CHANGED_COLOR}>{COPY.changed}</Badge>;
	}
	return null;
};

const stampsOf = ({
	reviewedOn,
	updatedOn,
}: Pick<PollRow, "reviewedOn" | "updatedOn">): string =>
	[
		...(reviewedOn === undefined ? [] : [COPY.reviewedOn(reviewedOn)]),
		...(updatedOn === undefined ? [] : [COPY.updatedOn(updatedOn)]),
	].join(SEPARATOR);

const Row = ({ row, admin }: { row: PollRow; admin: boolean }) => (
	<Panel.Row href={row.href}>
		<span className={CELLS}>
			<span className={NUMBER}>{row.number}</span>
			<span className={CATEGORY}>
				<Badge>{row.category}</Badge>
			</span>
			<Question
				segments={row.question}
				facts={row.facts}
				stamps={admin ? stampsOf(row) : ""}
			/>
			{admin ? <Author author={row.author} /> : null}
			<span className={STATUS}>
				{admin ? <ReviewBadge review={row.review} /> : null}
				<Badge color={STATUS_COLOR[row.status]}>{row.status}</Badge>
			</span>
		</span>
	</Panel.Row>
);

export const PollListLoading = () => (
	<Screen theme={THEME} width="wide" ground="bare">
		<Typography variant="hint">{COPY.loading}</Typography>
	</Screen>
);

export const PollListError = ({ message }: { message: string }) => (
	<Screen theme={ERROR_THEME} width="wide" ground="bare">
		<Typography variant="title">{COPY.loadError(message)}</Typography>
	</Screen>
);

export type PollListProps = {
	admin: boolean;
	total: number;
	matching: number;
	shown: number;
	rows: readonly PollRow[];
	yesterday?: readonly PollRow[];
	filter: PollListFilter;
	choices: PollListChoices;
	activeFilters: readonly ActiveFilter[];
	onClearFilter: (key: FilterKey) => void;
	onClearAll: () => void;
	suggestHref: string;
	reward?: string;
	onFilterChange: (filter: PollListFilter) => void;
	onLoadMore?: () => void;
};

export const PollList = ({
	admin,
	total,
	matching,
	shown,
	rows,
	yesterday = [],
	filter,
	choices,
	activeFilters,
	onClearFilter,
	onClearAll,
	suggestHref,
	reward,
	onFilterChange,
	onLoadMore,
}: PollListProps) => (
	<Screen theme={THEME} width="wide" ground="bare">
		<div className={TITLE_ROW}>
			<Typography variant="headline" as="h1">
				{admin ? COPY.adminHeading : COPY.ownHeading}{" "}
				<span className={COUNT}>{total}</span>
			</Typography>
			<span className={SUGGEST}>
				<Button
					label={COPY.suggest}
					tone="action"
					size="md"
					icon="plus"
					iconAt="lead"
					href={suggestHref}
				/>
			</span>
		</div>
		{admin || reward === undefined ? null : (
			<Typography variant="hint" as="p">
				{COPY.reward(reward)}
			</Typography>
		)}

		{yesterday.length === 0 ? null : (
			<Panel>
				<Panel.Header label={COPY.yesterdayHeading} />
				<Panel.Rows>
					{yesterday.map((row) => (
						<Row key={row.id} row={row} admin={admin} />
					))}
				</Panel.Rows>
			</Panel>
		)}

		<Panel>
			<Panel.Body>
				<div className={TOOLBAR}>
					<span className={SEARCH}>
						<SearchField
							label={COPY.search}
							value={filter.search}
							placeholder={COPY.searchPlaceholder}
							onChange={(search) => onFilterChange({ ...filter, search })}
						/>
					</span>
					<Select
						look="inline"
						label={COPY.status}
						options={choices.status}
						value={filter.status}
						onChange={(status) =>
							onFilterChange({
								...filter,
								status: pickedOf(choices.status, status, filter.status),
							})
						}
					/>
					<Select
						look="inline"
						label={COPY.answerType}
						options={choices.answerType}
						value={filter.answerType}
						onChange={(answerType) =>
							onFilterChange({
								...filter,
								answerType: pickedOf(
									choices.answerType,
									answerType,
									filter.answerType
								),
							})
						}
					/>
					<Select
						look="inline"
						label={COPY.dealt}
						options={choices.dealt}
						value={filter.dealt}
						onChange={(dealt) =>
							onFilterChange({
								...filter,
								dealt: pickedOf(choices.dealt, dealt, filter.dealt),
							})
						}
					/>
					{admin ? (
						<Select
							look="inline"
							label={COPY.reviewed}
							options={choices.reviewed}
							value={filter.reviewed}
							onChange={(reviewed) =>
								onFilterChange({
									...filter,
									reviewed: pickedOf(
										choices.reviewed,
										reviewed,
										filter.reviewed
									),
								})
							}
						/>
					) : null}
					{choices.creator === undefined ? null : (
						<Select
							look="inline"
							label={COPY.creator}
							options={choices.creator}
							value={filter.creator}
							onChange={(creator) => onFilterChange({ ...filter, creator })}
						/>
					)}
					<Switch
						label={COPY.withCode}
						count={choices.withCode}
						checked={filter.withCode}
						onChange={(withCode) => onFilterChange({ ...filter, withCode })}
					/>
					<Switch
						label={COPY.withExplanation}
						count={choices.withExplanation}
						checked={filter.withExplanation}
						onChange={(withExplanation) =>
							onFilterChange({ ...filter, withExplanation })
						}
					/>
				</div>
			</Panel.Body>
			<div className={TABS}>
				<Segmented
					label={COPY.category}
					items={choices.category}
					value={filter.category}
					look="tabs"
					onSelect={(category) => onFilterChange({ ...filter, category })}
				/>
			</div>
			<div className={SUMMARY}>
				<Typography variant="hint" as="span">
					{COPY.showingLead}
					<span className={SHOWN}>{shown}</span>
					{COPY.showingTrail(matching)}
				</Typography>
				{activeFilters.map((active) => (
					<button
						key={active.key}
						type="button"
						aria-label={COPY.clear(active.label)}
						onClick={() => onClearFilter(active.key)}
						className={CHIP}
					>
						{active.label}
						<span aria-hidden>×</span>
					</button>
				))}
				{activeFilters.length === 0 ? null : (
					<span className={CLEAR_ALL}>
						<Button tone="ambient" label={COPY.clearAll} onPress={onClearAll} />
					</span>
				)}
			</div>

			<div className={COLUMN_HEADER}>
				<Panel.Columns columns={columnsOf(admin)} />
			</div>
			<Panel.Rows>
				{rows.length === 0 ? (
					<Panel.Row>
						<Typography variant="hint" as="span">
							{COPY.empty}
						</Typography>
					</Panel.Row>
				) : (
					rows.map((row) => <Row key={row.id} row={row} admin={admin} />)
				)}
			</Panel.Rows>

			{onLoadMore === undefined ? null : (
				<Panel.Footer
					trailing={
						<Button
							label={COPY.loadMore}
							icon="chevron"
							iconAt="trail"
							onPress={onLoadMore}
						/>
					}
				>
					{null}
				</Panel.Footer>
			)}
		</Panel>
	</Screen>
);
