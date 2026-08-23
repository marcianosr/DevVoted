import { Fold } from "./Fold.ui";
import { Plan, type PlanProps } from "./Plan.ui";
import { Text } from "./Text.ui";

const PLANS = "flex flex-col gap-1.5 pb-3";
const BILL =
	"flex items-center justify-between gap-3 border-t border-edge pt-3";

export type StoragePlanProps = {
	plans: readonly PlanProps[];
	/** What the coming gate charges on the plan in force. */
	nextBillKb: number;
};

export const StoragePlan = ({ plans, nextBillKb }: StoragePlanProps) => (
	<Fold
		title="Storage plan"
		value={
			<Text size="meta" tone="muted">
				billed every window, pass or fail
			</Text>
		}
	>
		<div className={PLANS}>
			{plans.map((plan) => (
				<Plan key={plan.id} {...plan} />
			))}
		</div>
		<Text as="p" size="meta" tone="muted">
			Switching is free. The bill lands when the window closes, whether you
			clear it or not.
		</Text>
		<div className={BILL}>
			<Text size="meta" tone="muted">
				next gate bills
			</Text>
			<Text size="meta" tone={nextBillKb === 0 ? "muted" : "default"}>
				{nextBillKb} KB
			</Text>
		</div>
	</Fold>
);
