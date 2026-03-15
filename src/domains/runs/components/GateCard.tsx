import { clsx } from "clsx";

import type { HttpGate } from "~/domains/runs/models/httpGate";
import { DIFFICULTY_COLORS } from "~/domains/runs/utils/gateDifficultyStyles";
import { Card } from "~/ui/Card";

type GateCardProps = {
	gate: HttpGate;
};

export const GateCard = ({ gate }: GateCardProps) => {
	const colors = DIFFICULTY_COLORS[gate.difficulty];

	return (
		<Card borderClass={colors.border} bgClass={colors.bg} className="border-2">
			<h3 className={clsx("text-3xl font-bold", colors.text)}>
				{gate.httpCode}
			</h3>
			<p className="text-gray-200 mt-1">{gate.bugName}</p>
			<p className="text-xs text-gray-500 uppercase tracking-wider mt-1">
				{gate.difficulty}
			</p>
			<div className="mt-3 flex flex-col gap-1">
				{gate.constraint ? (
					<p className="text-cinnabar text-sm">
						⚠ {gate.constraint.description}
					</p>
				) : (
					<p className="text-gray-600 text-sm">No constraint</p>
				)}
				{gate.reward && (
					<p className="text-celadon text-sm">✦ {gate.reward.description}</p>
				)}
			</div>
		</Card>
	);
};
