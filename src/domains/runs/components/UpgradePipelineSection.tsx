import { useEffect, useRef } from "react";

import { formatStorage } from "~/lib/storage";
import type {
	GateDifficulty,
	PipelineSlot,
	UpgradeCard,
} from "~/domains/runs/models/pipeline";

import {
	formatRequirement,
	getSlotLabel,
} from "~/domains/runs/utils/formatPipelineRequirement";

type UpgradeCardModalProps = {
	cards: UpgradeCard[];
	currentSlots: PipelineSlot[];
	onAccept: (card: UpgradeCard) => void;
	isPending?: boolean;
};

const DIFFICULTY_LABEL: Record<GateDifficulty, string> = {
	easy: "Easy",
	normal: "Normal",
	hard: "Hard",
	intense: "Intense",
};

const CommitButton = ({
	onClick,
	disabled,
}: {
	onClick: () => void;
	disabled: boolean;
}) => (
	<button
		onClick={onClick}
		disabled={disabled}
		className=" border border-gray-400 px-2 py-0.5 text-sm text-gray-300 hover:bg-white hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
	>
		[ COMMIT ]
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
	const isPermanentModifier = slot.requirement.type === "storage-drain";

	return (
		<div className="border border-gray-700 p-4 space-y-1">
			<div className="flex items-center gap-2 mb-2">
				<span className="text-gray-500">{isUpgrade ? "↑" : "+"}</span>
				<span className="text-white">
					{getSlotLabel(slot.gateTypeId)} ·{" "}
					{DIFFICULTY_LABEL[isUpgrade ? card.from : slot.difficulty]}
				</span>
				{isUpgrade && (
					<span className="text-gray-500">→ {DIFFICULTY_LABEL[card.to]}</span>
				)}
			</div>
			<p className="text-gray-400 text-sm pl-4">
				Requirement:{" "}
				<span className="text-gray-200">
					{formatRequirement(slot.requirement)}
				</span>
			</p>
			{!isPermanentModifier && (
				<p className="text-gray-400 text-sm pl-4">
					Reward:{" "}
					<span className="text-yellow-400">+{formatStorage(slot.reward)}</span>
				</p>
			)}
			{isPermanentModifier && (
				<p className="text-gray-400 text-sm pl-4">
					Effect:{" "}
					<span className="text-purple-400">Permanent run modifier</span>
				</p>
			)}
			<div className="pl-4 pt-2">
				<CommitButton onClick={() => onAccept(card)} disabled={isPending} />
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
	<div className="border border-gray-700 px-4 py-3 ">
		<p className="text-gray-200 text-sm uppercase tracking-widest">{title}</p>
		<p className="text-gray-500 text-xs mt-0.5">{subtitle}</p>
	</div>
);

const CurrentPipeline = ({ slots }: { slots: PipelineSlot[] }) => (
	<div className="border border-gray-700 px-4 py-3 ">
		<p className="text-gray-500 text-xs uppercase tracking-widest mb-2">
			Current Pipeline
		</p>
		{slots.map((slot, i) => (
			<div key={slot.gateTypeId} className="flex justify-between text-sm">
				<span className="text-gray-400">
					<span className="text-gray-600">[{i + 1}]</span>{" "}
					<span className="text-gray-200">{getSlotLabel(slot.gateTypeId)}</span>{" "}
					· {DIFFICULTY_LABEL[slot.difficulty]}
				</span>
				<span className="text-gray-400">
					{formatRequirement(slot.requirement)}
				</span>
			</div>
		))}
	</div>
);

export const UpgradeCardModal = ({
	cards,
	currentSlots,
	onAccept,
	isPending = false,
}: UpgradeCardModalProps) => {
	const dialogRef = useRef<HTMLDialogElement>(null);

	useEffect(() => {
		const dialog = dialogRef.current;
		if (!dialog) return;

		if (cards.length > 0) {
			dialog.showModal();
		} else {
			dialog.close();
		}
	}, [cards]);

	const handleCancel = (e: React.SyntheticEvent<HTMLDialogElement>) => {
		e.preventDefault();
	};

	if (cards.length === 0) return null;

	const upgradeCards = cards.filter(
		(c): c is Extract<UpgradeCard, { kind: "upgrade-slot" }> =>
			c.kind === "upgrade-slot"
	);
	const addSlotCards = cards.filter(
		(c): c is Extract<UpgradeCard, { kind: "add-slot" }> =>
			c.kind === "add-slot"
	);

	return (
		<dialog
			ref={dialogRef}
			onCancel={handleCancel}
			className="backdrop:bg-black backdrop:opacity-80 rounded-none p-0 max-w-xl w-full m-auto border border-gray-600 bg-gray-950 text-gray-200"
		>
			<div className="p-6 space-y-6">
				<CurrentPipeline slots={currentSlots} />

				{upgradeCards.length > 0 && (
					<div className="space-y-0">
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
					<div className="space-y-0">
						<SectionHeader
							title="Add New Slot"
							subtitle="More constraints, harder to pass all"
						/>
						{addSlotCards.map((card, i) => (
							<CardEntry
								key={i}
								card={card}
								onAccept={onAccept}
								isPending={isPending}
							/>
						))}
					</div>
				)}
			</div>
		</dialog>
	);
};
