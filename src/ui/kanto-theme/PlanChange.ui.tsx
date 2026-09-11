import { Confirm, type ConfirmFigure } from "./Confirm.ui";

const TITLE = "Storage plan";

export type PlanChangeDirection = "upgrade" | "downgrade";

const VERB = {
	upgrade: "rent",
	downgrade: "drop to",
} satisfies Record<PlanChangeDirection, string>;

export type PlanChangeProps = {
	direction: PlanChangeDirection;
	cap: string;
	prose: string;
	figures: readonly ConfirmFigure[];
	onConfirm?: () => void;
	onCancel?: () => void;
};

export const PlanChange = ({
	direction,
	cap,
	prose,
	figures,
	onConfirm,
	onCancel,
}: PlanChangeProps) => (
	<Confirm
		eyebrow={direction}
		title={`${TITLE} ${cap}`}
		prose={prose}
		figures={figures}
		confirmLabel={`${VERB[direction]} ${cap}`}
		onConfirm={onConfirm}
		onCancel={onCancel}
	/>
);
