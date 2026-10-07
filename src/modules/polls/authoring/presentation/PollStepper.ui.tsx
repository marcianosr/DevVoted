import type { PollStep } from "~/modules/polls/authoring/application/pollList.viewmodel";
import { Link } from "~/ui/kanto-theme/Link.ui";
import { Typography } from "~/ui/kanto-theme/Typography.ui";

export const COPY = {
	back: "← Polls",
	previous: "‹ previous",
	next: "next ›",
	position: (position: number, total: number) => `${position} of ${total}`,
} as const;

const STEPPER = "flex flex-wrap items-center gap-3";
const NEIGHBOURS = "flex items-center gap-3";

export type PollStepperProps = {
	listHref: string;
	step?: PollStep;
};

export const PollStepper = ({ listHref, step }: PollStepperProps) => (
	<nav className={STEPPER}>
		<Link href={listHref}>{COPY.back}</Link>
		{step === undefined ? null : (
			<span className={NEIGHBOURS}>
				{step.previousHref === undefined ? null : (
					<Link href={step.previousHref}>{COPY.previous}</Link>
				)}
				<Typography variant="hint" as="span">
					{COPY.position(step.position, step.total)}
				</Typography>
				{step.nextHref === undefined ? null : (
					<Link href={step.nextHref}>{COPY.next}</Link>
				)}
			</span>
		)}
	</nav>
);
