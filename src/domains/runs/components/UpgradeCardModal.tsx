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
	cards: UpgradeCard[];
	onAccept: (card: UpgradeCard) => void;
	isPending?: boolean;
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

const UpgradeCardOption = ({
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
		<div className="border border-gray-700 p-4 bg-gray-900 flex flex-col gap-3">
			<div>
				<div className="flex items-baseline gap-2 mb-1">
					<span className="text-theme text-base font-mono">
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
					<p className="text-yellow-400 text-sm mt-1">
						+{formatStorage(slot.reward)} per pass
					</p>
				)}
				{isPermanentModifier && (
					<p className="text-purple-400 text-sm mt-1">Permanent run modifier</p>
				)}
			</div>

			<PrimaryButton
				size="small"
				onClick={() => onAccept(card)}
				className="w-full mt-auto"
				disabled={isPending}
			>
				{isPending ? "Deploying…" : "Deploy"}
			</PrimaryButton>
		</div>
	);
};

export const UpgradeCardModal = ({
	cards,
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

	// Forced modal — prevent ESC dismiss
	const handleCancel = (e: React.SyntheticEvent<HTMLDialogElement>) => {
		e.preventDefault();
	};

	if (cards.length === 0) return null;

	return (
		<dialog
			ref={dialogRef}
			onCancel={handleCancel}
			className="backdrop:bg-black backdrop:opacity-70 rounded-none p-0 max-w-2xl w-full m-auto border-2 border-yellow-500 bg-gray-950 text-gray-200"
		>
			<div className="p-6">
				<p className="text-yellow-400 text-xs font-mono tracking-widest mb-1">
					PIPELINE UPGRADE
				</p>
				<h2 className="text-white text-xl mb-5">Choose an upgrade</h2>

				<div
					className="grid gap-3"
					style={{ gridTemplateColumns: `repeat(${cards.length}, 1fr)` }}
				>
					{cards.map((card, i) => (
						<UpgradeCardOption
							key={i}
							card={card}
							onAccept={onAccept}
							isPending={isPending}
						/>
					))}
				</div>
			</div>
		</dialog>
	);
};
