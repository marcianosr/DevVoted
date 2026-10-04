import { Link } from "@tanstack/react-router";
import { clsx } from "clsx";
import { format } from "date-fns";

import { PollCodeBlock } from "~/modules/polls/poll/presentation/PollCodeBlock.ui";
import { PollCodeSandboxEmbed } from "~/modules/polls/poll/presentation/PollCodeSandboxEmbed.ui";
import type { PollStatus } from "~/modules/polls/poll/domain/poll.model";
import type { PollOption } from "~/modules/polls/poll/domain/pollOption.model";
import { PollQuestionHeading } from "~/modules/run/poll/presentation/PollQuestionHeading.ui";

const COPY = {
	edit: "✏️ Edit Poll",
	createdAt: "Created at:",
	createdBy: "Created by:",
	status: "Status:",
	category: "Category:",
	loading: "Loading poll...",
	accessDenied: "Access Denied",
	accessDeniedBody: "You can only view polls that you have created.",
	loadError: "Error loading poll",
} as const;

const STATUS_COLOR: Record<PollStatus, string> = {
	published: "text-viridian",
	draft: "text-saffron",
	archived: "text-pewter",
};

const PAGE = "max-w-5xl mx-auto p-4";
const META = "text-sm text-gray-400";

export const PollDetailLoading = () => (
	<section className={PAGE}>
		<div className="animate-pulse">{COPY.loading}</div>
	</section>
);

export const PollDetailError = ({ message }: { message: string }) => {
	const isAccessDenied = message === "Access denied";

	return (
		<section className={PAGE}>
			<h1 className="text-cinnabar text-3xl">
				{isAccessDenied ? COPY.accessDenied : COPY.loadError}
			</h1>
			{isAccessDenied && (
				<p className="text-gray-400 mt-2">{COPY.accessDeniedBody}</p>
			)}
		</section>
	);
};

export type PollDetailProps = {
	id: number;
	question: string;
	status: PollStatus;
	categoryCode: string;
	createdAt: Date;
	createdBy: string;
	codeBlock: string | null;
	codeSandboxExample: string | null;
	options: readonly PollOption[];
	isAdmin: boolean;
};

export const PollDetail = ({
	id,
	question,
	status,
	categoryCode,
	createdAt,
	createdBy,
	codeBlock,
	codeSandboxExample,
	options,
	isAdmin,
}: PollDetailProps) => (
	<section className={PAGE}>
		{isAdmin && (
			<div className="mb-4 pb-2 border-b border-gray-700">
				<Link
					to="/polls/$pollId/edit"
					params={{ pollId: String(id) }}
					className="text-primary hover:text-primary/80 hover:underline text-sm"
				>
					{COPY.edit}
				</Link>
			</div>
		)}
		<div className="flex justify-between items-start mb-4">
			<aside>
				<h2>#{id}</h2>
				<p className={META}>
					{COPY.createdAt} {format(createdAt, "MM/dd/yyyy")}
				</p>
				<p className={META}>
					{COPY.createdBy} {createdBy}
				</p>
				<p>
					{COPY.status}
					<span className={clsx("ml-2 font-semibold", STATUS_COLOR[status])}>
						{status}
					</span>
				</p>
				<p className="text-theme">
					{COPY.category} {categoryCode}
				</p>
			</aside>
		</div>
		<PollQuestionHeading question={question} />
		{codeSandboxExample && <PollCodeSandboxEmbed url={codeSandboxExample} />}
		{codeBlock && <PollCodeBlock code={codeBlock} />}
		<ul>
			{options.map((option) => (
				<li
					key={option.id}
					className={clsx("list-disc mx-8", {
						"text-viridian": option.correct,
					})}
				>
					{option.option}
				</li>
			))}
		</ul>
	</section>
);
