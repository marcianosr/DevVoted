import { ExtraSpotRow, type ExtraSpotRowProps } from "./ExtraSpotRow.ui";
import { Section } from "./Section.ui";
import { Text } from "./Text.ui";
import { plural } from "./format";

const STEPS = "flex flex-col gap-1.5 pt-3";

export type ExtraSpotStep = ExtraSpotRowProps & { readonly id: string };

export type ExtraSpotsProps = {
	steps: readonly ExtraSpotStep[];
	renting: number;
	perGateKb: number;
};

export const ExtraSpots = ({ steps, renting, perGateKb }: ExtraSpotsProps) => (
	<Section
		title="Extra spots"
		value={
			<Text size="meta" tone="muted">
				{renting === 0
					? "renting nothing"
					: `renting ${renting} · ${perGateKb} KB a gate`}
			</Text>
		}
	>
		<Text as="p" size="meta" tone="muted">
			Gates unlock spots for free. Rent adds more on top, by the gate.
		</Text>
		<div className={STEPS}>
			{steps.map((step) => (
				<ExtraSpotRow key={step.id} {...step} />
			))}
		</div>
	</Section>
);

export const extraSpotLabel = (spots: number): string =>
	spots === 0 ? "none" : `+${plural(spots, "spot")}`;
