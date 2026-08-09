import { hasThemeColor, swatchForGate } from "~/modules/run/gate/swatch.model";
import { SwatchMark, swatchNameClass } from "~/ui/SwatchMark.component";
import { swatchTheme } from "~/ui/theme/swatchTheme";
import { Paragraph } from "~/ui/typography/Paragraph.component";
import { Title } from "~/ui/typography/Title.component";

type GateStakeSummaryProps = {
	/** 0-indexed, same source as the HUD and `swatchForGate`. */
	gateNumber: number;
	pollsPerGate: number;
};

/**
 * The gate's identity: its swatch and name, and how many polls the window
 * runs. What it pays and what it costs are their own receipt further down
 * the screen (`GateStakeReceipt`) — this is just "which gate is this".
 * Shared by the gate-prep screen (gates 1+) and the starting Configure
 * screen (gate 0 never reaches prep, since Configure already is that beat).
 */
export const GateStakeSummary = ({
	gateNumber,
	pollsPerGate,
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
			<Paragraph tone="muted">{pollsPerGate} polls this window</Paragraph>
		</header>
	);
};
