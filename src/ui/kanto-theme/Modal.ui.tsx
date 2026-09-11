import type { ReactNode } from "react";

import { clsx } from "clsx";

import { PANEL_SURFACE } from "./Panel.ui";

const WRAP = "fixed inset-0 z-50 flex items-center justify-center p-4";
const SCRIM = "absolute inset-0 cursor-default bg-black/70";
const DIALOG = "relative w-100 max-w-full";

const DISMISS_LABEL = "Dismiss";

export type ModalProps = {
	label: string;
	children: ReactNode;
	onDismiss?: () => void;
};

export const Modal = ({ label, children, onDismiss }: ModalProps) => (
	<div className={WRAP}>
		<button
			type="button"
			aria-label={DISMISS_LABEL}
			onClick={onDismiss}
			className={SCRIM}
		/>
		<div
			role="dialog"
			aria-modal="true"
			aria-label={label}
			className={clsx(PANEL_SURFACE, DIALOG)}
		>
			{children}
		</div>
	</div>
);
