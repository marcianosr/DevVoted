import type { ReactNode } from "react";
import { clsx } from "clsx";
import type { SlotSwatch } from "~/modules/run/pipeline/swatch.model";
import {
	gateOpenedBySlot,
	swatchForSlot,
} from "~/modules/run/pipeline/swatch.model";
import { GainBar } from "~/ui/runs/GainBar.ui";
import { Swatch } from "~/ui/Swatch.component";
import { swatchTheme } from "~/ui/theme/swatchTheme";
import { Paragraph } from "~/ui/typography/Paragraph.component";

export type SlotSwatchClaim = {
	readonly ready: boolean;
	readonly onClaim: () => void;
};

type SlotSwatchRowProps = {
	swatch: SlotSwatch;
	unlockAtPct: number;
	coveragePct: number;
	/** The gate this slot opens — every slot past the base buys one advance (ADR-018). */
	opensGate?: number;
	/** The shop passes this to make the row claimable; the configuring screen omits it. */
	claim?: SlotSwatchClaim;
};

const claimButton = (swatch: SlotSwatch, claim: SlotSwatchClaim) => (
	<button
		type="button"
		onClick={claim.onClaim}
		className={clsx(
			"shrink-0 cursor-pointer rounded-lg border px-3 py-1.5 text-sm text-zinc-100 transition",
			swatch.legendary
				? "border-transparent legendary-ring hover:brightness-125"
				: "border-viridian bg-viridian/10 hover:bg-viridian/20"
		)}
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
 * The next slot to unlock, rendered as its gym-badge swatch with live coverage
 * progress. With `claim` it is the shop's claim row — the button only appears
 * once the coverage gate is met (a locked row's bar and copy already explain
 * why there is nothing to press). Without `claim` it is a read-only preview.
 * The Elite Four swatch has no flat Kanto color (indigo is the app background),
 * so its chip and claim pill wear the legendary gradient ring instead.
 */
export const SlotSwatchRow = ({
	swatch,
	unlockAtPct,
	coveragePct,
	opensGate,
	claim,
}: SlotSwatchRowProps) => {
	const unlocked = coveragePct >= unlockAtPct;
	return (
		<div
			{...(swatch.legendary ? {} : swatchTheme(swatch.theme))}
			className="flex flex-col gap-2 rounded-lg border-2 border-dashed border-zinc-700 px-4 py-3"
		>
			<div className="flex items-center gap-4">
				<div className="flex min-w-0 flex-1 flex-col gap-1">
					<span className="flex items-center gap-2">
						{swatch.legendary ? (
							<span className="inline-block h-6 w-6 rounded legendary-ring" />
						) : (
							<Swatch size="lg" />
						)}
						<Paragraph
							as="span"
							size="sm"
							className={clsx(
								"font-bold",
								swatch.legendary ? "text-zinc-100" : "text-theme"
							)}
						>
							{swatch.name}
						</Paragraph>
						<Paragraph as="span" size="sm" tone="muted">
							· slot {swatch.slot}
							{opensGate === undefined ? "" : ` · opens gate ${opensGate}`}
						</Paragraph>
					</span>
					<Paragraph as="span" size="sm" tone="muted">
						Unlocks at{" "}
						<span className="font-bold text-zinc-100">{unlockAtPct}%</span>{" "}
						total coverage · you have{" "}
						<span className="font-bold text-viridian">{coveragePct}%</span>
					</Paragraph>
				</div>
				{claim
					? claim.ready
						? claimButton(swatch, claim)
						: null
					: lockPill(unlocked)}
			</div>
			<GainBar
				from={0}
				to={coveragePct}
				cap={unlockAtPct}
				label={`coverage toward ${swatch.name}`}
			/>
		</div>
	);
};

/**
 * The next unclaimed swatch for a pipeline of the given width, or nothing at
 * the slot cap — the one guard both the shop and the configuring screen need.
 */
export const nextSwatchRow = ({
	slots,
	coverage,
	slotCoverageRequired,
	claim,
}: {
	slots: number;
	coverage?: number;
	slotCoverageRequired?: number;
	claim?: SlotSwatchClaim;
}): ReactNode => {
	const swatch = swatchForSlot(slots + 1);
	if (
		!swatch ||
		coverage === undefined ||
		slotCoverageRequired === undefined ||
		!Number.isFinite(slotCoverageRequired)
	)
		return null;
	return (
		<SlotSwatchRow
			swatch={swatch}
			unlockAtPct={slotCoverageRequired}
			coveragePct={coverage}
			opensGate={gateOpenedBySlot(swatch.slot)}
			claim={claim}
		/>
	);
};
