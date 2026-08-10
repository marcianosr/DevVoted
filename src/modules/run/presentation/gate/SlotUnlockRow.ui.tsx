import type { ReactNode } from "react";
import { clsx } from "clsx";
import { MAX_SLOTS } from "~/modules/run/pipeline/pipeline.model";
import { GainBar } from "~/ui/runs/GainBar.ui";
import { Paragraph } from "~/ui/typography/Paragraph.component";

type NextSlotArgs = {
	slots: number;
	coverage?: number;
	slotCoverageRequired?: number;
};

type NextSlot = { slot: number; unlockAtPct: number; coveragePct: number };

/** The next slot's numbers, narrowed from optional run state — or nothing at
 * the slot cap, the one guard every caller needs. */
const nextSlot = ({
	slots,
	coverage,
	slotCoverageRequired,
}: NextSlotArgs): NextSlot | null => {
	if (
		slots >= MAX_SLOTS ||
		coverage === undefined ||
		slotCoverageRequired === undefined ||
		!Number.isFinite(slotCoverageRequired)
	)
		return null;
	return {
		slot: slots + 1,
		unlockAtPct: slotCoverageRequired,
		coveragePct: coverage,
	};
};

const ORDINAL_SUFFIX: Readonly<Record<Intl.LDMLPluralRule, string>> = {
	one: "st",
	two: "nd",
	few: "rd",
	other: "th",
	zero: "th",
	many: "th",
};
const ordinalRules = new Intl.PluralRules("en", { type: "ordinal" });
const ordinal = (n: number): string =>
	`${n}${ORDINAL_SUFFIX[ordinalRules.select(n)]}`;

const joinOrdinals = (slots: readonly number[]): string => {
	const labels = slots.map(ordinal);
	if (labels.length < 2) return labels.join("");
	return `${labels.slice(0, -1).join(", ")} & ${labels.at(-1)}`;
};

type SlotUnlockRowProps = {
	/** The slot this row buys — the next one up from the current width. */
	slot: number;
	unlockAtPct: number;
	coveragePct: number;
};

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
 * The next slot coverage is paying for, with live progress toward its rung —
 * a read-only preview, since width claims itself automatically the instant
 * coverage affords it (ADR-025) and needs no purchase step.
 *
 * Carries no swatch: badges are awarded by gates, not bought with coverage
 * (ADR-019), so width's reward is the width itself.
 */
export const SlotUnlockRow = ({
	slot,
	unlockAtPct,
	coveragePct,
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
			{lockPill(unlocked)}
		</div>
	);
};

/**
 * The shop's one-time acknowledgment for a slot (or slots) auto-widened since
 * the last visit — same dashed-box shape as `SlotUnlockRow`, but green and
 * done rather than dashed grey and pending.
 */
const UnlockedSlotRow = ({ slots }: { slots: readonly number[] }) => (
	<div className="flex items-center gap-4 rounded-lg border border-dashed border-viridian px-4 py-3">
		<Paragraph as="span" size="sm" tone="viridian" className="font-bold">
			Unlocked {joinOrdinals(slots)} slot{slots.length > 1 ? "s" : ""}
		</Paragraph>
	</div>
);

/**
 * The next slot row for a pipeline of the given width, or nothing at the slot
 * cap — the one guard both the shop and the configuring screen need. When
 * slots widened automatically since the last shop visit, this shows that
 * acknowledgment instead of the next (still-locked) slot's progress.
 */
export const nextSlotRow = ({
	justUnlocked,
	...args
}: NextSlotArgs & { justUnlocked?: readonly number[] }): ReactNode => {
	if (justUnlocked && justUnlocked.length > 0)
		return <UnlockedSlotRow slots={justUnlocked} />;
	const next = nextSlot(args);
	if (!next) return null;
	return (
		<SlotUnlockRow
			slot={next.slot}
			unlockAtPct={next.unlockAtPct}
			coveragePct={next.coveragePct}
		/>
	);
};

/**
 * The next slot's progress as its own bullet — a small bar plus how much
 * coverage it still needs, muted until met and gradient-green once it is.
 * For contexts that only report the rung (the gate reward payout) rather
 * than sell it (the shop's `nextSlotRow`, with its lock pill).
 */
const SlotProgressLine = ({ slot, unlockAtPct, coveragePct }: NextSlot) => {
	const unlocked = coveragePct >= unlockAtPct;
	return (
		// The marker needs a plain list-item box on the `<li>` itself — flex would
		// suppress it — so the row's own layout lives on a nested div instead.
		<li>
			<div className="flex items-center justify-between gap-4">
				<Paragraph as="span" size="sm">
					slot {slot} progress
				</Paragraph>
				<div className="flex items-center gap-4">
					<span className="w-24 shrink-0">
						<GainBar
							from={0}
							to={coveragePct}
							cap={unlockAtPct}
							label={`coverage toward slot ${slot}`}
						/>
					</span>
					<Paragraph
						as="span"
						size="sm"
						tone={unlocked ? "gradient" : "muted"}
						className={unlocked ? "font-bold" : undefined}
					>
						{coveragePct}% of {unlockAtPct}%
					</Paragraph>
				</div>
			</div>
		</li>
	);
};

export const nextSlotProgress = (args: NextSlotArgs): ReactNode => {
	const next = nextSlot(args);
	if (!next) return null;
	return <SlotProgressLine {...next} />;
};
