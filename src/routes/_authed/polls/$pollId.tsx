import { createFileRoute } from "@tanstack/react-router";
import { clsx } from "clsx";

import { getPollByIdWithOptions } from "~/domains/polls/api/polls";
import { PollCodeBlock } from "~/domains/polls/components/PollCodeBlock";
import { PollCodeSandboxEmbed } from "~/domains/polls/components/PollCodeSandboxEmbed";
import { PollQuestionDisplay } from "~/domains/polls/components/PollQuestionDisplay";

const PollDetail: React.FC = () => {
	const { poll, options } = Route.useLoaderData();

	return (
		<section className="max-w-5xl mx-auto">
			<aside>
				<h2>#{poll.pollNumber}</h2>
				<p className="text-sm text-gray-400">
					Created at: {new Date(poll.createdAt).toLocaleDateString()}
				</p>
				<p className="text-sm text-gray-400">Created by: {poll.createdBy}</p>
				<p>
					Status:
					<span
						className={clsx("ml-2 font-semibold", {
							"text-green-400": poll.status === "open",
							"text-red-400": poll.status === "closed",
							"text-yellow-400": poll.status === "draft",
						})}
					>
						{poll.status}
					</span>
				</p>
				<p className="text-theme">Category: {poll.categoryCode}</p>
			</aside>
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

export const Route = createFileRoute("/_authed/polls/$pollId")({
	component: PollDetail,
	loader: async ({ params }) => {
		const response = await getPollByIdWithOptions({
			data: { id: Number(params.pollId) },
		});

		if (!response.success) {
			throw new Error(response.error);
		}

		return response.data;
	},
	pendingComponent: () => (
		<section className="max-w-5xl mx-auto p-4">
			<div className="animate-pulse">Loading poll...</div>
		</section>
	),
	pendingMs: 300,
	errorComponent: () => {
		return (
			<section className="max-w-5xl mx-auto">
				<h1 className="text-red-500 text-3xl">Error loading poll</h1>
			</section>
		);
	},
});
