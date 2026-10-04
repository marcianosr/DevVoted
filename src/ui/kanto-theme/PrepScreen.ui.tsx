import { AuditsPanel, type AuditsPanelProps } from "./AuditsPanel.ui";
import { BandOutcomes, type BandOutcomesProps } from "./BandOutcomes.ui";
import { EstimatePicker, type EstimatePickerProps } from "./EstimatePicker.ui";
import { SlaPicker, type SlaPickerProps } from "./SlaPicker.ui";
import { Header, type HeaderProps } from "./Header.ui";
import { Ledger, type LedgerProps } from "./Ledger.ui";
import { PollTiles, type PollTilesProps } from "./PollTiles.ui";
import { ApprovalList, type ApprovalListProps } from "./ApprovalList.ui";
import { RebaseList, type RebaseListProps } from "./RebaseList.ui";
import { Screen, type ScreenGround, type ScreenWidth } from "./Screen.ui";
import { Scoring, type ScoringProps } from "./Scoring.ui";
import { ScreenFooter, type ScreenFooterProps } from "./ScreenFooter.ui";

const COLUMNS = "grid w-full gap-8 md:grid-cols-2";
const COLUMN = "flex w-full min-w-0 flex-col gap-6";

export type PrepScreenProps = {
	header: HeaderProps;
	outcomes: BandOutcomesProps;
	scoring: ScoringProps;
	polls: PollTilesProps;
	audits?: AuditsPanelProps;
	subscriptions?: LedgerProps;
	estimate?: EstimatePickerProps;
	sla?: SlaPickerProps;
	rebase?: RebaseListProps;
	approval?: ApprovalListProps;
	footer: ScreenFooterProps;
	width?: ScreenWidth;
	ground?: ScreenGround;
};

export const PrepScreen = ({
	header,
	outcomes,
	scoring,
	polls,
	audits,
	subscriptions,
	estimate,
	sla,
	rebase,
	approval,
	footer,
	width,
	ground = "bare",
}: PrepScreenProps) => (
	<Screen gate={header.swatch.theme} width={width} ground={ground}>
		<Header {...header} />

		<div className={COLUMNS}>
			<div className={COLUMN}>
				<BandOutcomes {...outcomes} />
				{rebase === undefined ? null : <RebaseList {...rebase} />}
				{approval === undefined ? null : <ApprovalList {...approval} />}
				{estimate === undefined ? null : <EstimatePicker {...estimate} />}
				{sla === undefined ? null : <SlaPicker {...sla} />}
			</div>

			<div className={COLUMN}>
				<Scoring {...scoring} />
				<PollTiles {...polls} />
				{audits === undefined ? null : <AuditsPanel {...audits} />}
				{subscriptions === undefined ? null : <Ledger {...subscriptions} />}
				<ScreenFooter {...footer} asidesAt="after" rule={false} />
			</div>
		</div>
	</Screen>
);
