import type { ReactNode } from "react";

import type { SwatchTheme } from "~/modules/run/gate/domain/swatch.model";

import { Screen } from "../Screen.ui";
import { Action } from "../Action.ui";
import { Fold, type FoldItem } from "../Fold.ui";
import { ShopHeader, type ShopHeaderProps } from "../ShopHeader.ui";
import { StoragePlan, type StoragePlanProps } from "../StoragePlan.ui";
import { Text } from "../Text.ui";

const BODY = "flex flex-col lg:flex-row lg:items-stretch";
const COLUMN = "flex min-w-0 flex-1 flex-col px-2 py-4";
const DRAFT = "border-b border-edge lg:border-b-0 lg:border-r";

// The rebuild press sits beside what it costs next time, under the header it
// acts on rather than in the header's own trailing corner.
const REBUILD = "flex flex-wrap items-center gap-3";

const FOOTER =
	"flex flex-wrap items-center justify-end gap-4 border-t border-edge px-5 py-4";

export type ShopScreenProps = {
	gate: ShopHeaderProps;
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

		<div className={BODY}>
			<section className={`${COLUMN} ${DRAFT}`}>
				<Fold
					title="Draft"
					subtitle="this shop"
					value={
						<Text size="meta" tone="muted">
							{offerCount}
						</Text>
					}
					note={
						draftAction || draftNote ? (
							<div className={REBUILD}>
								{draftAction}
								{draftNote}
							</div>
						) : null
					}
					items={offers}
				/>

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
