import { Badge } from "./Badge.ui";
import type { KantoColor } from "./colors";
import { Icon } from "./Icon.ui";
import { Panel } from "./Panel.ui";
import { Typography } from "./Typography.ui";

const SECTION = "flex w-full flex-col gap-2";
const RULED = "border-t border-theme-faint";
const LIST = "flex w-full flex-col gap-5";
/**
 * The line under a statement hugs it, and the gap to the next objective is the
 * wider one: even spacing made four sentences read as four unrelated lines
 * rather than as two pairs.
 */
const OBJECTIVE = "flex w-full flex-col gap-1";
const STATEMENT = "flex flex-wrap items-center gap-2";
const EXPLAIN = "flex w-full flex-wrap items-center gap-2";
const EXPLAIN_TEXT = "min-w-0 flex-1";
const FIGURES = "flex shrink-0 flex-wrap items-center justify-end gap-2";
const MARK = "flex size-4 shrink-0 items-center justify-center rounded-xs";
const MARK_MET = "border-2 border-theme bg-theme-soft text-theme";
const MARK_LOST = "text-theme-muted";
const TICK = "size-2.5";
const CROSS = "block h-0.5 w-2 rotate-45 rounded-full bg-theme-muted";

const MET_NAME = "met";
const LOST_NAME = "out of reach";

/** "Finish at", the band badge, and the "or better" that may follow it. */
export type ObjectiveStatement = {
	lead: string;
	figure: string;
	color?: KantoColor;
	trail?: string;
};

export type ObjectiveFigure = {
	label: string;
	color?: KantoColor;
};

export type Objective = {
	statement: ObjectiveStatement;
	/** What the statement buys: "to clear the gate", "to earn the Pallet swatch". */
	explain: string;
	met: boolean;
	/**
	 * Settled short: the window can no longer satisfy it. A row that still reads
	 * open once it is unreachable hides a cost the player has already paid.
	 */
	lost?: boolean;
	figures?: readonly ObjectiveFigure[];
};

export type ObjectivesProps = {
	requiredLead: string;
	required: Objective;
	optionalLead: string;
	optional: readonly Objective[];
};

/**
 * Only a settled objective is marked. An open one carries no glyph at all: the
 * statement already reads as something still to do, and a mark per row turns a
 * short list of sentences into a checklist the player has to decode.
 */
const Mark = ({ met, lost }: { met: boolean; lost: boolean }) => {
	if (!met && !lost) return null;

	return (
		<span
			role="img"
			aria-label={met ? MET_NAME : LOST_NAME}
			className={`${MARK} ${met ? MARK_MET : MARK_LOST}`}
		>
			{met ? <Icon name="tick" className={TICK} /> : <span className={CROSS} />}
		</span>
	);
};

/**
 * Every objective reads the same way, required or not: the band on top as a
 * sentence, what it buys under it. The only thing the required one does not
 * share is its own section lead.
 */
const Statement = ({
	statement,
	explain,
	met,
	lost = false,
	figures = [],
}: Objective) => (
	<div className={OBJECTIVE}>
		<div className={STATEMENT}>
			<Mark met={met} lost={lost} />
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

		<div className={EXPLAIN}>
			<span className={EXPLAIN_TEXT}>
				<Typography variant="hint" as="span">
					{explain}
				</Typography>
			</span>
			{figures.length === 0 ? null : (
				<span className={FIGURES}>
					{figures.map((figure) => (
						<Badge key={figure.label} color={figure.color}>
							{figure.label}
						</Badge>
					))}
				</span>
			)}
		</div>
	</div>
);

export const Objectives = ({
	requiredLead,
	required,
	optional,
	optionalLead,
}: ObjectivesProps) => (
	<>
		<Panel.Body>
			<div className={SECTION}>
				<Typography variant="hint">{requiredLead}</Typography>
				<Statement {...required} />
			</div>
		</Panel.Body>

		{optional.length === 0 ? null : (
			<Panel.Body className={RULED}>
				<div className={SECTION}>
					<Typography variant="hint">{optionalLead}</Typography>

					<div className={LIST}>
						{optional.map((objective) => (
							<Statement key={objective.explain} {...objective} />
						))}
					</div>
				</div>
			</Panel.Body>
		)}
	</>
);
