import { AttackPanel, type AttackPanelProps } from "./AttackPanel.ui";
import { Audit, type AuditProps } from "./Audit.ui";
import { BandOutcomes, type BandOutcomesProps } from "./BandOutcomes.ui";
import { EstimatePicker, type EstimatePickerProps } from "./EstimatePicker.ui";
import { SlaPicker, type SlaPickerProps } from "./SlaPicker.ui";
import type { KantoColor } from "./colors";
import { Figures } from "./Figures.ui";
import { Header, type HeaderProps } from "./Header.ui";
import { Ledger, type LedgerProps } from "./Ledger.ui";
import { Panel } from "./Panel.ui";
import { PollScores, type PollScoresProps } from "./PollScores.ui";
import { RebaseList, type RebaseListProps } from "./RebaseList.ui";
import { Screen, type ScreenGround, type ScreenWidth } from "./Screen.ui";
import { ScreenFooter, type ScreenFooterProps } from "./ScreenFooter.ui";
import { Typography } from "./Typography.ui";

const COLUMNS = "grid w-full gap-8 md:grid-cols-2";
const COLUMN = "flex w-full min-w-0 flex-col gap-6";

const NOTE_GAIN: KantoColor = "pewter";

const AUDIT_LAYOUT = "row";

export type PrepAudits = {
	title: string;
	meta?: string;
	bill?: string;
	note?: string;
	alerts: readonly AuditProps[];
};

const Audits = ({ title, meta, bill, note, alerts }: PrepAudits) => (
	<Panel>
		<Panel.Header
			label={title}
			meta={bill === undefined ? undefined : <Figures text={bill} />}
		/>

		{meta === undefined ? null : (
			<Panel.Body>
				<Typography variant="hint">{meta}</Typography>
			</Panel.Body>
		)}

		{alerts.length === 0 ? null : (
			<Panel.Rows>
				{alerts.map((alert, index) => (
					<Panel.Row key={alert.code ?? index}>
						<Audit {...alert} layout={AUDIT_LAYOUT} />
					</Panel.Row>
				))}
			</Panel.Rows>
		)}

		{note === undefined ? null : (
			<Panel.Footer>
				<Typography variant="hint">
					<Figures text={note} gain={NOTE_GAIN} />
				</Typography>
			</Panel.Footer>
		)}
	</Panel>
);

export type PrepScreenProps = {
	header: HeaderProps;
	outcomes: BandOutcomesProps;
	scores: PollScoresProps;
	polls: LedgerProps;
	audits: PrepAudits;
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
				<BandOutcomes {...outcomes} />
				{rebase === undefined ? null : <RebaseList {...rebase} />}
				{estimate === undefined ? null : <EstimatePicker {...estimate} />}
				{sla === undefined ? null : <SlaPicker {...sla} />}
				<Panel>
					<Panel.Body>
						<PollScores {...scores} />
					</Panel.Body>
				</Panel>
			</div>

			<div className={COLUMN}>
				<Ledger {...polls} />
				<Audits {...audits} />
				{attack === undefined ? null : <AttackPanel {...attack} />}
			</div>
		</div>

		<Panel>
			<Panel.Body>
				<ScreenFooter {...footer} rule={false} />
			</Panel.Body>
		</Panel>
	</Screen>
);
