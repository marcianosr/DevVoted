export type PollOption = {
	id: number;
	pollId: number;
	option: string;
	correct: boolean;
	group: number | null;
};
