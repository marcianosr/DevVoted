import { useNavigate } from "@tanstack/react-router";

import { wikiScreenFor } from "~/modules/guide/wiki/application/wikiArticles.viewmodel";

import { WikiScreen } from "./WikiScreen.ui";

export type WikiProps = { articleId?: string };

export const Wiki = ({ articleId }: WikiProps) => {
	const navigate = useNavigate();

	return (
		<WikiScreen
			{...wikiScreenFor(articleId)}
			onNavigate={(href) => navigate({ href })}
		/>
	);
};
