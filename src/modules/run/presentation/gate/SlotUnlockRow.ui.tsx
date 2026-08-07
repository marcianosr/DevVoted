import type { ReactNode } from "react";
import { clsx } from "clsx";
import { MAX_SLOTS } from "~/modules/run/pipeline/pipeline.model";
import { GainBar } from "~/ui/runs/GainBar.ui";
import { Paragraph } from "~/ui/typography/Paragraph.component";

export type SlotUnlockClaim = {
	readonly ready: boolean;
	readonly onClaim: () => void;
};

type SlotUnlockRowProps = {
	/** The slot this row buys — the next one up from the current width. */
	slot: number;
	unlockAtPct: number;
	coveragePct: number;
	/** The shop passes this to make the row claimable; the configuring screen omits it. */
	claim?: SlotUnlockClaim;
};

const unlockButton = (claim: SlotUnlockClaim) => (
	<button
		type="button"
		onClick={claim.onClaim}
		className="shrink-0 cursor-pointer rounded-lg border border-viridian bg-viridian/10 px-3 py-1.5 text-sm text-zinc-100 transition hover:bg-viridian/20"
	>
		Unlock slot
	</button>
);

const lockPill = (unlocked: boolean) => (
	<Paragraph
		as="span"
		size="xs"
		tone={unlocked ? "celadon" : "faint"}
		className={clsx(
			"shrink-0 rounded border px-2 py-0.5",
			unlocked ? "border-celadon" : "border-zinc-700"
		)}
	>
		{unlocked ? "unlocked" : "locked"}
	</Paragraph>
);

/**
 * The next slot coverage is paying for, with live progress toward its rung. With
 * `claim` it is the shop's unlock row — the button only appears once the rung is
 * met, since a locked row's bar and copy already explain why there is nothing to
 * press. Without `claim` it is a read-only preview.
 *
 * Carries no swatch: badges are awarded by gates, not bought with coverage
 * (ADR-019), so width's reward is the width itself.
 */
export const SlotUnlockRow = ({
	slot,
	unlockAtPct,
	coveragePct,
	claim,
}: SlotUnlockRowProps) => {
	const unlocked = coveragePct >= unlockAtPct;
	return (
		<div className="flex items-center gap-4 rounded-lg border border-dashed border-zinc-700 px-4 py-3">
			<div className="flex min-w-0 flex-1 flex-col gap-1">
				{/* The table's gutter already numbers this slot, so the row leads with
				    what it costs rather than repeating "Slot 4". */}
				<Paragraph as="span" size="sm" tone="muted">
					Opens at{" "}
					<span className="font-bold text-zinc-100">{unlockAtPct}%</span>{" "}
					coverage
				</Paragraph>
				<Paragraph as="span" size="xs" tone="muted">
					<span className={clsx("font-bold", unlocked && "text-viridian")}>
						{coveragePct}% reached
					</span>
				</Paragraph>
				<GainBar
					from={0}
					to={coveragePct}
					cap={unlockAtPct}
					label={`coverage toward slot ${slot}`}
				/>
			</div>
			{claim ? (claim.ready ? unlockButton(claim) : null) : lockPill(unlocked)}
		</div>
	);
};

/**
 * The next slot row for a pipeline of the given width, or nothing at the slot
 * cap — the one guard both the shop and the configuring screen need.
 */
export const nextSlotRow = ({
	slots,
	coverage,
	slotCoverageRequired,
	claim,
}: {
	slots: number;
	coverage?: number;
	slotCoverageRequired?: number;
	claim?: SlotUnlockClaim;
}): ReactNode => {
	if (
		slots >= MAX_SLOTS ||
		coverage === undefined ||
		slotCoverageRequired === undefined ||
		!Number.isFinite(slotCoverageRequired)
	)
		return null;
	return (
		<SlotUnlockRow
			slot={slots + 1}
			unlockAtPct={slotCoverageRequired}
			coveragePct={coverage}
			claim={claim}
		/>
	);
};
