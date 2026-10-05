export const WIKI_PATH = "/wiki";

export const wikiPathFor = (articleId: string): string =>
	`${WIKI_PATH}/${articleId}`;
