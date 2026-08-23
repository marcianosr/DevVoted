import type { ReactNode } from "react";

import type { SwatchTheme } from "~/modules/run/gate/domain/swatch.model";

import { Screen } from "../Screen.ui";
import { Fold, type FoldItem } from "../Fold.ui";
import { ShopHeader, type ShopHeaderProps } from "../ShopHeader.ui";
import { StoragePlan, type StoragePlanProps } from "../StoragePlan.ui";
import { Text } from "../Text.ui";

const BODY = "flex flex-col lg:flex-row lg:items-stretch";
const COLUMN = "flex min-w-0 flex-1 flex-col px-2 py-4";
const DRAFT = "border-b border-edge lg:border-b-0 lg:border-r";

const CONTROLS = "flex flex-col gap-3 px-2 pt-4";

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
	theme,
}: ShopScreenProps) => (
	<Screen theme={theme}>
		<ShopHeader {...gate} />

		<div className={BODY}>
			<section className={`${COLUMN} ${DRAFT}`}>
				<Fold
					title="Draft"
					value={
						<Text size="meta" tone="muted">
							{offerCount}
						</Text>
					}
					action={draftAction}
					note={draftNote}
					items={offers}
				/>
				{storagePlans ? <StoragePlan {...storagePlans} /> : null}

				{controls ? <div className={CONTROLS}>{controls}</div> : null}
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
	</Screen>
);
