import { cva } from "class-variance-authority";

import type { AnsweredPoll } from "~/modules/run/climb/run.model";
import type { Config } from "~/modules/run/configs/config.model";
import type { CheckStatus } from "~/modules/run/configs/effect.model";
import { Paragraph } from "~/ui/typography/Paragraph.component";
import { Title } from "~/ui/typography/Title.component";
import { ConfigChip } from "../configs/ConfigChip.ui";
import { CheckList } from "../gate/CheckList.ui";
import { ReviewAnswers } from "../run/ReviewAnswers.ui";

type StripScreenProps = {
	stripsRemaining: number;
	gateNumber: number;
	configs: readonly Config[];
	checks: readonly CheckStatus[];
	answered: readonly AnsweredPoll[];
	onStrip: (configId: string) => void;
};

const repairCard = cva("flex flex-col rounded-xl border p-5", {
	variants: {
		repaired: {
			true: "border-viridian",
			false: "border-cerulean bg-cerulean/10",
		},
	},
});

const removeHeading = (stripsRemaining: number): string =>
	stripsRemaining === 0
		? "Build repaired — climb on when you're ready"
		: `Remove ${stripsRemaining} config${stripsRemaining === 1 ? "" : "s"} to continue`;

const FixedConfigNote = ({ configs }: { configs: readonly Config[] }) => {
	const fixed = configs.filter((config) => config.fixed);
	if (fixed.length === 0) return null;
	return (
		<Paragraph tone="pewter">
			{fixed.map((config) => config.label).join(", ")} can&apos;t be removed —
			fixed for every run.
		</Paragraph>
	);
};

export const StripScreen = ({
	stripsRemaining,
	gateNumber,
	configs,
	checks,
	answered,
	onStrip,
}: StripScreenProps) => {
	const failed = checks.filter((check) => check.state === "failed");
	const quotaMet = stripsRemaining === 0;
	return (
		<div className="flex flex-col gap-6">
			<header className="flex flex-col gap-2">
				<Title category="ruby">Gate failed!</Title>
				<Paragraph size="sm" tone="muted">
					Your build broke because:
				</Paragraph>
			</header>
			{failed.length > 0 ? (
				<CheckList checks={failed} configs={configs} />
			) : null}

			<div className={repairCard({ repaired: quotaMet })}>
				<Title as="h2" size="sm">
					{removeHeading(stripsRemaining)}
				</Title>
				<section className="space-y-2">
					{quotaMet ? null : (
						<Paragraph size="sm" tone="muted">
							This is the only thing standing between you and gate {gateNumber}.
						</Paragraph>
					)}
					<div className="flex flex-wrap gap-2">
						{configs
							.filter((config) => !config.fixed)
							.map((config) => (
								<ConfigChip
									key={config.id}
									config={config}
									action="Remove ✕"
									disabled={quotaMet}
									onClick={() => onStrip(config.id)}
								/>
							))}
					</div>
					<FixedConfigNote configs={configs} />
				</section>
			</div>

			<ReviewAnswers answered={answered} />
		</div>
	);
};
