import type { ReactNode } from "react";

import type {
	PollDetailData,
	PollDetailView,
} from "~/modules/polls/authoring/application/pollDetail.viewmodel";
import type { PollStatus } from "~/modules/polls/poll/domain/poll.model";
import { PollCodeSandboxEmbed } from "~/modules/polls/poll/presentation/PollCodeSandboxEmbed.ui";
import { POLLS_PATH, pollPathFor } from "~/shared/lib/pollPath";
import { Author } from "~/ui/kanto-theme/Author.ui";
import { Badge } from "~/ui/kanto-theme/Badge.ui";
import { Button } from "~/ui/kanto-theme/Button.ui";
import type { KantoColor } from "~/ui/kanto-theme/colors";
import { Link } from "~/ui/kanto-theme/Link.ui";
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
	back: "← Polls",
	edit: "Edit poll",
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
const EDIT = "ml-auto";
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

export const PollDetail = ({
	id,
	number,
	category,
	status,
	created,
	question,
	codeSandboxExample,
	author,
	explanation,
	canEdit,
	view,
	onView,
}: PollDetailProps) => (
	<Screen theme={THEME} width="default" ground="bare">
		<div className={TOP_ROW}>
			<Link href={POLLS_PATH}>{COPY.back}</Link>
			{canEdit ? (
				<span className={EDIT}>
					<Button
						label={COPY.edit}
						tone="action"
						size="md"
						href={`${pollPathFor(id)}/edit`}
					/>
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
