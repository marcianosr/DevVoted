import { Link } from "@tanstack/react-router";

import type { Poll } from "~/modules/polls/poll/domain/poll.model";
import { Typography } from "~/ui/kanto-theme/Typography.ui";

const COPY = {
	adminHeading: "All Polls",
	ownHeading: "My Poll Submissions",
	loadingHeading: "Available Polls",
	loading: "Loading polls...",
	create: "Create Poll",
	status: "Status:",
	category: "Category:",
	creator: "Creator:",
	all: "All",
	empty: "No polls matching the selected filters.",
	category_: (code: string) => `Category: ${code}`,
	loadError: (reason: string) => `Error loading polls: ${reason}`,
} as const;

const PAGE = "p-4";
const CHIP = "px-3 py-1 rounded-full text-sm transition-colors";
const CHIP_ON = "bg-primary text-white";
const CHIP_OFF = "bg-gray-700 text-gray-300 hover:bg-gray-600";
const FILTER_ROW = "flex flex-wrap gap-2 mb-2";
const FILTER_LABEL = "text-sm text-gray-400 self-center w-20";

export type FilterChoice<Value extends string> = {
	value: Value;
	label: string;
	count?: number;
};

type FilterRowProps<Value extends string> = {
	label: string;
	choices: readonly FilterChoice<Value>[];
	selected: Value;
	/** The category row highlights with the theme colour, the rest with primary. */
	accent?: "primary" | "theme";
	onSelect: (value: Value) => void;
};

const FilterRow = <Value extends string>({
	label,
	choices,
	selected,
	accent = "primary",
	onSelect,
}: FilterRowProps<Value>) => (
	<div className={FILTER_ROW}>
		<span className={FILTER_LABEL}>{label}</span>
		{choices.map((choice) => (
			<button
				key={choice.value}
				onClick={() => onSelect(choice.value)}
				className={`${CHIP} ${
					selected === choice.value
						? accent === "theme"
							? "bg-theme text-white"
							: CHIP_ON
						: CHIP_OFF
				}`}
			>
				{choice.label}
				{choice.count === undefined ? "" : ` (${choice.count})`}
			</button>
		))}
	</div>
);

export const PollListLoading = () => (
	<div className={PAGE}>
		<h1 className="text-2xl mb-4">{COPY.loadingHeading}</h1>
		<p>{COPY.loading}</p>
	</div>
);

export const PollListError = ({ message }: { message: string }) => (
	<div className={PAGE} data-screen-theme="cinnabar">
		<Typography variant="title">{COPY.loadError(message)}</Typography>
	</div>
);

export type PollListProps<Status extends string, Category extends string> = {
	polls: readonly Poll[];
	total: number;
	isAdmin: boolean;
	statusChoices: readonly FilterChoice<Status>[];
	statusFilter: Status;
	categoryChoices: readonly FilterChoice<Category>[];
	categoryFilter: Category;
	creatorChoices: readonly FilterChoice<string>[];
	creatorFilter: string;
	onStatusChange: (value: Status) => void;
	onCategoryChange: (value: Category) => void;
	onCreatorChange: (value: string) => void;
};

export const PollList = <Status extends string, Category extends string>({
	polls,
	total,
	isAdmin,
	statusChoices,
	statusFilter,
	categoryChoices,
	categoryFilter,
	creatorChoices,
	creatorFilter,
	onStatusChange,
	onCategoryChange,
	onCreatorChange,
}: PollListProps<Status, Category>) => (
	<div className={PAGE}>
		<div className="flex justify-between items-center mb-4">
			<h1 className="text-2xl">
				{isAdmin ? COPY.adminHeading : COPY.ownHeading}{" "}
				<span className="text-gray-400">({total})</span>
			</h1>
			<Link
				to="/polls/new"
				className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80"
			>
				{COPY.create}
			</Link>
		</div>

		<FilterRow
			label={COPY.status}
			choices={statusChoices}
			selected={statusFilter}
			onSelect={onStatusChange}
		/>
		<FilterRow
			label={COPY.category}
			choices={categoryChoices}
			selected={categoryFilter}
			accent="theme"
			onSelect={onCategoryChange}
		/>
		{isAdmin && creatorChoices.length > 1 && (
			<FilterRow
				label={COPY.creator}
				choices={creatorChoices}
				selected={creatorFilter}
				onSelect={onCreatorChange}
			/>
		)}

		{polls.length === 0 ? (
			<p>{COPY.empty}</p>
		) : (
			<div className="space-y-4">
				{polls.map((poll) => (
					<div
						key={poll.id}
						className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
					>
						<Link
							to="/polls/$pollId"
							params={{ pollId: String(poll.id) }}
							className="text-cerulean hover:underline"
						>
							<div>{poll.id}</div>
							<div>{poll.question}</div>
							<div className="text-sm text-gray-500 mt-1 flex justify-between">
								<span>{COPY.category_(poll.categoryCode)}</span>
								<span className="capitalize">{poll.status}</span>
							</div>
						</Link>
					</div>
				))}
			</div>
		)}
	</div>
);
