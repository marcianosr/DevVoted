import type { AnsweredPoll } from "~/modules/session-run/climb/sessionRun.model";
import type { Config } from "~/modules/session-run/configs/config.model";
import type { CheckStatus } from "~/modules/session-run/configs/effect.model";
import { Paragraph } from "~/ui/typography/Paragraph.component";
import { Subtitle } from "~/ui/typography/Subtitle.component";
import { Title } from "~/ui/typography/Title.component";
import { ConfigChip } from "../configs/ConfigChip.ui";
import { CheckList } from "../gate/CheckList.ui";
import { AnswerResults } from "../run/AnswerResults.ui";

type StripScreenProps = {
	stripsRemaining: number;
	configs: readonly Config[];
	checks: readonly CheckStatus[];
	answered: readonly AnsweredPoll[];
	onStrip: (configId: string) => void;
};

export const StripScreen = ({
	stripsRemaining,
	configs,
	checks,
	answered,
	onStrip,
}: StripScreenProps) => {
	const failed = checks.filter((check) => check.state === "failed");
	const quotaMet = stripsRemaining === 0;
	return (
		<div className="flex flex-col gap-6">
			<div className="rounded-xl border border-cinnabar bg-cinnabar/30 p-6">
				<Title>Gate failed!</Title>
				<Subtitle>This gate was too hard!</Subtitle>
				<Paragraph>
					Remove{" "}
					<span className="font-bold text-cinnabar">{stripsRemaining}</span>{" "}
					config{stripsRemaining === 1 ? "" : "s"} off your pipeline — your
					choice which. Deeper gates cost more.
				</Paragraph>
			</div>
			{failed.length > 0 ? (
				<div className="flex flex-col gap-2">
					<Subtitle>Your build broke because</Subtitle>
					<CheckList checks={failed} configs={configs} />
				</div>
			) : null}

			<AnswerResults answered={answered} />

			<div className="flex flex-col gap-3">
				<Subtitle>Remove a config to continue</Subtitle>
				<Paragraph>
					{quotaMet
						? "Build repaired. Climb on when you're ready."
						: `Peel ${stripsRemaining} config${stripsRemaining === 1 ? "" : "s"} off your pipeline to repair your build.`}
				</Paragraph>
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
			</div>
		</div>
	);
};
