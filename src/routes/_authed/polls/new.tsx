import { createFileRoute } from "@tanstack/react-router";

import { PollCreate } from "~/modules/polls/authoring/presentation/PollCreate.component";
import { type CategoryCode, isCategoryCode } from "~/shared/lib/categories";

type SuggestSearch = { category?: CategoryCode };

const SuggestPoll = () => {
	const { category } = Route.useSearch();

	return <PollCreate category={category} />;
};

export const Route = createFileRoute("/_authed/polls/new")({
	validateSearch: (search: Record<string, unknown>): SuggestSearch => ({
		category:
			typeof search.category === "string" && isCategoryCode(search.category)
				? search.category
				: undefined,
	}),
	component: SuggestPoll,
});
