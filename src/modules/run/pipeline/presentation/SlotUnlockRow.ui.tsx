import type { ReactNode } from "react";
import { Paragraph } from "~/ui/typography/Paragraph.component";
import { SlotNumberCell } from "~/modules/run/pipeline/presentation/PipelineTable.ui";

type NextSlotArgs = {
	slots: number;
	/** The gate whose clear opens the next slot; null/undefined at the cap. */
	nextSlotGate?: number | null;
};

type NextSlot = { slot: number; unlockAtGate: number };

/** The next slot's numbers, narrowed from optional run state — or nothing at
 * the slot cap, the one guard every caller needs. */
const nextSlot = ({ slots, nextSlotGate }: NextSlotArgs): NextSlot | null => {
	if (nextSlotGate === undefined || nextSlotGate === null) return null;
	return { slot: slots + 1, unlockAtGate: nextSlotGate };
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
	/** The slot this row previews — the next one up from the current width. */
	slot: number;
	unlockAtGate: number;
};

/**
 * The next slot a gate is holding — a read-only preview, since gates grant
 * slots on the clear (ADR-034) and width claims itself with no purchase step
 * (ADR-025). No progress bar: the grant is a clear, not an accrual.
 *
 * Carries no swatch: badges are awarded by gates, not owed to slots
 * (ADR-019), so width's reward is the width itself.
 */
export const SlotUnlockRow = ({ slot, unlockAtGate }: SlotUnlockRowProps) => (
	<>
		<SlotNumberCell slot={slot} />
		<div className="col-start-2 col-span-3 flex items-center gap-4 rounded-lg border border-dashed border-edge-strong px-4 py-3">
			{/* The table's gutter already numbers this slot, so the row leads with
			    what opens it rather than repeating "Slot 4". */}
			<Paragraph as="span" size="sm" tone="muted" className="min-w-0 flex-1">
				Opens when{" "}
				<span className="font-bold text-zinc-100">Gate {unlockAtGate}</span>{" "}
				clears
			</Paragraph>
		</div>
	</>
);

/**
 * The shop's one-time acknowledgment for a slot (or slots) auto-widened since
 * the last visit — same dashed-box shape as `SlotUnlockRow`, but green and
 * done rather than dashed grey and pending. Carries no slot number of its
 * own: the slots it names already have their own numbered rows above it in
 * the pipeline list (as empty slots), so numbering this row too would invent
 * a slot that doesn't exist — the bug that had slot 7 read as "unlocked" when
 * only 4–6 had (Marciano, 2026-08-11).
 */
const UnlockedSlotRow = ({ slots }: { slots: readonly number[] }) => (
	<>
		<span aria-hidden className="col-start-1" />
		<div className="col-start-2 col-span-3 flex items-center gap-4 rounded-lg border border-dashed border-viridian px-4 py-3">
			<Paragraph as="span" size="sm" tone="viridian" className="font-bold">
				Unlocked {joinOrdinals(slots)} slot{slots.length > 1 ? "s" : ""}
			</Paragraph>
		</div>
	</>
);

/**
 * The pipeline list's trailing row(s): a one-time acknowledgment for any slot
 * granted since the last shop visit (ADR-025/034), followed by the actual
 * next slot and the gate that opens it — the two are independent facts and
 * both can be true at once, so neither hides the other. `effectiveSlots`
 * folds `justUnlocked` into the width so the preview row always numbers the
 * slot genuinely beyond every slot already shown, even if a caller's `slots`
 * hasn't caught up yet. Nothing renders once every slot up to the cap has
 * both widened and been acknowledged.
 */
export const nextSlotRow = ({
	justUnlocked,
	...args
}: NextSlotArgs & { justUnlocked?: readonly number[] }): ReactNode => {
	const effectiveSlots = Math.max(args.slots, ...(justUnlocked ?? []));
	const next = nextSlot({ ...args, slots: effectiveSlots });
	const unlockedNotice =
		justUnlocked && justUnlocked.length > 0 ? (
			<UnlockedSlotRow slots={justUnlocked} />
		) : null;
	if (!unlockedNotice && !next) return null;
	return (
		<>
			{unlockedNotice}
			{next ? (
				<SlotUnlockRow slot={next.slot} unlockAtGate={next.unlockAtGate} />
			) : null}
		</>
	);
};
