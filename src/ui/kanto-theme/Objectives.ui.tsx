import { Lead, type LeadLine, leadTextOf } from "./Lead.ui";
import { Panel } from "./Panel.ui";

const RULED = "border-t border-theme-faint";
const OBJECTIVE = "flex w-full flex-col gap-1";

const STATEMENT_VARIANT = "title";

export type Objective = {
	statement: LeadLine;
	earns: LeadLine;
};

export type ObjectivesProps = {
	objectives: readonly Objective[];
};

export const Objectives = ({ objectives }: ObjectivesProps) => (
	<>
		{objectives.map((objective, index) => (
			<Panel.Body
				key={leadTextOf(objective.statement)}
				className={index === 0 ? undefined : RULED}
			>
				<div className={OBJECTIVE}>
					<Lead
						line={objective.statement}
						variant={STATEMENT_VARIANT}
						as="span"
					/>
					<Lead line={objective.earns} />
				</div>
			</Panel.Body>
		))}
	</>
);
