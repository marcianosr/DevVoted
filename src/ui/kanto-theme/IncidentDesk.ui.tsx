import { Audit, type AuditProps } from "./Audit.ui";
import { Badge } from "./Badge.ui";
import { Button } from "./Button.ui";
import { Panel } from "./Panel.ui";
import { Typography } from "./Typography.ui";

export const COPY = {
	label: "Incident desk",
	held: (audit: string) => `Your held ${audit} will be discarded.`,
} as const;

const HELD_COLOR = "cinnabar";
const RUNG_COLOR = "pewter";

const OFFER = "flex flex-col gap-3 rounded-xl border border-theme-faint p-3";
const PRESS_ROW = "flex flex-wrap items-center gap-2";
const RULE_ROW =
	"flex flex-wrap items-baseline justify-between gap-2 border-t border-theme-faint pt-2 text-xs text-theme-muted";
const REFRESH_ROW = "flex flex-wrap items-center gap-2";
const RUNGS = "flex flex-wrap items-center gap-1";
const DISCARDS =
	"rounded-lg bg-theme-raised px-3 py-2 text-xs font-bold text-theme-soft";

export type IncidentPress = {
	label: string;
	price: string;
	onPress?: () => void;
	refusal?: string;
};

export type IncidentRefresh = IncidentPress & {
	detail: string;
	rungs: readonly string[];
	atRung: number;
};

export type IncidentDeskProps = {
	audit: AuditProps;
	buy: IncidentPress;
	discards?: string;
	rule: string;
	reach: string;
	refresh?: IncidentRefresh;
};

const Press = ({ label, price, onPress, refusal }: IncidentPress) => (
	<div className={PRESS_ROW}>
		<Button
			tone="commit"
			size="sm"
			label={label}
			cap={price}
			capAt="trail"
			disabled={onPress === undefined}
			onPress={onPress ?? (() => {})}
		/>
		{refusal === undefined ? null : (
			<Typography variant="hint" as="span">
				{refusal}
			</Typography>
		)}
	</div>
);

const Rungs = ({
	rungs,
	atRung,
}: Pick<IncidentRefresh, "rungs" | "atRung">) => (
	<span className={RUNGS}>
		{rungs.map((rung, step) => (
			<Badge key={rung} {...(step === atRung ? {} : { color: RUNG_COLOR })}>
				{rung}
			</Badge>
		))}
	</span>
);

export const IncidentDesk = ({
	audit,
	buy,
	discards,
	rule,
	reach,
	refresh,
}: IncidentDeskProps) => (
	<Panel>
		<Panel.Header label={COPY.label} badge={{ label: reach }} />
		<Panel.Body>
			<div className={OFFER}>
				<Audit {...audit} layout="full" />
				<Press {...buy} />
				{discards === undefined ? null : (
					<p data-screen-theme={HELD_COLOR} className={DISCARDS}>
						{discards}
					</p>
				)}
				<div className={RULE_ROW}>
					<span>{rule}</span>
				</div>
			</div>

			{refresh === undefined ? null : (
				<div className={REFRESH_ROW}>
					<Press {...refresh} />
					<Typography variant="hint" as="span">
						{refresh.detail}
					</Typography>
					<Rungs rungs={refresh.rungs} atRung={refresh.atRung} />
				</div>
			)}
		</Panel.Body>
	</Panel>
);
