import { useState } from "react";

import { GateOptionCard } from "~/domains/gates/components/GateOptionCard";
import type { GateType } from "~/domains/gates/models/gateType";
import { PrimaryButton } from "~/ui/PrimaryButton";

type GateSelectionModalProps = {
	isOpen: boolean;
	options: GateType[];
	currentGateTypeCode: string;
	gateNumber: number;
	onSelect: (gateTypeCode: string) => void;
	isLoading?: boolean;
	lockedGates?: GateType[];
};

export const GateSelectionModal = ({
	isOpen,
	options,
	currentGateTypeCode,
	gateNumber,
	onSelect,
	isLoading = false,
	lockedGates = [],
}: GateSelectionModalProps) => {
	const [selectedCode, setSelectedCode] = useState<string>(currentGateTypeCode);

	if (!isOpen) {
		return null;
	}

	const handleConfirm = () => {
		onSelect(selectedCode);
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
			<div className="bg-gray-900 border border-gray-700 p-6 max-w-2xl w-full mx-4">
				<div className="text-center mb-6">
					<h2 className="text-2xl text-white mb-2">Gate Passed!</h2>
					<p className="text-gray-400">
						Choose your path for Gate {gateNumber + 1}
					</p>
				</div>

				<div className="mb-6 flex gap-4 items-stretch">
					{options.map((gateType) => (
						<GateOptionCard
							key={gateType.code}
							gateType={gateType}
							isSelected={selectedCode === gateType.code}
							onClick={() => setSelectedCode(gateType.code)}
							isCurrent={gateType.code === currentGateTypeCode}
						/>
					))}
				</div>

				{lockedGates.length > 0 && (
					<div className="mb-6">
						<p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">
							Locked Gates
						</p>
						<div className="space-y-2">
							{lockedGates.map((gateType) => (
								<GateOptionCard
									key={gateType.code}
									gateType={gateType}
									isLocked
								/>
							))}
						</div>
					</div>
				)}

				<PrimaryButton
					onClick={handleConfirm}
					disabled={isLoading}
					isLoading={isLoading}
					className="w-full"
				>
					Continue with gate:{" "}
					<span className="text-green-400">
						&quot;
						{options.find((o) => o.code === selectedCode)?.name}
						&quot;
					</span>
				</PrimaryButton>
			</div>
		</div>
	);
};
