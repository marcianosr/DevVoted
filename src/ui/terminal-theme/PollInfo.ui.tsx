import type { SwatchTheme } from "~/modules/run/gate/domain/swatch.model";

import { Audits, type AuditNote } from "./Audits.ui";
import { Badge, type BadgeTone, themeToneFor } from "./Badge.ui";
import { Text } from "./Text.ui";
import { Tooltip } from "./Tooltip.ui";
import { Trail, type TrailProps } from "./Trail.ui";

const FACTS = "flex flex-wrap items-center gap-x-2 gap-y-1.5";
const FACT = "flex items-center gap-2";

export type PollFact = {
	label?: string;
	value?: string;
	hint?: string;
	tone?: BadgeTone;
};

export type PollInfoProps = {
	trail: TrailProps;
	audits?: readonly AuditNote[];
	theme?: SwatchTheme;
	category: string;
	facts?: readonly PollFact[];
};

export const PollInfo = ({
	trail,
	audits = [],
	theme,
	category,
	facts = [],
}: PollInfoProps) => (
	<>
		<Trail {...trail} />

		<Audits rows={audits} />

		<div className={FACTS}>
			<Badge tone={themeToneFor(theme)}>{category}</Badge>
			{facts.map((fact) => (
				<span key={`${fact.label}-${fact.value}`} className={FACT}>
					<Text tone="faint" size="caption" aria-hidden>
						·
					</Text>
					{fact.label === undefined ? null : (
						<Text tone="muted" size="caption" weight="thin">
							{fact.label}
						</Text>
					)}
					{fact.value === undefined ? null : (
						<Tooltip hint={fact.hint}>
							<Badge tone={fact.tone ?? "neutral"}>{fact.value}</Badge>
						</Tooltip>
					)}
				</span>
			))}
		</div>
	</>
);
