export type GateDifficulty = "easy" | "normal" | "hard" | "intense";

export type GateConstraint = {
	id: string;
	description: string;
};

export type GateReward = {
	id: string;
	description: string;
};

export type HttpGate = {
	httpCode: number;
	bugName: string;
	difficulty: GateDifficulty;
	constraint: GateConstraint | null;
	reward: GateReward | null;
};
