import { useEffect, useRef } from "react";

import { PrimaryButton } from "~/ui/PrimaryButton";
import { formatStorage } from "~/lib/storage";
import type {
	GateDifficulty,
	UpgradeCard,
} from "~/domains/runs/models/pipeline";
import {
	formatRequirement,
	getSlotLabel,
} from "~/domains/runs/utils/formatPipelineRequirement";

type UpgradeCardModalProps = {
	card: UpgradeCard | null;
	onAccept: (card: UpgradeCard) => void;
};

const DIFFICULTY_LABEL: Record<GateDifficulty, string> = {
	easy: "Easy",
	normal: "Normal",
	hard: "Hard",
	intense: "Intense",
};

const DIFFICULTY_COLOR: Record<GateDifficulty, string> = {
	easy: "text-green-400",
	normal: "text-blue-400",
	hard: "text-orange-400",
	intense: "text-red-500",
};

export const UpgradeCardModal = ({ card, onAccept }: UpgradeCardModalProps) => {
	const dialogRef = useRef<HTMLDialogElement>(null);

	useEffect(() => {
		const dialog = dialogRef.current;
		if (!dialog) return;

		if (card) {
			dialog.showModal();
		} else {
			dialog.close();
		}
	}, [card]);

	// Forced modal — prevent ESC dismiss
	const handleCancel = (e: React.SyntheticEvent<HTMLDialogElement>) => {
		e.preventDefault();
	};

	if (!card) return null;

	const { slot } = card;
	const isUpgrade = card.kind === "upgrade-slot";
	const isPermanentModifier = slot.requirement.type === "storage-drain";

	return (
		<dialog
			ref={dialogRef}
			onCancel={handleCancel}
			className="backdrop:bg-black backdrop:opacity-70 rounded-none p-0 max-w-sm w-full m-auto border-2 border-yellow-500 bg-gray-950 text-gray-200"
		>
			<div className="p-6">
				<p className="text-yellow-400 text-xs font-mono tracking-widest mb-1">
					PIPELINE UPGRADE
				</p>
				<h2 className="text-white text-xl mb-5">
					{isUpgrade ? "Slot upgraded" : "New slot unlocked"}
				</h2>

				<div className="border border-gray-700 p-4 mb-5 bg-gray-900">
					<div className="flex items-baseline gap-2 mb-1">
						<span className="text-theme text-lg font-mono">
							{getSlotLabel(slot.gateTypeId)}
						</span>
						{isUpgrade && (
							<span className="text-gray-500 text-xs">
								<span className={DIFFICULTY_COLOR[card.from]}>
									{DIFFICULTY_LABEL[card.from]}
								</span>
								{" → "}
								<span className={DIFFICULTY_COLOR[card.to]}>
									{DIFFICULTY_LABEL[card.to]}
								</span>
							</span>
						)}
						{!isUpgrade && (
							<span className={`text-xs ${DIFFICULTY_COLOR[slot.difficulty]}`}>
								{DIFFICULTY_LABEL[slot.difficulty]}
							</span>
						)}
					</div>

					<p className="text-gray-300 text-sm">
						{formatRequirement(slot.requirement)}
					</p>

					{!isPermanentModifier && (
						<p className="text-yellow-400 text-sm mt-2">
							+{formatStorage(slot.reward)} per pass
						</p>
					)}
					{isPermanentModifier && (
						<p className="text-purple-400 text-sm mt-2">
							Permanent run modifier
						</p>
					)}
				</div>

				<PrimaryButton
					size="small"
					onClick={() => onAccept(card)}
					className="w-full"
				>
					Deploy upgrade
				</PrimaryButton>
			</div>
		</dialog>
	);
};
