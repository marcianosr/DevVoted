import { Button, type ButtonTone } from "./Button.ui";
import { Icon } from "./Icon.ui";

const COPY = {
	expandAll: "expand all",
	collapseAll: "collapse all",
} as const;

const TONE: ButtonTone = "ambient";
const GLYPH = "size-4 stroke-[2.5]";

export type DiscloseAllProps = {
	allOpen: boolean;
	onToggle: () => void;
};

export const DiscloseAll = ({ allOpen, onToggle }: DiscloseAllProps) => (
	<Button
		tone={TONE}
		glyph={<Icon name="fold" className={GLYPH} />}
		label={allOpen ? COPY.collapseAll : COPY.expandAll}
		onPress={onToggle}
	/>
);

export type DisclosablePanel = {
	onToggleAll?: () => void;
	openInfo?: ReadonlySet<string>;
};

export const discloseAllFor = (panel: DisclosablePanel, cards: number) =>
	panel.onToggleAll === undefined ? undefined : (
		<DiscloseAll
			allOpen={cards > 0 && (panel.openInfo?.size ?? 0) >= cards}
			onToggle={panel.onToggleAll}
		/>
	);
