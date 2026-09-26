import { Confirm, type ConfirmFigure } from "./Confirm.ui";
import { Weight } from "./Weight.ui";

const EYEBROW = "uninstall";
const CONFIRM_LABEL = "uninstall";

export type UninstallFigure = ConfirmFigure;

export type UninstallProps = {
	name: string;
	slots: number;
	prose: string;
	figures: readonly UninstallFigure[];
	onConfirm?: () => void;
	onCancel?: () => void;
};

export const Uninstall = ({
	name,
	slots,
	prose,
	figures,
	onConfirm,
	onCancel,
}: UninstallProps) => (
	<Confirm
		eyebrow={EYEBROW}
		title={name}
		prose={prose}
		figures={figures}
		confirmLabel={CONFIRM_LABEL}
		lead={<Weight slots={slots} />}
		onConfirm={onConfirm}
		onCancel={onCancel}
	/>
);
