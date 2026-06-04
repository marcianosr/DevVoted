import { useEffect, useRef } from "react";

import { SecondaryButton } from "~/ui/SecondaryButton.component";

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
			onClose={handleCancel}
			className="backdrop:bg-black backdrop:opacity-50 p-0 w-[min(28rem,calc(100vw-2rem))] m-auto border border-theme bg-gray-900 text-gray-200 whitespace-normal"
		>
			<div className="p-6">
				<h2 className="text-xl mb-4 text-white">{title}</h2>
				<p className="text-gray-400 mb-6 text-pretty break-words">{message}</p>
				{errorMessage && (
					<p
						role="alert"
						className="mb-4 border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300"
					>
						{errorMessage}
					</p>
				)}
				<div className="flex gap-3 justify-end">
					<SecondaryButton onClick={handleCancel} disabled={isConfirming}>
						{cancelText}
					</SecondaryButton>
					<SecondaryButton
						onClick={handleConfirm}
						variant="danger"
						disabled={isConfirming}
					>
						{confirmText}
					</SecondaryButton>
				</div>
			</div>
		</dialog>
	);
};
