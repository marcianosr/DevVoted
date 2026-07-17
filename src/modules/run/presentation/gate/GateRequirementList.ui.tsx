import type { Config } from "~/modules/run/configs/config.model";
import type { CheckStatus } from "~/modules/run/configs/effect.model";
import { Subtitle } from "~/ui/typography/Subtitle.component";
import { CheckList, PerkList } from "./CheckList.ui";
import { Paragraph } from "~/ui/typography/Paragraph.component";

const perksOf = (
	configs: readonly Config[],
	checks: readonly CheckStatus[]
): readonly Config[] =>
	configs.filter(
		(config) => !checks.some((check) => check.sourceConfigId === config.id)
	);

type GateRequirementListProps = {
	checks: readonly CheckStatus[];
	configs: readonly Config[];
	gateNumber: number;
	pollsToGate: number;
	gateReward: number;
	compact?: boolean;
};

const CompactGate = ({
	checks,
	configs,
}: Omit<GateRequirementListProps, "compact">) => {
	const perks = perksOf(configs, checks);
	return (
		<div className="flex flex-col gap-2">
			<Subtitle>Pipeline requirements</Subtitle>
			<CheckList checks={checks} configs={configs} />
			{perks.length > 0 ? (
				<>
					<Subtitle>Pipeline perks</Subtitle>
					<PerkList perks={perks} />
				</>
			) : null}
		</div>
	);
};

export const GateRequirementList = ({
	checks,
	configs,
	gateNumber,
	pollsToGate,
	gateReward,
	compact,
}: GateRequirementListProps) => {
	if (compact)
		return (
			<CompactGate
				checks={checks}
				configs={configs}
				gateNumber={gateNumber}
				pollsToGate={pollsToGate}
				gateReward={gateReward}
			/>
		);

	const perks = perksOf(configs, checks);
	return (
		<div className="flex flex-col gap-3">
			<Subtitle>Pipeline requirements</Subtitle>
			<CheckList checks={checks} configs={configs} />

			{perks.length > 0 ? (
				<>
					<Subtitle>Pipeline perks</Subtitle>
					<PerkList perks={perks} />
				</>
			) : null}

			<Paragraph>
				Total reward if all pass:{" "}
				<span className="font-bold text-viridian">
					+{gateReward} KB storage
				</span>
			</Paragraph>
		</div>
	);
};
