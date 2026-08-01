import { useEffect, useRef } from "react";

import { Button } from "~/ui/Button.component";
import type { ScreenTheme } from "~/ui/Screen.ui";
import { Paragraph } from "~/ui/typography/Paragraph.component";
import { Title } from "~/ui/typography/Title.component";

export type ConfirmDialogProps = {
	isOpen: boolean;
	onConfirm: () => void;
	onCancel: () => void;
	title: string;
	message: string;
	confirmText?: string;
	cancelText?: string;
	errorMessage?: string | null;
	isConfirming?: boolean;
	/** Mood for the dialog: "cinnabar" turns border + buttons warning-red. */
	theme?: ScreenTheme;
};

export const ConfirmDialog = ({
	isOpen,
	onConfirm,
	onCancel,
	title,
	message,
	confirmText = "Yes",
	cancelText = "No",
	errorMessage,
	isConfirming = false,
	theme,
}: ConfirmDialogProps) => {
	const dialogRef = useRef<HTMLDialogElement>(null);

	useEffect(() => {
		const dialog = dialogRef.current;
		if (!dialog) return;

		if (isOpen) {
			dialog.showModal();
		} else {
			dialog.close();
		}
	}, [isOpen]);

	const handleConfirm = () => {
		onConfirm();
	};

	const handleCancel = () => {
		onCancel();
	};

	return (
		<dialog
			ref={dialogRef}
			data-screen-theme={theme}
			onClose={handleCancel}
			className="backdrop:bg-black backdrop:opacity-50 p-0 w-[min(28rem,calc(100vw-2rem))] m-auto rounded-xl border border-theme bg-zinc-900 whitespace-normal"
		>
			<div className="flex flex-col gap-4 p-6">
				<Title as="h2">{title}</Title>
				<Paragraph tone="muted" size="sm" className="text-pretty break-words">
					{message}
				</Paragraph>
				{errorMessage && (
					<div
						role="alert"
						className="rounded border border-cinnabar/40 bg-cinnabar/10 px-3 py-2"
					>
						<Paragraph tone="cinnabar" size="sm">
							{errorMessage}
						</Paragraph>
					</div>
				)}
				<div className="flex gap-3 justify-end">
					<Button
						variant="neutral"
						onClick={handleCancel}
						disabled={isConfirming}
					>
						{cancelText}
					</Button>
					<Button
						variant="danger"
						onClick={handleConfirm}
						disabled={isConfirming}
					>
						{confirmText}
					</Button>
				</div>
			</div>
		</dialog>
	);
};
