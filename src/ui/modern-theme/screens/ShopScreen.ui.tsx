import type { ReactNode } from "react";

import type { SwatchTheme } from "~/modules/run/gate/domain/swatch.model";

import { Screen } from "../Screen.ui";
import { Action } from "../Action.ui";
import { Fold, type FoldItem } from "../Fold.ui";
import { Legend, RARITY_LEGEND } from "../Legend.ui";
import { ShopHeader, type ShopHeaderProps } from "../ShopHeader.ui";
import { StoragePlan, type StoragePlanProps } from "../StoragePlan.ui";
import { Text } from "../Text.ui";

const BODY = "flex flex-col lg:flex-row lg:items-stretch";
const COLUMN = "flex min-w-0 flex-1 flex-col px-2 py-4";
const KEY = "px-3 pt-4";
const DRAFT = "border-b border-edge lg:border-b-0 lg:border-r";

// The rebuild press sits beside what it costs next time, and under the shelf it
// replaces — the offers are what you read first, and the reroll is what you do
// about them.
const REBUILD = "flex flex-wrap items-center gap-3 pt-2 pb-3";

// A shut shop refuses every press in it, so one statement across the top beats
// seven tooltips each explaining the same rule. It sits between the header and
// the shelves because the shelves stay legible on purpose (ADR-038): what you
// cannot buy today is how the gate after this one gets planned.
const NOTICE = "border-b border-cinnabar/40 bg-cinnabar/10 px-5 py-3";

const FOOTER =
	"flex flex-wrap items-center justify-end gap-4 border-t border-edge px-5 py-4";

export type ShopScreenProps = {
	gate: ShopHeaderProps;
	/** Why nothing on this screen can be acted on, when nothing can. */
	notice?: ReactNode;
	offers: readonly FoldItem[];
	offerCount: ReactNode;
	draftAction?: ReactNode;
	draftNote?: ReactNode;
	controls?: ReactNode;
	storagePlans?: StoragePlanProps;
	pipeline: readonly FoldItem[];
	slots: ReactNode;
	onContinue?: () => void;
	exitLock?: string;
	theme?: SwatchTheme;
};

export const ShopScreen = ({
	gate,
	notice,
	offers,
	offerCount,
	draftAction,
	draftNote,
	controls,
	storagePlans,
	pipeline,
	slots,
	onContinue,
	exitLock,
	theme,
}: ShopScreenProps) => (
	<Screen theme={theme}>
		<ShopHeader {...gate} />

		{notice ? (
			<div className={NOTICE}>
				<Text tone="cinnabar">{notice}</Text>
			</div>
		) : null}

		<div className={BODY}>
			<section className={`${COLUMN} ${DRAFT}`}>
				<Fold
					title="New configs"
					value={
						<Text size="meta" tone="muted">
							{offerCount}
						</Text>
					}
					items={offers}
				>
					{draftAction || draftNote ? (
						<div className={REBUILD}>
							{draftAction}
							{draftNote}
						</div>
					) : null}
				</Fold>

				{/* The shelf is the other place a config is chosen, so it carries the
				    same key the deal does: rarity reads as a stripe on the row, and a
				    colour with no word to it is only learnable from a legend. */}
				<div className={KEY}>
					<Legend items={RARITY_LEGEND} />
				</div>

				{storagePlans ? <StoragePlan {...storagePlans} /> : null}

				{controls}
			</section>

			<section className={COLUMN}>
				<Fold
					title="Your pipeline"
					value={
						<Text size="meta" tone="muted">
							{slots}
						</Text>
					}
					items={pipeline}
				/>
			</section>
		</div>

		{onContinue ? (
			<div className={FOOTER}>
				<Action
					label={exitLock ?? "Continue →"}
					size="lg"
					emphasis="loud"
					disabled={exitLock !== undefined}
					onUse={onContinue}
				/>
			</div>
		) : null}
	</Screen>
);
