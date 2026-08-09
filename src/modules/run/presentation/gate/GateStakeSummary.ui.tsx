import { hasThemeColor, swatchForGate } from "~/modules/run/gate/swatch.model";
import type { PipelineModifiers } from "~/modules/run/pipeline/pipeline.model";
import { gateStake } from "~/modules/run/rules.model";
import { SwatchMark, swatchNameClass } from "~/ui/SwatchMark.component";
import { swatchTheme } from "~/ui/theme/swatchTheme";
import {
	Paragraph,
	type ParagraphTone,
} from "~/ui/typography/Paragraph.component";
import { Title } from "~/ui/typography/Title.component";
import { coverageValue } from "./GateModifierStrip.ui";

type GateStakeSummaryProps = {
	/** 0-indexed, same source as the HUD and `swatchForGate`. */
	gateNumber: number;
	pollsPerGate: number;
	/** Configs a failed window would peel at this depth (`dropCount`). */
	stripsOnFailure: number;
	configCount: number;
	/** What clearing this gate pays right now — the caption's reward figures. */
	modifiers: PipelineModifiers;
	/**
	 * The same figures recomputed with a hovered bench config added — the
	 * Configure bench's preview. Undefined outside that context (Prep has no
	 * bench to hover).
	 */
	preview?: PipelineModifiers;
};

/**
 * The peel quota's wording: the raw count normally, but "all" once that quota
 * would take the whole build — "1" reads as a lie once the pipeline only
 * holds 1 and a fail takes it, so the fatal case names what actually leaves,
 * not the quota that capped there.
 */
const stripLabel = (strips: number, configCount: number): string =>
	gateStake(strips, configCount).fatal
		? "strip all — run over"
		: `strip ${strips} config${strips === 1 ? "" : "s"}`;

/**
 * One caption figure that can be previewed: plain when nothing is hovered or
 * the candidate wouldn't change it, old (muted) → new (celadon) once it would
 * — the same "does this help?" read the old Gate modifiers strip gave the
 * bench, now living in the line it would otherwise go stale next to. Takes
 * already-formatted strings so a compound figure (coverage's "×2 +5%") needs
 * no separate numeric path from a plain one ("+32KB").
 */
const PreviewableStat = ({
	current,
	preview,
	tone,
}: {
	current: string;
	preview?: string;
	tone: ParagraphTone;
}) => {
	if (preview !== undefined && preview !== current)
		return (
			<>
				<Paragraph as="span" tone="muted" className="font-bold">
					{current}
				</Paragraph>
				<Paragraph as="span" tone="celadon" className="font-bold">
					{" "}
					→ {preview}
				</Paragraph>
			</>
		);
	return (
		<Paragraph as="span" tone={tone} className="font-bold">
			{current}
		</Paragraph>
	);
};

/**
 * The gate's name/position plus its terms, packed into one caption line
 * rather than a separate stakes box — a fail's cost and a clear's payout are
 * both single facts, and a callout for each read as more than either is
 * worth. Shared by the gate-prep screen (gates 1+) and the starting Configure
 * screen (gate 0 never reaches prep, since Configure already is that beat).
 */
export const GateStakeSummary = ({
	gateNumber,
	pollsPerGate,
	stripsOnFailure,
	configCount,
	modifiers,
	preview,
}: GateStakeSummaryProps) => {
	const swatch = swatchForGate(gateNumber);
	return (
		<header
			{...(swatch && hasThemeColor(swatch) ? swatchTheme(swatch.theme) : {})}
			className="flex flex-col gap-1"
		>
			<div className="flex items-center gap-2">
				{swatch ? <SwatchMark finish={swatch.finish} size="lg" /> : null}
				<Title
					as="h1"
					className={swatch ? swatchNameClass(swatch.finish) : undefined}
				>
					{swatch ? swatch.gateName : `Gate ${gateNumber}`} gate
				</Title>
			</div>
			<Paragraph tone="muted">
				{pollsPerGate} polls this window · clear reward{" "}
				<PreviewableStat
					current={`+${modifiers.gateReward}KB`}
					preview={preview && `+${preview.gateReward}KB`}
					tone="viridian"
				/>{" "}
				· base reward{" "}
				<PreviewableStat
					current={`×${modifiers.rewardMultiplier}`}
					preview={preview && `×${preview.rewardMultiplier}`}
					tone="default"
				/>{" "}
				· coverage{" "}
				<PreviewableStat
					current={coverageValue(modifiers)}
					preview={preview && coverageValue(preview)}
					tone="viridian"
				/>{" "}
				·{" "}
				<Paragraph as="span" tone="cinnabar" className="font-bold">
					{stripLabel(stripsOnFailure, configCount)}
				</Paragraph>
			</Paragraph>
		</header>
	);
};
