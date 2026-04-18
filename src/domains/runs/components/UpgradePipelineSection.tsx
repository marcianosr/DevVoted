import type {
	GateDifficulty,
	PipelineSlot,
	PipelineSlotRequirement,
	UpgradeCard,
} from "~/domains/runs/models/pipeline";
import type { PipelineEvaluationContext } from "~/domains/runs/services/pipelineEvaluator.service";
import {
	formatRequirement,
	getSlotLabel,
} from "~/domains/runs/utils/formatPipelineRequirement";

type UpgradePipelineSectionProps = {
	cards: UpgradeCard[];
	currentSlots: PipelineSlot[];
	onAccept: (card: UpgradeCard) => void;
	isPending?: boolean;
	evaluationContext?: PipelineEvaluationContext;
};

const DIFFICULTY_LABEL: Record<GateDifficulty, string> = {
	easy: "Easy",
	normal: "Normal",
	hard: "Hard",
	intense: "Intense",
};

const DIFFICULTY_CLASSES: Record<GateDifficulty, string> = {
	easy: "text-green-400 border-green-400",
	normal: "text-blue-400 border-blue-400",
	hard: "text-orange-400 border-orange-400",
	intense: "text-red-500 border-red-500",
};

const formatCurrentStat = (
	req: PipelineSlotRequirement,
	ctx: PipelineEvaluationContext
): string => {
	switch (req.type) {
		case "correct-answers":
			return `${ctx.correctAnswersInWindow} correct`;
		case "coverage-gain":
			return `+${ctx.coverageGainedInWindow.toFixed(1)}%`;
		case "disabled-config":
			return `${ctx.disabledConfigCount} disabled`;
		case "short-window":
			return `${ctx.correctAnswersInWindow}/${ctx.pollsInWindow} correct`;
	}
};

const SelectButton = ({
	onClick,
	disabled,
}: {
	onClick: () => void;
	disabled: boolean;
}) => (
	<button
		onClick={onClick}
		disabled={disabled}
		className="border border-white px-4 py-2 text-lg text-white hover:bg-white hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
	>
		Select
	</button>
);

const CardEntry = ({
	card,
	onAccept,
	isPending,
}: {
	card: UpgradeCard;
	onAccept: (card: UpgradeCard) => void;
	isPending: boolean;
}) => {
	const { slot } = card;
	const isUpgrade = card.kind === "upgrade-slot";

	return (
		<div className="border border-white p-4 space-y-1">
			<div className="flex items-center gap-2 mb-2">
				<span className="text-gray-500">{isUpgrade ? "↑" : "+"}</span>
				<span>{getSlotLabel(slot.gateTypeId)} · </span>
				<DifficultyLabel difficulty={isUpgrade ? card.from : slot.difficulty} />
				{isUpgrade && <DifficultyLabel text={"→"} difficulty={card.to} />}
			</div>
			<p className="text-gray-400 text-sm pl-4">
				Requirement:{" "}
				<span className="text-gray-200">
					{formatRequirement(slot.requirement)}
				</span>
			</p>

			<div className="pl-4 pt-2">
				<SelectButton onClick={() => onAccept(card)} disabled={isPending} />
			</div>
		</div>
	);
};

const SectionHeader = ({
	title,
	subtitle,
}: {
	title: string;
	subtitle: string;
}) => (
	<div className="border border-white px-4 py-3">
		<p className="text-gray-200 text-sm uppercase tracking-widest">{title}</p>
		<p className="text-gray-500 text-xs mt-0.5">{subtitle}</p>
	</div>
);

const DifficultyLabel = ({
	difficulty,
	text,
}: {
	difficulty: GateDifficulty;
	text?: string;
}) => (
	<span className={DIFFICULTY_CLASSES[difficulty]}>
		<span className="text-white">{text}</span> {DIFFICULTY_LABEL[difficulty]}
	</span>
);

export const CurrentPipeline = ({
	slots,
	evaluationContext,
}: {
	slots: PipelineSlot[];
	evaluationContext?: PipelineEvaluationContext;
}) => (
	<div className="border border-white">
		<div className="border-b border-white px-4 py-3">
			<p className="text-white uppercase tracking-widest">CI Pipeline</p>
			<p className="text-gray-500 text-sm mt-0.5">
				{evaluationContext && (
					<>
						<span className="text-gray-300">
							{evaluationContext.pollsAnsweredInWindow}/
							{evaluationContext.pollsInWindow}
						</span>
						{" polls · "}
					</>
				)}
				{slots.length} active {slots.length === 1 ? "check" : "checks"} · all
				must pass
			</p>
		</div>
		{slots.map((slot) => (
			<div
				key={slot.gateTypeId}
				className="border-b border-white last:border-b-0 px-4 py-3"
			>
				<p className="flex items-center gap-2">
					<span className="text-green-400">✓</span>
					<span className="text-white">{getSlotLabel(slot.gateTypeId)}</span>
				</p>
				<p className="pl-6 text-gray-400 text-sm mt-1">
					<DifficultyLabel difficulty={slot.difficulty} />
					{" · "}
					{formatRequirement(slot.requirement)}
				</p>
				{evaluationContext && (
					<p className="pl-6 text-gray-500 text-sm mt-0.5">
						Current:{" "}
						<span className="text-gray-300">
							{formatCurrentStat(slot.requirement, evaluationContext)}
						</span>
					</p>
				)}
			</div>
		))}
	</div>
);

export const UpgradePipelineSection = ({
	cards,
	currentSlots,
	onAccept,
	isPending = false,
	evaluationContext,
}: UpgradePipelineSectionProps) => {
	const upgradeCards = cards.filter(
		(c): c is Extract<UpgradeCard, { kind: "upgrade-slot" }> =>
			c.kind === "upgrade-slot"
	);
	const addSlotCards = cards.filter(
		(c): c is Extract<UpgradeCard, { kind: "add-slot" }> =>
			c.kind === "add-slot"
	);

	return (
		<div className="space-y-6">
			<CurrentPipeline
				slots={currentSlots}
				evaluationContext={evaluationContext}
			/>

			<section className="flex flex-wrap gap-4">
				{upgradeCards.length > 0 && (
					<div>
						<SectionHeader
							title="Modify Existing Slots"
							subtitle="Increase difficulty, higher reward, higher risk"
						/>
						{upgradeCards.map((card, i) => (
							<CardEntry
								key={i}
								card={card}
								onAccept={onAccept}
								isPending={isPending}
							/>
						))}
					</div>
				)}

				{addSlotCards.length > 0 && (
					<div>
						<SectionHeader
							title="Add New Slot"
							subtitle="More constraints, harder to pass all"
						/>
						<div className="flex">
							{addSlotCards.map((card, i) => (
								<CardEntry
									key={i}
									card={card}
									onAccept={onAccept}
									isPending={isPending}
								/>
							))}
						</div>
					</div>
				)}
			</section>
		</div>
	);
};
