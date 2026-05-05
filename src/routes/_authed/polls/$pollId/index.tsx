import { createFileRoute, Link } from "@tanstack/react-router";
import { clsx } from "clsx";
import { format } from "date-fns";

import { getPollByIdWithOptions } from "~/domains/polls/api/polls";
import { PollCodeBlock } from "~/domains/polls/components/PollCodeBlock.component";
import { PollCodeSandboxEmbed } from "~/domains/polls/components/PollCodeSandboxEmbed.component";
import { PollQuestionDisplay } from "~/domains/polls/components/PollQuestionDisplay.component";

const PollDetail: React.FC = () => {
	const { poll, options, isAdmin } = Route.useLoaderData();

	return (
		<section className="max-w-5xl mx-auto p-4">
			{isAdmin && (
				<div className="mb-4 pb-2 border-b border-gray-700">
					<Link
						to="/polls/$pollId/edit"
						params={{ pollId: String(poll.id) }}
						className="text-primary hover:text-primary/80 hover:underline text-sm"
					>
						✏️ Edit Poll
					</Link>
				</div>
			)}
			<div className="flex justify-between items-start mb-4">
				<aside>
					<h2>#{poll.id}</h2>
					<p className="text-sm text-gray-400">
						Created at: {format(new Date(poll.createdAt), "MM/dd/yyyy")}
					</p>
					<p className="text-sm text-gray-400">Created by: {poll.createdBy}</p>
					<p>
						Status:
						<span
							className={clsx("ml-2 font-semibold", {
								"text-green-400": poll.status === "published",
								"text-yellow-400": poll.status === "draft",
								"text-gray-400": poll.status === "archived",
							})}
						>
							{poll.status}
						</span>
					</p>
					<p className="text-theme">Category: {poll.categoryCode}</p>
				</aside>
			</div>
			<PollQuestionDisplay poll={poll} />
			{poll.codeSandboxExample && (
				<PollCodeSandboxEmbed url={poll.codeSandboxExample} />
			)}
			{poll.codeBlock && <PollCodeBlock code={poll.codeBlock} />}
			<ul>
				{options.map((option) => (
					<li
						key={option.id}
						className={clsx("list-disc mx-8", {
							"text-green-400": option.correct,
						})}
					>
						{option.option}
					</li>
				))}
			</ul>
		</section>
	);
};

export const Route = createFileRoute("/_authed/polls/$pollId/")({
	component: PollDetail,
	loader: async ({ params }) => {
		const response = await getPollByIdWithOptions({
			data: { id: Number(params.pollId) },
		});

		if (!response.success) {
			throw new Error(response.error);
		}

		return { ...response.data, isAdmin: response.isAdmin };
	},
	pendingComponent: () => (
		<section className="max-w-5xl mx-auto p-4">
			<div className="animate-pulse">Loading poll...</div>
		</section>
	),
	pendingMs: 300,
	errorComponent: ({ error }) => {
		const isAccessDenied = error.message === "Access denied";
		return (
			<section className="max-w-5xl mx-auto p-4">
				<h1 className="text-red-500 text-3xl">
					{isAccessDenied ? "Access Denied" : "Error loading poll"}
				</h1>
				{isAccessDenied && (
					<p className="text-gray-400 mt-2">
						You can only view polls that you have created.
					</p>
				)}
			</section>
		);
	},
});
