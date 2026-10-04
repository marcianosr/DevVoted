export const POLLS_PATH = "/polls";
export const SUGGEST_POLL_PATH = "/polls/new";

export const pollPathFor = (pollId: number): string =>
	`${POLLS_PATH}/${pollId}`;
