import { AttackPanel, type AttackPanelProps } from "./AttackPanel.ui";
import { AuditsPanel, type AuditsPanelProps } from "./AuditsPanel.ui";
import { BandOutcomes, type BandOutcomesProps } from "./BandOutcomes.ui";
import { EstimatePicker, type EstimatePickerProps } from "./EstimatePicker.ui";
import { SlaPicker, type SlaPickerProps } from "./SlaPicker.ui";
import { Header, type HeaderProps } from "./Header.ui";
import { Ledger, type LedgerProps } from "./Ledger.ui";
import type { PollScoresProps } from "./PollScores.ui";
import { RebaseList, type RebaseListProps } from "./RebaseList.ui";
import { Screen, type ScreenGround, type ScreenWidth } from "./Screen.ui";
import { ScreenActions, type ScreenFooterProps } from "./ScreenFooter.ui";

const COLUMNS = "grid w-full gap-8 md:grid-cols-2";
const COLUMN = "flex w-full min-w-0 flex-col gap-6";

export type PrepScreenProps = {
	header: HeaderProps;
	outcomes: BandOutcomesProps;
	scores: PollScoresProps;
	polls: LedgerProps;
	audits: AuditsPanelProps;
	/** The standing bill line by line, behind the total the Audits header states. */
	subscriptions?: LedgerProps;
	/** The attack this run holds and who it may be aimed at (ADR-099). */
	attack?: AttackPanelProps;
	/** Both are bets on this gate, so they sit with the band table, not the Ledger. */
	estimate?: EstimatePickerProps;
	sla?: SlaPickerProps;
	rebase?: RebaseListProps;
	footer: ScreenFooterProps;
	width?: ScreenWidth;
	ground?: ScreenGround;
};

export const PrepScreen = ({
	header,
	outcomes,
	scores,
	polls,
	audits,
	subscriptions,
	attack,
	estimate,
	sla,
	rebase,
	footer,
	width,
	ground = "bare",
}: PrepScreenProps) => (
	<Screen gate={header.swatch.theme} width={width} ground={ground}>
		<Header {...header} />

		<div className={COLUMNS}>
			<div className={COLUMN}>
				<BandOutcomes {...outcomes} scores={scores} />
				{rebase === undefined ? null : <RebaseList {...rebase} />}
				{estimate === undefined ? null : <EstimatePicker {...estimate} />}
				{sla === undefined ? null : <SlaPicker {...sla} />}
			</div>

			<div className={COLUMN}>
				<Ledger {...polls} />
				<AuditsPanel {...audits} />
				{subscriptions === undefined ? null : <Ledger {...subscriptions} />}
				{attack === undefined ? null : <AttackPanel {...attack} />}
			</div>
		</div>

		<ScreenActions {...footer} />
	</Screen>
);
