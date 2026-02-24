import clsx from "clsx";

import type { GateType, GateStake } from "~/domains/gates/models/gateType";
import { STAKE_LABELS } from "~/domains/gates/models/gateType";

type GateOptionCardProps = {
	gateType: GateType;
	isSelected?: boolean;
	onClick?: () => void;
	isCurrent?: boolean;
};

const STAKE_BG_CLASSES: Record<GateStake, string> = {
	very_easy: "border-green-600 bg-green-900/20",
	easy: "border-green-500 bg-green-900/10",
	medium: "border-orange-500 bg-orange-900/20",
	hard: "border-red-500 bg-red-900/20",
	very_hard: "border-red-600 bg-red-900/30",
};

const STAKE_SELECTED_CLASSES: Record<GateStake, string> = {
	very_easy: "border-green-400 bg-green-800/40 ring-2 ring-green-400",
	easy: "border-green-400 bg-green-800/30 ring-2 ring-green-400",
	medium: "border-orange-400 bg-orange-800/40 ring-2 ring-orange-400",
	hard: "border-red-400 bg-red-800/40 ring-2 ring-red-400",
	very_hard: "border-red-300 bg-red-800/50 ring-2 ring-red-300",
};

const STAKE_TEXT_CLASSES: Record<GateStake, string> = {
	very_easy: "text-green-400",
	easy: "text-green-400",
	medium: "text-orange-400",
	hard: "text-red-400",
	very_hard: "text-red-300",
};

export const GateOptionCard = ({
	gateType,
	isSelected = false,
	onClick,
	isCurrent = false,
}: GateOptionCardProps) => {
	const cardClass = clsx(
		"rounded-lg border-2 p-4 transition-all duration-200 cursor-pointer",
		isSelected
			? STAKE_SELECTED_CLASSES[gateType.stake]
			: STAKE_BG_CLASSES[gateType.stake],
		!isSelected && "hover:opacity-80"
	);

	return (
		<button
			type="button"
			onClick={onClick}
			className={clsx(cardClass, "w-full text-left")}
		>
			<div className="flex items-center justify-between mb-2">
				<h3 className="text-lg font-bold text-white">
					{gateType.name}
					{isCurrent && (
						<span className="ml-2 text-xs text-gray-400">(Current)</span>
					)}
				</h3>
				<span
					className={clsx(
						"text-sm font-medium px-2 py-0.5 rounded",
						STAKE_TEXT_CLASSES[gateType.stake]
					)}
				>
					{STAKE_LABELS[gateType.stake]}
				</span>
			</div>
			<p className="text-sm text-gray-300 mb-3">{gateType.description}</p>
			<div className="text-xs text-gray-400">
				{gateType.pollsPerGate} polls per gate
				{gateType.modifierConfig?.wrongAnswerCoverageRate && (
					<span className="ml-2 text-green-400">
						+{Math.round(gateType.modifierConfig.wrongAnswerCoverageRate * 100)}
						% coverage on wrong answers
					</span>
				)}
			</div>
		</button>
	);
};
