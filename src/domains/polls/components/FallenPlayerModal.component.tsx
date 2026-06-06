import { useEffect, useRef } from "react";

import type { FallenRunPlayer } from "~/domains/polls/api/communityStats.queries";
import { useLootFallenRun } from "~/domains/runs/hooks/useLootFallenRun";
import { calculateLootAmount } from "~/domains/runs/services/lootCalculator.service";
import {
	formatRequirement,
	getSlotLabel,
} from "~/domains/runs/utils/formatPipelineRequirement";
import {
	parseCompletionReason,
	type ParsedCompletion,
} from "~/domains/runs/utils/parseCompletionReason";
import { Avatar } from "~/domains/users/components/Avatar.component";
import { formatStorage } from "~/lib/storage";
import { PrimaryButton } from "~/ui/PrimaryButton.component";
import { SecondaryButton } from "~/ui/SecondaryButton.component";

export type FallenPlayerModalProps = {
	player: FallenRunPlayer | null;
	viewerUserId?: string | null;
	onClose: () => void;
};

const formatTimeOfDay = (date: Date): string =>
	date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });

// TODO(learning): Implement renderDeathReason — see component for guidance.
const renderDeathReason = (completion: ParsedCompletion) => {
	// Placeholder so the file type-checks until the user fills this in.
	if (completion.type === "pipeline_failure") {
		return (
			<ul className="space-y-1">
				{completion.failedSlots.map((slot) => (
					<li key={slot.gateTypeId} className="text-red-400">
						✗ {getSlotLabel(slot.gateTypeId)} {slot.difficulty} —{" "}
						{formatRequirement(slot.requirement)}
					</li>
				))}
			</ul>
		);
	}
	return <p className="text-zinc-400">Reason unavailable.</p>;
};

export const FallenPlayerModal = ({
	player,
	viewerUserId = null,
	onClose,
}: FallenPlayerModalProps) => {
	const dialogRef = useRef<HTMLDialogElement>(null);
	const lootMutation = useLootFallenRun();

	useEffect(() => {
		const dialog = dialogRef.current;
		if (!dialog) return;

		if (player) {
			dialog.showModal();
		} else {
			dialog.close();
		}
	}, [player]);

	if (!player) return null;

	const completion = parseCompletionReason(player.completionReason);
	const isLooted = player.lootedBy !== null;
	const canLoot =
		!isLooted && viewerUserId !== null && viewerUserId !== player.id;
	const previewLootAmount = calculateLootAmount(player.currentGate);

	return (
		<dialog
			ref={dialogRef}
			onClose={onClose}
			className="backdrop:bg-black backdrop:opacity-50 p-0 max-w-md m-auto border border-theme bg-gray-900 text-gray-200"
		>
			<div className="p-6 space-y-4">
				<header className="flex items-center gap-3">
					<div className="grayscale opacity-80">
						<Avatar user={player} size="sm" />
					</div>
					<div>
						<h2 className="text-xl text-white">
							{player.displayName} fell at Gate {player.currentGate}
						</h2>
						<p className="text-sm text-zinc-400">
							{formatTimeOfDay(player.finishedAt)}
						</p>
					</div>
				</header>

				<section>
					<h3 className="text-sm uppercase tracking-wide text-zinc-500 mb-2">
						Cause of death
					</h3>
					{renderDeathReason(completion)}
				</section>

				{isLooted && player.lootedBy && (
					<section className="border border-emerald-500/50 bg-emerald-950/40 p-3 flex items-center gap-3">
						<Avatar user={player.lootedBy} size="sm" />
						<p className="text-emerald-200 text-sm">
							Looted by{" "}
							<span className="text-white">{player.lootedBy.displayName}</span>
							{player.lootAmount !== null && (
								<>
									{" · "}
									<span className="text-emerald-300">
										+{formatStorage(player.lootAmount)}
									</span>
								</>
							)}
						</p>
					</section>
				)}

				{lootMutation.isError && (
					<p className="text-red-400 text-sm">
						{lootMutation.error instanceof Error
							? lootMutation.error.message
							: "Looting failed."}
					</p>
				)}

				<div className="flex justify-end gap-2">
					{canLoot && (
						<PrimaryButton
							onClick={() => lootMutation.mutate(player.runId)}
							disabled={lootMutation.isPending}
						>
							{lootMutation.isPending
								? "Looting…"
								: `Loot +${formatStorage(previewLootAmount)}`}
						</PrimaryButton>
					)}
					<SecondaryButton onClick={onClose}>Close</SecondaryButton>
				</div>
			</div>
		</dialog>
	);
};

export default FallenPlayerModal;
