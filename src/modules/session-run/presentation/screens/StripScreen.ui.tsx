import type { Config } from "~/modules/session-run/configs/config.model";
import type { CheckStatus } from "~/modules/session-run/configs/effect.model";
import { Paragraph } from "~/ui/typography/Paragraph.component";
import { Subtitle } from "~/ui/typography/Subtitle.component";
import { Title } from "~/ui/typography/Title.component";
import { ConfigChip } from "../configs/ConfigChip.ui";

type StripScreenProps = {
	stripsRemaining: number;
	configs: readonly Config[];
	checks: readonly CheckStatus[];
	onStrip: (configId: string) => void;
};

export const StripScreen = ({
	stripsRemaining,
	configs,
	checks,
	onStrip,
}: StripScreenProps) => {
	const failed = checks.filter((check) => check.state === "failed");
	return (
		<div className="flex flex-col gap-6">
			<div className="rounded-xl border border-cinnabar bg-cinnabar/10 p-6">
				<Title>Gate failed!</Title>
				<Paragraph>
					Peel{" "}
					<span className="font-bold text-cinnabar">{stripsRemaining}</span>{" "}
					config{stripsRemaining === 1 ? "" : "s"} off your pipeline — your
					choice which. Deeper gates cost more.
				</Paragraph>
			</div>
			{failed.length > 0 ? (
				<div className="flex flex-col gap-2">
					<Subtitle>What broke the gate</Subtitle>
					<ul className="flex flex-col gap-1">
						{failed.map((check) => (
							<li
								key={check.label}
								className="flex items-center justify-between gap-3 font-bold text-cinnabar"
							>
								<span>✕ {check.label}</span>
								<span>{check.progress}</span>
							</li>
						))}
					</ul>
				</div>
			) : null}
			<div className="flex flex-wrap gap-2">
				{configs.map((config) => (
					<ConfigChip
						key={config.id}
						config={config}
						action="peel ✕"
						onClick={() => onStrip(config.id)}
					/>
				))}
			</div>
		</div>
	);
};
