import { useEffect, useRef } from "react";

import { SecondaryButton } from "~/ui/SecondaryButton";

export type ConfirmDialogProps = {
	isOpen: boolean;
	onConfirm: () => void;
	onCancel: () => void;
	title: string;
	message: string;
	confirmText?: string;
	cancelText?: string;
};

export const ConfirmDialog = ({
	isOpen,
	onConfirm,
	onCancel,
	title,
	message,
	confirmText = "Yes",
	cancelText = "No",
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
			className="backdrop:bg-black backdrop:opacity-50 rounded-lg p-0 max-w-md m-auto border-1 border-theme bg-gray-900 text-gray-200"
		>
			<div className="p-6">
				<h2 className="text-xl mb-4 text-white">{title}</h2>
				<p className="text-gray-400 mb-6">{message}</p>
				<div className="flex gap-3 justify-end">
					<SecondaryButton onClick={handleCancel}>{cancelText}</SecondaryButton>
					<SecondaryButton onClick={handleConfirm} variant="danger">
						{confirmText}
					</SecondaryButton>
				</div>
			</div>
		</dialog>
	);
};
