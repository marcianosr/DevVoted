import type { ReactNode } from "react";

import { clsx } from "clsx";

import type { KantoColor } from "./colors";
import { Panel, PANEL_SURFACE } from "./Panel.ui";

const WRAP = "fixed inset-0 z-50 flex items-center justify-center p-4";
const SCRIM =
	"absolute inset-0 cursor-default bg-black/70 transition-opacity duration-200 ease-out starting:opacity-0";
const DIALOG =
	"relative w-100 max-w-full transition-[opacity,scale] duration-250 ease-out-strong starting:opacity-0 starting:scale-96 motion-reduce:starting:scale-100";

const DISMISS_LABEL = "Dismiss";

export type ModalProps = {
	label: string;
	heading?: string;
	theme?: KantoColor;
	children: ReactNode;
	onDismiss?: () => void;
};

export const Modal = ({
	label,
	heading,
	theme,
	children,
	onDismiss,
}: ModalProps) => (
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
			data-screen-theme={theme}
			className={clsx(PANEL_SURFACE, DIALOG)}
		>
			{heading === undefined ? null : <Panel.Header label={heading} />}
			<Panel.Body>{children}</Panel.Body>
		</div>
	</div>
);
