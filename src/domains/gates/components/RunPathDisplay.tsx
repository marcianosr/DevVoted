import clsx from "clsx";

import type { GateStake } from "~/domains/gates/models/gateType";
import type { RunGateHistoryWithType } from "~/domains/gates/models/runGateHistory";

type RunPathDisplayProps = {
	gatePath: RunGateHistoryWithType[];
	currentGateNumber: number;
};

const STAKE_DOT_COLORS: Record<GateStake, string> = {
	very_easy: "bg-cerulean",
	easy: "bg-celadon",
	medium: "bg-saffron",
	hard: "bg-cinnabar",
	very_hard: "bg-lavender",
};

const STAKE_DOT_GLOW: Record<GateStake, string> = {
	very_easy: "shadow-cerulean/50",
	easy: "shadow-celadon/50",
	medium: "shadow-saffron/50",
	hard: "shadow-cinnabar/50",
	very_hard: "shadow-lavender/50",
};

export const RunPathDisplay = ({
	gatePath,
	currentGateNumber,
}: RunPathDisplayProps) => {
	if (gatePath.length === 0) {
		return null;
	}

	return (
		<div className="flex items-center gap-1">
			{gatePath.map((gate, index) => {
				const isCurrent = gate.gateNumber === currentGateNumber;
				const isPassed = gate.passed === true;
				const isFailed = gate.passed === false;

				return (
					<div
						key={gate.gateNumber}
						className="flex items-center"
						title={`Gate ${gate.gateNumber}: ${gate.gateTypeName}`}
					>
						{/* Connection line to previous gate */}
						{index > 0 && (
							<div
								className={clsx(
									"w-3 h-0.5",
									isPassed || isCurrent ? "bg-gray-500" : "bg-gray-700"
								)}
							/>
						)}

						{/* Gate dot */}
						<div
							className={clsx(
								"rounded-full transition-all",
								isCurrent ? "w-4 h-4 shadow-lg" : "w-3 h-3",
								STAKE_DOT_COLORS[gate.stake],
								isCurrent && STAKE_DOT_GLOW[gate.stake],
								isFailed && "opacity-40 line-through",
								isPassed && "ring-1 ring-white/30"
							)}
						/>
					</div>
				);
			})}
		</div>
	);
};

/**
 * Compact version for header/progress bar display
 */
export const RunPathDisplayCompact = ({
	gatePath,
	currentGateNumber,
}: RunPathDisplayProps) => {
	if (gatePath.length === 0) {
		return <span className="text-gray-500 text-sm">Gate 1</span>;
	}

	const currentGate = gatePath.find((g) => g.gateNumber === currentGateNumber);

	return (
		<div className="flex items-center gap-2">
			<RunPathDisplay
				gatePath={gatePath}
				currentGateNumber={currentGateNumber}
			/>
			<span className="text-gray-400 text-sm">
				Gate {currentGateNumber}
				{currentGate && (
					<span className="text-gray-500 ml-1">
						({currentGate.gateTypeName})
					</span>
				)}
			</span>
		</div>
	);
};
