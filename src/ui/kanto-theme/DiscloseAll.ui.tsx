import { Button, type ButtonTone } from "./Button.ui";
import { Icon } from "./Icon.ui";

const COPY = {
	expandAll: "expand all",
	collapseAll: "collapse all",
} as const;

const TONE: ButtonTone = "ambient";
const GLYPH = "size-4 stroke-[2.5]";

export type DiscloseAllProps = {
	/** Whether every card in the panel is currently open. */
	allOpen: boolean;
	onToggle: () => void;
};

/**
 * The panel's own fold, as a mark rather than a word: it stands in a header
 * that already carries the panel's meta, where a word-wide press is the widest
 * thing on the row and reads as the panel's subject. Two chevrons, because the
 * cards' single one is the per-card version of the same move.
 *
 * It still names the state it moves to rather than the one it is in, which is
 * what every other press in the kit does.
 */
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

/**
 * The press for a panel of cards, or nothing where the screen has not wired
 * one. Whether all of them are open is counted here rather than passed in: a
 * panel that reports its own "all open" can disagree with the set it hands the
 * cards, and then the press names the move it is not about to make.
 */
export const discloseAllFor = (panel: DisclosablePanel, cards: number) =>
	panel.onToggleAll === undefined ? undefined : (
		<DiscloseAll
			allOpen={cards > 0 && (panel.openInfo?.size ?? 0) >= cards}
			onToggle={panel.onToggleAll}
		/>
	);
