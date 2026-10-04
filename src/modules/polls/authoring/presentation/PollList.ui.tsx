import { Fragment } from "react";

import type {
	PollListChoices,
	PollListFilter,
	PollRow,
	QuestionSegment,
} from "~/modules/polls/authoring/application/pollList.viewmodel";
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
import { Typography } from "~/ui/kanto-theme/Typography.ui";

export const COPY = {
	adminHeading: "Polls",
	ownHeading: YOUR_SUGGESTED_POLLS,
	suggest: SUGGEST_A_POLL,
	reward: (reward: string) =>
		`Every poll we publish banks ${reward} in your archive.`,
	search: "Search questions",
	searchPlaceholder: "search questions…",
	status: "Status",
	answerType: "Answer type",
	withCode: "with code",
	category: "Category",
	creator: "Creator",
	numberColumn: "#",
	categoryColumn: "category",
	questionColumn: "question",
	byColumn: "by",
	statusColumn: "status",
	showing: (shown: number, matching: number) =>
		`showing ${shown} of ${matching}`,
	loadMore: "load more",
	empty: "No polls match these filters.",
	loading: "Loading polls…",
	loadError: (reason: string) => `Error loading polls: ${reason}`,
} as const;

const THEME: KantoColor = "cerulean";
const ERROR_THEME: KantoColor = "cinnabar";

const STATUS_COLOR = {
	published: "viridian",
	draft: "saffron",
	archived: "pewter",
} satisfies Record<PollStatus, KantoColor>;

const TITLE_ROW = "flex w-full flex-wrap items-center gap-x-3 gap-y-2";
const COUNT = "text-theme-muted";
const SUGGEST = "ml-auto";
const TOOLBAR = "flex flex-wrap items-center gap-2";
const SEARCH = "min-w-48 flex-1 basis-64";
const CELLS = "flex w-full min-w-0 items-center gap-4";
const NUMBER = "w-8 shrink-0 text-xs text-theme-muted";
const CATEGORY = "w-28 shrink-0";
const QUESTION = "flex min-w-0 flex-1 flex-col gap-0.5";
const QUESTION_TEXT = "truncate text-sm font-bold text-theme-faint";
const CODE = "rounded-xs bg-theme-raised px-1 text-theme";
const BY = "flex w-28 shrink-0 items-center gap-2";
const AUTHOR_NAME = "truncate text-xs text-theme-soft";
const STATUS = "flex w-24 shrink-0 justify-end";

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
}: {
	segments: readonly QuestionSegment[];
	facts: string;
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

const Row = ({ row, admin }: { row: PollRow; admin: boolean }) => (
	<Panel.Row href={row.href}>
		<span className={CELLS}>
			<span className={NUMBER}>{row.number}</span>
			<span className={CATEGORY}>
				<Badge>{row.category}</Badge>
			</span>
			<Question segments={row.question} facts={row.facts} />
			{admin ? <Author author={row.author} /> : null}
			<span className={STATUS}>
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
	filter: PollListFilter;
	choices: PollListChoices;
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
	filter,
	choices,
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
					<Segmented
						label={COPY.status}
						items={choices.status}
						value={filter.status}
						onSelect={(status) => onFilterChange({ ...filter, status })}
					/>
					<Segmented
						label={COPY.answerType}
						items={choices.answerType}
						value={filter.answerType}
						onSelect={(answerType) => onFilterChange({ ...filter, answerType })}
					/>
					<Button
						label={COPY.withCode}
						cap={choices.withCode}
						capAt="trail"
						pressed={filter.withCode}
						onPress={() =>
							onFilterChange({ ...filter, withCode: !filter.withCode })
						}
					/>
					{choices.creator === undefined ? null : (
						<Select
							label={COPY.creator}
							options={choices.creator}
							value={filter.creator}
							onChange={(creator) => onFilterChange({ ...filter, creator })}
						/>
					)}
				</div>
				<Segmented
					label={COPY.category}
					items={choices.category}
					value={filter.category}
					look="loose"
					onSelect={(category) => onFilterChange({ ...filter, category })}
				/>
			</Panel.Body>

			<Panel.Columns columns={columnsOf(admin)} />
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

			<Panel.Footer
				trailing={
					onLoadMore === undefined ? undefined : (
						<Button
							label={COPY.loadMore}
							icon="chevron"
							iconAt="trail"
							onPress={onLoadMore}
						/>
					)
				}
			>
				<Typography variant="hint" as="span">
					{COPY.showing(shown, matching)}
				</Typography>
			</Panel.Footer>
		</Panel>
	</Screen>
);
