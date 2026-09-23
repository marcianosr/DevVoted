import type { AuditId } from "~/modules/run/gate/domain/audit.model";

import { Badge } from "./Badge.ui";
import { Button } from "./Button.ui";
import { ConfigChip, type ConfigChipProps } from "./ConfigChip.ui";
import { Panel } from "./Panel.ui";
import { Typography } from "./Typography.ui";

const RIVAL = "flex min-w-0 flex-col gap-0.5";
const NAME = "text-sm font-bold text-theme-soft";
const GATE = "text-xs text-theme-muted";
const PRESSES = "flex flex-wrap items-center justify-end gap-2";
const BUILD = "flex flex-wrap items-center gap-1.5 pt-1";

const NOTHING_INSTALLED = "nothing installed";

const PRESS_TONE = "action";
const PRESS_SIZE = "sm";

export type AttackPayload = {
	auditId: AuditId;
	code: number;
	name: string;
	/** The whole press: "Fire 404 at Misty". */
	label: string;
	onPress?: () => void;
};

export type AttackRival = {
	targetRunId: number;
	name: string;
	/** Where the audit lands, as the row states it: "gate 7 · Marsh". */
	gate: string;
	/** What they run, readable before you fire (ADR-101). */
	build: readonly ConfigChipProps[];
	payloads: readonly AttackPayload[];
};

export type AttackPanelProps = {
	title: string;
	/** What the armed band earns: "1 payload" or "choose 1 of 2 payloads". */
	meta?: string;
	rivals: readonly AttackRival[];
	/** Why there is nothing to press: unarmed, no rival in range, still dealing. */
	empty?: string;
	/** A refusal or a result, under the rows. */
	note?: string;
};

const RivalBuild = ({ build }: { build: readonly ConfigChipProps[] }) => {
	if (build.length === 0)
		return <span className={GATE}>{NOTHING_INSTALLED}</span>;

	return (
		<span className={BUILD}>
			{build.map((config, index) =>
				config.locked === true ? (
					<ConfigChip key={index} locked />
				) : (
					<ConfigChip key={config.name} {...config} width="fit" />
				)
			)}
		</span>
	);
};

const Rival = ({ name, gate, build, payloads }: AttackRival) => (
	<Panel.Row
		trailing={
			<span className={PRESSES}>
				{payloads.map((payload) => (
					<Button
						key={payload.auditId}
						label={payload.label}
						tone={PRESS_TONE}
						size={PRESS_SIZE}
						onPress={payload.onPress}
					/>
				))}
			</span>
		}
	>
		<span className={RIVAL}>
			<span className={NAME}>{name}</span>
			<span className={GATE}>{gate}</span>
			<RivalBuild build={build} />
		</span>
	</Panel.Row>
);

/**
 * The one moment a player acts against another: the rivals an armed attack
 * may be aimed at, one press per payload. Its empty states teach how an attack
 * is earned, so the panel is always drawn and never withheld.
 */
export const AttackPanel = ({
	title,
	meta,
	rivals,
	empty,
	note,
}: AttackPanelProps) => (
	<Panel>
		<Panel.Header
			label={title}
			meta={meta === undefined ? undefined : <Badge>{meta}</Badge>}
		/>

		{rivals.length === 0 ? (
			<Panel.Body>
				<Typography variant="hint">{empty}</Typography>
			</Panel.Body>
		) : (
			<Panel.Rows>
				{rivals.map((rival) => (
					<Rival key={rival.targetRunId} {...rival} />
				))}
			</Panel.Rows>
		)}

		{note === undefined ? null : (
			<Panel.Footer>
				<Typography variant="hint">{note}</Typography>
			</Panel.Footer>
		)}
	</Panel>
);
