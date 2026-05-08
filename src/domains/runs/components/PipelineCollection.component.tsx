import type { GateDifficulty, GateTypeId } from "~/domains/runs/models/pipeline.model";
import {
	GATE_DIFFICULTIES,
	GATE_TYPE_IDS,
	toSlotKey,
} from "~/domains/runs/utils/pipelineCollection";

type PipelineCollectionProps = {
	discoveredKeys: Set<string>;
};

const GATE_TYPE_LABELS: Record<GateTypeId, string> = {
	"coverage-gain": "Coverage Gain",
	"correct-answers": "Correct Answers",
	"short-window": "Short Window",
	"cold-start": "Cold Start",
	"category-mastery": "Category Mastery",
};

const DIFFICULTY_COLORS: Record<GateDifficulty, string> = {
	low: "text-green-400 border-green-400",
	medium: "text-blue-400 border-blue-400",
	high: "text-orange-400 border-orange-400",
	critical: "text-red-500 border-red-500",
};

const DIFFICULTY_BG: Record<GateDifficulty, string> = {
	low: "bg-green-400/10",
	medium: "bg-blue-400/10",
	high: "bg-orange-400/10",
	critical: "bg-red-500/10",
};

type SlotCardProps = {
	gateTypeId: GateTypeId;
	difficulty: GateDifficulty;
	discovered: boolean;
};

const SlotCard = ({ gateTypeId, difficulty, discovered }: SlotCardProps) => {
	if (!discovered) {
		return (
			<div className="flex flex-col gap-1 border border-gray-800 rounded p-3 min-h-[80px] bg-gray-900/30">
				<span className="text-xs text-gray-600 uppercase tracking-widest">
					{difficulty}
				</span>
				<span className="text-xs text-gray-600 mt-auto">not discovered</span>
			</div>
		);
	}

	return (
		<div
			className={`flex flex-col gap-2 border rounded p-3 min-h-[80px] ${DIFFICULTY_COLORS[difficulty]} ${DIFFICULTY_BG[difficulty]}`}
		>
			<span className="text-xs uppercase tracking-widest opacity-80">
				{difficulty}
			</span>
			<span className="text-sm text-white mt-auto">
				{GATE_TYPE_LABELS[gateTypeId]}
			</span>
		</div>
	);
};

type GateTypeSectionProps = {
	gateTypeId: GateTypeId;
	discoveredKeys: Set<string>;
};

const GateTypeSection = ({ gateTypeId, discoveredKeys }: GateTypeSectionProps) => (
	<div>
		<h3 className="text-theme text-sm uppercase tracking-widest mb-2">
			{GATE_TYPE_LABELS[gateTypeId]}
		</h3>
		<div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
			{GATE_DIFFICULTIES.map((difficulty) => (
				<SlotCard
					key={toSlotKey(gateTypeId, difficulty)}
					gateTypeId={gateTypeId}
					difficulty={difficulty}
					discovered={discoveredKeys.has(toSlotKey(gateTypeId, difficulty))}
				/>
			))}
		</div>
	</div>
);

export const PipelineCollection = ({
	discoveredKeys,
}: PipelineCollectionProps) => {
	const total = GATE_TYPE_IDS.length * GATE_DIFFICULTIES.length;
	const discovered = discoveredKeys.size;

	return (
		<section>
			<div className="flex items-baseline gap-3 mb-6">
				<h2 className="text-lg text-theme">Pipelines</h2>
				<span className="text-gray-500 text-xs uppercase tracking-widest">
					{discovered} / {total} discovered
				</span>
			</div>

			<div className="flex flex-col gap-6">
				{GATE_TYPE_IDS.map((gateTypeId) => (
					<GateTypeSection
						key={gateTypeId}
						gateTypeId={gateTypeId}
						discoveredKeys={discoveredKeys}
					/>
				))}
			</div>
		</section>
	);
};
