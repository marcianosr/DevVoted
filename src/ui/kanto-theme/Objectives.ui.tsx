import { clsx } from "clsx";

import { Badge } from "./Badge.ui";
import type { KantoColor } from "./colors";
import { Icon } from "./Icon.ui";
import { PanelV2 } from "./PanelV2.ui";
import { Typography } from "./Typography.ui";

const SECTION = "flex w-full flex-col gap-2";
const RULED = "border-t border-theme-faint";
const STATEMENT = "flex flex-wrap items-center gap-2";
const OPTIONAL_LIST = "flex w-full flex-col gap-2";
const OPTIONAL_ROW = "flex w-full items-start gap-2 text-sm";
const MARK = "flex size-4 shrink-0 items-center justify-center rounded-xs";
const MARK_MET = "border-2 border-theme bg-theme-soft text-theme";
const MARK_OPEN = "text-theme-muted";
const MARK_LOST = "text-theme-muted";
const TICK = "size-2.5";
const CROSS = "block h-0.5 w-2 rotate-45 rounded-full bg-theme-muted";
const IDENTITY = "flex min-w-0 flex-1 flex-wrap items-baseline gap-x-2";
const NAME = "font-bold text-theme-faint";
const NAME_LOST = "font-bold text-theme-muted line-through";
const DETAIL = "text-xs text-theme-muted";
const FIGURES = "flex shrink-0 flex-wrap items-center justify-end gap-2 pl-2";

const SEPARATOR = "·";
const OPEN_GLYPH = "+";
const MET_NAME = "met";
const OPEN_NAME = "not yet";
const LOST_NAME = "out of reach";

export type ObjectiveRequirement = {
	lead: string;
	figure: string;
	color?: KantoColor;
	trail?: string;
};

export type RequiredObjective = {
	lead: string;
	statement: ObjectiveRequirement;
	explain: string;
	met: boolean;
};

export type Objective = {
	name: string;
	detail: string;
	met: boolean;
	/**
	 * Settled short: the window can no longer satisfy it. A row that still reads
	 * "not yet" once it is unreachable hides a cost the player has already paid.
	 */
	lost?: boolean;
	requirements: readonly ObjectiveRequirement[];
};

export type ObjectivesProps = {
	required: RequiredObjective;
	optional: readonly Objective[];
	optionalLead: string;
};

const markNameOf = (met: boolean, lost: boolean) => {
	if (met) return MET_NAME;
	return lost ? LOST_NAME : OPEN_NAME;
};

const markStyleOf = (met: boolean, lost: boolean) => {
	if (met) return MARK_MET;
	return lost ? MARK_LOST : MARK_OPEN;
};

const Mark = ({ met, lost }: { met: boolean; lost: boolean }) => (
	<span
		role="img"
		aria-label={markNameOf(met, lost)}
		className={clsx(MARK, markStyleOf(met, lost))}
	>
		{met ? <Icon name="tick" className={TICK} /> : null}
		{!met && lost ? <span className={CROSS} /> : null}
		{met || lost ? null : OPEN_GLYPH}
	</span>
);

/**
 * An optional prize shows its figure alone. The words either side of it belong
 * to the required line, where there is room to read a sentence; in a row that
 * already carries a name and a detail they only push the detail onto a line of
 * its own.
 */
const Figures = ({
	requirements,
}: {
	requirements: readonly ObjectiveRequirement[];
}) => (
	<span className={FIGURES}>
		{requirements.map((requirement) => (
			<Badge key={requirement.figure} color={requirement.color}>
				{requirement.figure}
			</Badge>
		))}
	</span>
);

const Required = ({ lead, statement, explain, met }: RequiredObjective) => (
	<div className={SECTION}>
		<Typography variant="hint">{lead}</Typography>

		<div className={STATEMENT}>
			{!met ? null : <Mark met lost={false} />}
			<Typography variant="title" as="span">
				{statement.lead}
			</Typography>
			<Badge color={statement.color}>{statement.figure}</Badge>
			{statement.trail === undefined ? null : (
				<Typography variant="title" as="span">
					{statement.trail}
				</Typography>
			)}
		</div>

		<Typography variant="hint">{explain}</Typography>
	</div>
);

const Optional = ({ objective }: { objective: Objective }) => (
	<div className={OPTIONAL_ROW}>
		<Mark met={objective.met} lost={objective.lost === true} />
		<span className={IDENTITY}>
			<span className={objective.lost === true ? NAME_LOST : NAME}>
				{objective.name}
			</span>
			<span className={DETAIL}>
				{SEPARATOR} {objective.detail}
			</span>
		</span>
		<Figures requirements={objective.requirements} />
	</div>
);

export const Objectives = ({
	required,
	optional,
	optionalLead,
}: ObjectivesProps) => (
	<>
		<PanelV2.Body>
			<Required {...required} />
		</PanelV2.Body>

		{optional.length === 0 ? null : (
			<PanelV2.Body className={RULED}>
				<div className={SECTION}>
					<Typography variant="hint">{optionalLead}</Typography>

					<div className={OPTIONAL_LIST}>
						{optional.map((objective) => (
							<Optional key={objective.name} objective={objective} />
						))}
					</div>
				</div>
			</PanelV2.Body>
		)}
	</>
);
