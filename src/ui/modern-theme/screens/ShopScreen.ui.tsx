import type { ReactNode } from "react";

import type { SwatchTheme } from "~/modules/run/gate/domain/swatch.model";

import { Screen } from "../Screen.ui";
import { Action } from "../Action.ui";
import { Section, type SectionItem } from "../Section.ui";
import { ShopHeader, type ShopHeaderProps } from "../ShopHeader.ui";
import { ExtraSpots, type ExtraSpotsProps } from "../ExtraSpots.ui";
import { Text } from "../Text.ui";

const BODY = "flex flex-col lg:flex-row lg:items-stretch";
const COLUMN = "flex min-w-0 flex-1 flex-col px-2 py-4";
const DRAFT = "border-b border-edge lg:border-b-0 lg:border-r";

const REBUILD = "flex flex-wrap items-center gap-3 pt-2 pb-3";

const NOTICE = "border-b border-cinnabar/40 bg-cinnabar/10 px-5 py-3";

const FOOTER =
	"flex flex-wrap items-center justify-end gap-4 border-t border-edge px-5 py-4";

export type ShopScreenProps = {
	gate: ShopHeaderProps;
	notice?: ReactNode;
	offers: readonly SectionItem[];
	offerCount: ReactNode;
	draftAction?: ReactNode;
	draftNote?: ReactNode;
	controls?: ReactNode;
	extraSpots?: ExtraSpotsProps;
	pipeline: readonly SectionItem[];
	slots: ReactNode;
	track?: ReactNode;
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
	extraSpots,
	pipeline,
	slots,
	track,
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
				<Section
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
				</Section>

				{extraSpots ? <ExtraSpots {...extraSpots} /> : null}

				{controls}
			</section>

			<section className={COLUMN}>
				<Section
					title="Your pipeline"
					value={
						<Text size="meta" tone="muted">
							{slots}
						</Text>
					}
					note={track}
					items={pipeline}
				/>
			</section>
		</div>

		{onContinue ? (
			<div className={FOOTER}>
				<Action
					label="Continue →"
					size="lg"
					emphasis="loud"
					disabled={exitLock !== undefined}
					hint={exitLock}
					onUse={onContinue}
				/>
			</div>
		) : null}
	</Screen>
);
