import { Paragraph } from "~/ui/typography/Paragraph.component";

type GateStakeSummaryProps = {
	pollsPerGate: number;
};

/**
 * How many polls the window runs. Which gate this is, what it pays and
 * costs, and the window's objectives are all the receipt further down the
 * screen (`GateStakeReceipt`) — this is just the poll count. Shared by the
 * gate-prep screen (gates 1+) and the starting Configure screen (gate 0
 * never reaches prep, since Configure already is that beat).
 */
export const GateStakeSummary = ({ pollsPerGate }: GateStakeSummaryProps) => (
	<Paragraph tone="muted">{pollsPerGate} polls thiss window</Paragraph>
);
