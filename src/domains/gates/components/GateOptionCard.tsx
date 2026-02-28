import { clsx } from "clsx";

import type { GateType, GateStake } from "~/domains/gates/models/gateType";
import { STAKE_LABELS } from "~/domains/gates/models/gateType";

type GateOptionCardProps = {
	gateType: GateType;
	isSelected?: boolean;
	onClick?: () => void;
	isCurrent?: boolean;
};

const STAKE_BG_CLASSES: Record<GateStake, string> = {
	very_easy: "border-cerulean bg-cerulean",
	easy: "border-celadon bg-celadon",
	medium: "border-saffron bg-saffron",
	hard: "border-cinnabar bg-cinnabar",
	very_hard: "border-lavender bg-lavender",
};

const STAKE_SELECTED_CLASSES: Record<GateStake, string> = {
	very_easy: "border-cerulean bg-cerulean ring-2 ring-cerulean",
	easy: "border-celadon bg-celadon ring-2 ring-celadon",
	medium: "border-saffron bg-saffron ring-2 ring-saffron",
	hard: "border-cinnabar bg-cinnabar ring-2 ring-cinnabar",
	very_hard: "border-lavender bg-lavender ring-2 ring-lavender",
};

const STAKE_TEXT_CLASSES: Record<GateStake, string> = {
	very_easy: "text-cerulean",
	easy: "text-celadon",
	medium: "text-saffron",
	hard: "text-cinnabar",
	very_hard: "text-lavender",
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
				{/* {gateType.modifierConfig?.wrongAnswerCoverageRate && (
					<span className="ml-2 text-green-400"></span>
				)} */}
			</div>
		</button>
	);
};
