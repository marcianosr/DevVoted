import { clsx } from "clsx";

import type { GateType, GateStake } from "~/domains/gates/models/gateType";
import { STAKE_LABELS } from "~/domains/gates/models/gateType";

type GateOptionCardProps = {
	gateType: GateType;
	isSelected?: boolean;
	onClick?: () => void;
	isCurrent?: boolean;
	isLocked?: boolean;
};

const STAKE_BG_CLASSES: Record<GateStake, string> = {
	very_easy: "border-cerulean border-cerulean hover:bg-cerulean/10",
	easy: "border-celadon border-celadon hover:bg-celadon/10",
	medium: "border-saffron border-saffron hover:bg-saffron/10",
	hard: "border-cinnabar border-cinnabar hover:bg-cinnabar/10",
	very_hard: "border-lavender border-lavender hover:bg-lavender/10",
};

const STAKE_SELECTED_CLASSES: Record<GateStake, string> = {
	very_easy: "border-cerulean bg-cerulean/20 ring-2 ring-cerulean",
	easy: "border-celadon bg-celadon/20 ring-2 ring-celadon",
	medium: "border-saffron bg-saffron/20 ring-2 ring-saffron",
	hard: "border-cinnabar bg-cinnabar/20 ring-2 ring-cinnabar",
	very_hard: "border-lavender bg-lavender/20 ring-2 ring-lavender",
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
	isLocked = false,
}: GateOptionCardProps) => {
	if (isLocked) {
		return (
			<div className="border-2 border-gray-700 bg-gray-800/50 p-4 opacity-60">
				<div className="flex items-center justify-between mb-2">
					<h3 className="text-lg text-gray-500">{gateType.name}</h3>
					<span className="text-sm px-2 py-0.5 text-gray-500">Locked</span>
				</div>
				<p className="text-sm text-gray-500 mb-2">{gateType.description}</p>
				{gateType.unlockCondition && (
					<p className="text-xs text-gray-400">{gateType.unlockCondition}</p>
				)}
			</div>
		);
	}

	const cardClass = clsx(
		"border-2 p-4 transition-all duration-200 cursor-pointer",
		isSelected
			? STAKE_SELECTED_CLASSES[gateType.stake]
			: STAKE_BG_CLASSES[gateType.stake],
		!isSelected && "hover:opacity-80"
	);

	return (
		<button
			type="button"
			onClick={onClick}
			className={clsx(cardClass, "text-left h-full")}
		>
			<div className="flex justify-between mb-2">
				<h3 className="text-lg text-white">
					{gateType.name}
					{isCurrent && (
						<span className="ml-2 text-xs text-gray-400">(Current)</span>
					)}
				</h3>
				<span
					className={clsx(
						"text-sm px-2 py-0.5",
						STAKE_TEXT_CLASSES[gateType.stake]
					)}
				>
					{STAKE_LABELS[gateType.stake]}
				</span>
			</div>
			<p className="text-sm text-gray-300 mb-3">{gateType.description}</p>
			{(gateType.reward || gateType.constraint) && (
				<>
					<hr className="border-gray-700 mb-3" />
					<ul className="flex flex-col gap-2 text-xs list-disc pl-2">
						<h4 className="text-lg">Gate effects:</h4>
						{gateType.reward && (
							<li className="text-green-300">
								<span>{gateType.reward}</span>
							</li>
						)}
						{gateType.constraint && (
							<li className="text-red-300">
								<span>{gateType.constraint}</span>
							</li>
						)}
					</ul>
				</>
			)}
		</button>
	);
};
