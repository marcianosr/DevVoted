import { useEffect, useRef } from "react";

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
			className="backdrop:bg-black backdrop:opacity-50 rounded-lg p-0 max-w-md m-auto border-1 border-theme"
		>
			<div className="p-6">
				<h2 className="text-xl font-bold mb-4">{title}</h2>
				<p className="text-gray-400 mb-6">{message}</p>
				<div className="flex gap-3 justify-end">
					<button
						onClick={handleCancel}
						className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 transition-colors"
					>
						{cancelText}
					</button>
					<button
						onClick={handleConfirm}
						className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
					>
						{confirmText}
					</button>
				</div>
			</div>
		</dialog>
	);
};
