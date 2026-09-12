import { Confirm, type ConfirmFigure } from "./Confirm.ui";

const EYEBROW = "upgrade";
const TITLE = "Free weight";
const VERB = "carry";
const FREE_WORD = "free";

export type PlanChangeProps = {
	weight: string;
	prose: string;
	figures: readonly ConfirmFigure[];
	onConfirm?: () => void;
	onCancel?: () => void;
};

export const PlanChange = ({
	weight,
	prose,
	figures,
	onConfirm,
	onCancel,
}: PlanChangeProps) => (
	<Confirm
		eyebrow={EYEBROW}
		title={`${TITLE} ${weight}`}
		prose={prose}
		figures={figures}
		confirmLabel={`${VERB} ${weight} ${FREE_WORD}`}
		onConfirm={onConfirm}
		onCancel={onCancel}
	/>
);
