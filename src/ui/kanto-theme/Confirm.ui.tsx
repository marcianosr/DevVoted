import type { ReactNode } from "react";

import { Badge } from "./Badge.ui";
import { Button } from "./Button.ui";
import type { KantoColor } from "./colors";
import { Typography } from "./Typography.ui";

const TITLE_ROW = "flex items-center gap-3";
const DIVIDER = "border-t border-theme-faint";
const LEDGER = "flex flex-col gap-2";
const ROW = "flex items-baseline gap-3 text-sm";
const ROW_LABEL = "text-theme-faint";
const ROW_VALUE = "ml-auto shrink-0";
const ACTIONS = "flex items-center gap-3 pt-1";

const CANCEL_LABEL = "cancel";

export type ConfirmFigure = {
	label: string;
	value: string;
	color?: KantoColor;
};

export type ConfirmProps = {
	eyebrow: string;
	title: string;
	prose: string;
	figures: readonly ConfirmFigure[];
	confirmLabel: string;
	lead?: ReactNode;
	onConfirm?: () => void;
	onCancel?: () => void;
};

export const Confirm = ({
	eyebrow,
	title,
	prose,
	figures,
	confirmLabel,
	lead,
	onConfirm,
	onCancel,
}: ConfirmProps) => (
	<>
		<Typography variant="hint">{eyebrow}</Typography>

		<div className={TITLE_ROW}>
			{lead}
			<Typography variant="title">{title}</Typography>
		</div>

		<Typography variant="caption" as="p">
			{prose}
		</Typography>

		<div className={DIVIDER} />

		<dl className={LEDGER}>
			{figures.map((figure) => (
				<div key={figure.label} className={ROW}>
					<dt className={ROW_LABEL}>{figure.label}</dt>
					<dd className={ROW_VALUE}>
						<Badge color={figure.color}>{figure.value}</Badge>
					</dd>
				</div>
			))}
		</dl>

		<div className={ACTIONS}>
			<Button label={confirmLabel} size="md" onPress={onConfirm} />
			<Button label={CANCEL_LABEL} size="md" onPress={onCancel} />
		</div>
	</>
);
