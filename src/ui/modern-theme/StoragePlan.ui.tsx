import { Chip } from "./Chip.ui";
import { Fold } from "./Fold.ui";
import { Plan, type PlanProps } from "./Plan.ui";
import { Text } from "./Text.ui";

const PLANS = "flex flex-col gap-1.5 pb-3 pt-3";
const BILL = "flex items-center justify-between gap-3 pt-3";

export type StoragePlanProps = {
	plans: readonly PlanProps[];
	nextBillKb: number;
};

const held = (plans: readonly PlanProps[]) => {
	const plan = plans.find((rung) => !rung.locked && rung.selected);
	if (!plan?.cap) return "no plan";
	return plan.free ? `${plan.cap} · free tier` : `${plan.cap} · ${plan.terms}`;
};

export const StoragePlan = ({ plans, nextBillKb }: StoragePlanProps) => (
	<Fold
		title="Storage plan"
		value={
			<Text size="meta" tone="muted">
				{held(plans)}
			</Text>
		}
	>
		<Text as="p" size="meta" tone="muted">
			Select a plan to increase storage capacity. Switching is free.
		</Text>
		<div className={PLANS}>
			{plans.map((plan) => (
				<Plan key={plan.id} {...plan} />
			))}
		</div>
		<div className={BILL}>
			<Text size="body" tone="default">
				Cost per gate
			</Text>
			{/* The label already says it is a cost, so the chip carries the figure
			    rather than a sign — and a free plan says so in words. */}
			{nextBillKb === 0 ? (
				<Chip tone="muted">free</Chip>
			) : (
				<Chip tone="vermillion">{nextBillKb} KB</Chip>
			)}
		</div>
	</Fold>
);
