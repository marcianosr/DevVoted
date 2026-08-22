import type { ReactNode } from "react";

import { Fold, type FoldItem } from "../Fold.ui";
import { ShopHeader, type ShopHeaderProps } from "../ShopHeader.ui";
import { Text } from "../Text.ui";

const SCREEN = "flex flex-col bg-theme-faint";

// The draft comes first in the DOM so a stacked phone reads what is for sale
// before what is already owned; lg turns the stack into two columns.
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
	pipeline: readonly FoldItem[];
	slots: ReactNode;
	theme?: string;
};

export const ShopScreen = ({
	gate,
	offers,
	offerCount,
	draftAction,
	draftNote,
	controls,
	pipeline,
	slots,
	theme,
}: ShopScreenProps) => (
	<article data-gate-theme={theme} className={SCREEN}>
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
	</article>
);
