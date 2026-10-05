import { createFileRoute } from "@tanstack/react-router";

import { Wiki } from "~/modules/guide/wiki/presentation/Wiki.component";

const WikiArticlePage = () => {
	const { articleId } = Route.useParams();
	return <Wiki articleId={articleId} />;
};

export const Route = createFileRoute("/wiki/$articleId")({
	component: WikiArticlePage,
});
