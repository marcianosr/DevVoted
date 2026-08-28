import { useState } from "react";

import { rarityOf } from "~/modules/run/config/domain/config.model";
import type { RunView } from "~/modules/run/run/application/runView.viewmodel";
import { swatchForGate } from "~/modules/run/gate/domain/swatch.model";
import { RemovalScreen } from "~/ui/modern-theme/screens/RemovalScreen.ui";

export type RemovalViewProps = {
	view: RunView;
	onRemove: (configIds: readonly string[]) => void;
};

export const RemovalView = ({ view, onRemove }: RemovalViewProps) => {
	const [selectedIds, setSelectedIds] = useState<readonly string[]>([]);

	const toggle = (id: string) =>
		setSelectedIds((current) =>
			current.includes(id)
				? current.filter((held) => held !== id)
				: [...current, id]
		);

	return (
		<RemovalScreen
			theme={view.gateTheme}
			gateName={swatchForGate(view.gateStake.gateNumber)?.gateName ?? ""}
			required={view.peelSpotsRemaining}
			configs={view.configs.map((config) => ({
				id: config.id,
				label: config.label,
				rarity: rarityOf(config),
				notes: config.description,
			}))}
			selectedIds={selectedIds}
			onToggle={toggle}
			onRemove={() => onRemove(selectedIds)}
		/>
	);
};
