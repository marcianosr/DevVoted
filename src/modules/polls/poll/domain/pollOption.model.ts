export type PollOption = {
	id: number;
	pollId: number;
	option: string;
	correct: boolean;
	explanation: string | null;
};
