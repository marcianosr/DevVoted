import { Audit } from "./Audit.ui";
import { Button } from "./Button.ui";
import { Climber } from "./Climber.ui";
import type { KantoColor } from "./colors";
import { Figures } from "./Figures.ui";
import { Panel, type PanelBadge } from "./Panel.ui";
import { Typography } from "./Typography.ui";

const COPY = {
	from: "from",
	noSender: "no sender",
	respond: "respond",
} as const;

const NOTE_GAIN: KantoColor = "pewter";

const BODY = "min-w-0 flex-1";
const FROM = "flex shrink-0 items-center gap-2";
const FROM_WORD = "text-xs text-theme-muted";
const SENDER = "text-sm font-bold text-theme-soft";
const NO_FACE =
	"inline-block size-7 shrink-0 rounded-md border border-dashed border-theme-faint";

const PRESS_SIZE = "sm";

/** Who fired it. Absent on a gate whose schedule predates the rival that filled it. */
export type AuditSender = {
	name: string;
	photoUrl?: string;
	borderUrl?: string;
};

/** Aim your own audit back at them, where they are a target you were offered. */
export type AuditRespond = {
	onPress?: () => void;
	disabled?: boolean;
	hint?: string;
};

export type AuditsRow = {
	code: number;
	name: string;
	cue: string;
	sender?: AuditSender;
	respond?: AuditRespond;
};

export type AuditsPanelProps = {
	title: string;
	/** How many are firing, or why none are. */
	meta?: string;
	/** The gate that opens the panel, while it is still shut. */
	badge?: PanelBadge;
	/** What the gate bills you, stated beside what it throws at you. */
	bill?: string;
	note?: string;
	rows: readonly AuditsRow[];
};

const From = ({ sender, respond }: Pick<AuditsRow, "sender" | "respond">) => (
	<span className={FROM}>
		{sender === undefined ? (
			<>
				<span aria-hidden className={NO_FACE} />
				<span className={FROM_WORD}>{COPY.noSender}</span>
			</>
		) : (
			<>
				<span className={FROM_WORD}>{COPY.from}</span>
				<Climber
					name={sender.name}
					photoUrl={sender.photoUrl}
					borderUrl={sender.borderUrl}
					size="sm"
				/>
				<span className={SENDER}>{sender.name}</span>
			</>
		)}
		{respond === undefined ? null : (
			<Button
				label={COPY.respond}
				hint={respond.hint}
				size={PRESS_SIZE}
				disabled={respond.disabled}
				onPress={respond.onPress}
			/>
		)}
	</span>
);

/**
 * What rivals locked onto the gate in front of you, each row naming the player
 * who fired it. The sender sits where the target sits on the panel below, so
 * the pair reads as one exchange rather than as two lists of audits (ADR-099).
 */
export const AuditsPanel = ({
	title,
	meta,
	badge,
	bill,
	note,
	rows,
}: AuditsPanelProps) => (
	<Panel>
		<Panel.Header
			label={title}
			badge={badge}
			meta={bill === undefined ? undefined : <Figures text={bill} />}
		/>

		{meta === undefined ? null : (
			<Panel.Body>
				<Typography variant="hint">{meta}</Typography>
			</Panel.Body>
		)}

		{rows.length === 0 ? null : (
			<Panel.Rows>
				{rows.map((row) => (
					<Panel.Row
						key={row.code}
						trailing={<From sender={row.sender} respond={row.respond} />}
					>
						<span className={BODY}>
							<Audit
								code={row.code}
								name={row.name}
								cue={row.cue}
								layout="row"
							/>
						</span>
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
