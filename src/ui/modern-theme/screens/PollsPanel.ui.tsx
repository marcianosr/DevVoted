import { Action } from "../Action.ui";
import { Filter, FilterSelect, type FilterOption } from "../Filter.ui";
import { Text } from "../Text.ui";
import type { ModernTone } from "../tones";

const PANEL = "flex flex-col gap-4 py-2";
const BAR = "flex flex-wrap items-center gap-3";
const SPACER = "ml-auto";

// table-fixed so the question column can truncate: an auto table sizes to its
// content and `truncate` never bites.
const TABLE = "w-full table-fixed border-collapse";
const HEAD = "text-left uppercase tracking-wide";
const CELL = "px-3 py-2";
const RIGHT = "text-right";
const NUMERIC = "text-right tabular-nums";
const CLIP = "truncate";

// Matches Fold's hover wash, so the stripe never reads louder than a hover.
const STRIPE = "odd:bg-zinc-100/5";

const FOOT =
	"flex flex-wrap items-center justify-between gap-4 rounded-lg border border-edge px-4 py-3";

const REDACTED = "???";
const UNANSWERED = "—";

const ACCURACY_HIGH = 70;
const ACCURACY_MID = 40;

/** The game's own thresholds (polldexColumns.ui.tsx), in this kit's tones. */
const accuracyTone = (accuracy: number): ModernTone => {
	if (accuracy >= ACCURACY_HIGH) return "celadon";
	return accuracy >= ACCURACY_MID ? "saffron" : "cinnabar";
};

const dexNumber = (poll: number) => `#${String(poll).padStart(4, "0")}`;

/** Same redaction the Audits tab uses: an unmet poll has no question to hand
 * over, so no caller can leak one into the markup. */
export type DexPoll =
	| {
			id: string;
			number: number;
			seen: true;
			question: string;
			category: string;
			timesSeen: number;
			/** null when it has been served but never answered. */
			accuracy: number | null;
	  }
	| { id: string; number: number; seen: false; question?: never };

export type PollsPanelProps = {
	filters: readonly FilterOption[];
	activeFilter: string;
	onFilter: (id: string) => void;
	categories: readonly { id: string; label: string }[];
	category: string;
	onCategory: (id: string) => void;
	polls: readonly DexPoll[];
	/** One object, so a count can never arrive without the control that reveals
	 * what it is counting. */
	unmet?: { count: number; shown: boolean; onToggle: () => void };
};

const COLUMNS = [
	{ id: "id", label: "ID", className: "w-20" },
	{ id: "question", label: "Question", className: undefined },
	{ id: "category", label: "Category", className: "w-32" },
	{ id: "seen", label: "Seen", className: `w-16 ${RIGHT}` },
	{ id: "accuracy", label: "Accuracy", className: `w-24 ${RIGHT}` },
];

const PollRow = ({ poll }: { poll: DexPoll }) => (
	<tr className={STRIPE}>
		<td className={CELL}>
			<Text size="meta" tone="muted" className="tabular-nums">
				{dexNumber(poll.number)}
			</Text>
		</td>
		<td className={CELL}>
			<Text size="body" tone={poll.seen ? "default" : "muted"} className={CLIP}>
				{poll.seen ? poll.question : REDACTED}
			</Text>
		</td>
		<td className={CELL}>
			<Text size="meta" tone="muted" className={CLIP}>
				{poll.seen ? poll.category : REDACTED}
			</Text>
		</td>
		<td className={`${CELL} ${NUMERIC}`}>
			<Text size="meta" tone="muted">
				{poll.seen ? poll.timesSeen : REDACTED}
			</Text>
		</td>
		<td className={`${CELL} ${NUMERIC}`}>
			{poll.seen && poll.accuracy !== null ? (
				<Text size="meta" tone={accuracyTone(poll.accuracy)}>
					{poll.accuracy}%
				</Text>
			) : (
				<Text size="meta" tone="muted">
					{poll.seen ? UNANSWERED : REDACTED}
				</Text>
			)}
		</td>
	</tr>
);

export const PollsPanel = ({
	filters,
	activeFilter,
	onFilter,
	categories,
	category,
	onCategory,
	polls,
	unmet,
}: PollsPanelProps) => (
	<section className={PANEL}>
		<div className={BAR}>
			<Filter
				options={filters}
				activeId={activeFilter}
				onSelect={onFilter}
				label="How much of a poll you have seen"
			/>
			<span className={SPACER}>
				<FilterSelect
					options={categories}
					value={category}
					onChange={onCategory}
					label="Category"
				/>
			</span>
		</div>

		<table className={TABLE}>
			<thead>
				<tr>
					{COLUMNS.map(({ id, label, className }) => (
						<th key={id} scope="col" className={`${CELL} ${className ?? ""}`}>
							<Text size="xxs" tone="muted" className={HEAD}>
								{label}
							</Text>
						</th>
					))}
				</tr>
			</thead>
			<tbody>
				{polls.map((poll) => (
					<PollRow key={poll.id} poll={poll} />
				))}
			</tbody>
		</table>

		{unmet ? (
			<div className={FOOT}>
				<Text size="meta" tone="muted">
					{unmet.count} polls you haven&apos;t met yet
				</Text>
				<Action
					label={unmet.shown ? "hide them" : "show as ???"}
					onUse={unmet.onToggle}
				/>
			</div>
		) : null}
	</section>
);
