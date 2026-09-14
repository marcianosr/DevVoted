import { Audit, type AuditProps } from "./Audit.ui";
import { BandOutcomes, type BandOutcomesProps } from "./BandOutcomes.ui";
import type { KantoColor } from "./colors";
import { Figures } from "./Figures.ui";
import { Header, type HeaderProps } from "./Header.ui";
import { Ledger, type LedgerProps } from "./Ledger.ui";
import { PanelV2 } from "./PanelV2.ui";
import { PollScores, type PollScoresProps } from "./PollScores.ui";
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
	<PanelV2>
		<PanelV2.Header
			label={title}
			meta={bill === undefined ? undefined : <Figures text={bill} />}
		/>

		{meta === undefined ? null : (
			<PanelV2.Body>
				<Typography variant="hint">{meta}</Typography>
			</PanelV2.Body>
		)}

		{alerts.length === 0 ? null : (
			<PanelV2.Rows>
				{alerts.map((alert, index) => (
					<PanelV2.Row key={alert.code ?? index}>
						<Audit {...alert} layout={AUDIT_LAYOUT} />
					</PanelV2.Row>
				))}
			</PanelV2.Rows>
		)}

		{note === undefined ? null : (
			<PanelV2.Footer>
				<Typography variant="hint">
					<Figures text={note} gain={NOTE_GAIN} />
				</Typography>
			</PanelV2.Footer>
		)}
	</PanelV2>
);

export type PrepScreenProps = {
	header: HeaderProps;
	outcomes: BandOutcomesProps;
	scores: PollScoresProps;
	polls: LedgerProps;
	audits: PrepAudits;
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
	footer,
	width,
	ground = "bare",
}: PrepScreenProps) => (
	<Screen gate={header.swatch.theme} width={width} ground={ground}>
		<Header {...header} />

		<div className={COLUMNS}>
			<div className={COLUMN}>
				<BandOutcomes {...outcomes} />
				<PanelV2>
					<PanelV2.Body>
						<PollScores {...scores} />
					</PanelV2.Body>
				</PanelV2>
			</div>

			<div className={COLUMN}>
				<Ledger {...polls} />
				<Audits {...audits} />
			</div>
		</div>

		<PanelV2>
			<PanelV2.Body>
				<ScreenFooter {...footer} rule={false} />
			</PanelV2.Body>
		</PanelV2>
	</Screen>
);
