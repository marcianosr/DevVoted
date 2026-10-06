import type { ReactNode } from "react";

import type {
	PollDetailData,
	PollDetailView,
} from "~/modules/polls/authoring/application/pollDetail.viewmodel";
import type { PollStep } from "~/modules/polls/authoring/application/pollList.viewmodel";
import { PollStepper } from "~/modules/polls/authoring/presentation/PollStepper.ui";
import type { PollStatus } from "~/modules/polls/poll/domain/poll.model";
import { PollCodeSandboxEmbed } from "~/modules/polls/poll/presentation/PollCodeSandboxEmbed.ui";
import { Author } from "~/ui/kanto-theme/Author.ui";
import { Badge } from "~/ui/kanto-theme/Badge.ui";
import { Button } from "~/ui/kanto-theme/Button.ui";
import type { KantoColor } from "~/ui/kanto-theme/colors";
import { Panel } from "~/ui/kanto-theme/Panel.ui";
import {
	CodeSpans,
	Question,
	questionFactsOf,
} from "~/ui/kanto-theme/Question.ui";
import { Screen } from "~/ui/kanto-theme/Screen.ui";
import { Segmented } from "~/ui/kanto-theme/Segmented.ui";
import { Typography } from "~/ui/kanto-theme/Typography.ui";

export const COPY = {
	edit: "Edit poll",
	review: "Mark reviewed",
	reviewed: "reviewed",
	view: "Show the poll",
	player: "as a player",
	answer: "with the answer",
	created: (date: string) => `created ${date}`,
	explanation: "Explanation",
	loading: "Loading poll…",
	accessDenied: "Access denied",
	accessDeniedBody: "You can only view polls that you have created.",
	loadError: "Error loading poll",
} as const;

const THEME: KantoColor = "cerulean";
const ERROR_THEME: KantoColor = "cinnabar";

const STATUS_COLOR = {
	published: "viridian",
	draft: "saffron",
	archived: "pewter",
} satisfies Record<PollStatus, KantoColor>;

const TOP_ROW = "flex w-full flex-wrap items-center gap-3";
const EDIT = "ml-auto flex items-center gap-2";
const REVIEWED_COLOR: KantoColor = "celadon";
const META_REGION =
	"flex w-full flex-wrap items-center gap-2 border-b border-theme-faint px-4 py-3";
const META_TRAILING = "flex flex-wrap items-center gap-2 sm:ml-auto";

const VIEW_ITEMS: readonly { value: PollDetailView; label: string }[] = [
	{ value: "player", label: COPY.player },
	{ value: "answer", label: COPY.answer },
];

export const PollDetailLoading = () => (
	<Screen theme={THEME} width="default" ground="bare">
		<Typography variant="hint">{COPY.loading}</Typography>
	</Screen>
);

export const PollDetailError = ({ message }: { message: string }) => {
	const isAccessDenied = message === "Access denied";

	return (
		<Screen theme={ERROR_THEME} width="default" ground="bare">
			<Typography variant="title">
				{isAccessDenied ? COPY.accessDenied : COPY.loadError}
			</Typography>
			{isAccessDenied ? (
				<Typography variant="hint">{COPY.accessDeniedBody}</Typography>
			) : null}
		</Screen>
	);
};

export type PollDetailProps = PollDetailData & {
	canEdit: boolean;
	editHref: string;
	listHref: string;
	step?: PollStep;
	reviewed?: boolean;
	onReview?: () => void;
	view: PollDetailView;
	onView: (view: PollDetailView) => void;
};

const Credit = ({
	author,
	created,
}: Pick<PollDetailProps, "author" | "created">): ReactNode => (
	<Panel.Footer
		trailing={
			<Typography variant="hint" as="span">
				{COPY.created(created)}
			</Typography>
		}
	>
		{author === undefined ? null : (
			<Author
				name={author.name}
				photoUrl={author.photoUrl}
				userId={author.userId}
				size="sm"
				rule={false}
			/>
		)}
	</Panel.Footer>
);

const Review = ({
	reviewed,
	onReview,
}: Pick<PollDetailProps, "reviewed" | "onReview">): ReactNode => {
	if (reviewed) return <Badge color={REVIEWED_COLOR}>{COPY.reviewed}</Badge>;
	if (onReview === undefined) return null;
	return (
		<Button label={COPY.review} tone="ambient" size="md" onPress={onReview} />
	);
};

export const PollDetail = ({
	number,
	category,
	status,
	created,
	question,
	codeSandboxExample,
	author,
	explanation,
	canEdit,
	editHref,
	listHref,
	step,
	reviewed = false,
	onReview,
	view,
	onView,
}: PollDetailProps) => (
	<Screen theme={THEME} width="default" ground="bare">
		<div className={TOP_ROW}>
			<PollStepper listHref={listHref} step={step} />
			{canEdit ? (
				<span className={EDIT}>
					<Review reviewed={reviewed} onReview={onReview} />
					<Button label={COPY.edit} tone="action" size="md" href={editHref} />
				</span>
			) : null}
		</div>

		<Panel>
			<div className={META_REGION}>
				<Typography variant="label" as="span">
					{number}
				</Typography>
				<Badge>{category}</Badge>
				<Typography variant="hint" as="span">
					{questionFactsOf(question)}
				</Typography>
				<span className={META_TRAILING}>
					<Segmented
						label={COPY.view}
						items={VIEW_ITEMS}
						value={view}
						onSelect={onView}
					/>
					<Badge color={STATUS_COLOR[status]}>{status}</Badge>
				</span>
			</div>
			<Panel.Body>
				<Question {...question} />
				{codeSandboxExample === undefined ? null : (
					<PollCodeSandboxEmbed url={codeSandboxExample} />
				)}
			</Panel.Body>
			<Credit author={author} created={created} />
		</Panel>

		{explanation === undefined || view === "player" ? null : (
			<Panel>
				<Panel.Header label={COPY.explanation} />
				<Panel.Body>
					<Typography variant="caption" as="p">
						<CodeSpans text={explanation} />
					</Typography>
				</Panel.Body>
			</Panel>
		)}
	</Screen>
);
