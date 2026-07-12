import type { Config } from "~/modules/session-run/configs/config";
import { Paragraph } from "~/ui/typography/Paragraph.component";
import { Title } from "~/ui/typography/Title.component";
import { ConfigChip } from "../configs/ConfigChip.ui";

type StripScreenProps = {
	stripsRemaining: number;
	configs: readonly Config[];
	onStrip: (configId: string) => void;
};

export const StripScreen = ({
	stripsRemaining,
	configs,
	onStrip,
}: StripScreenProps) => (
	<div className="flex flex-col gap-6">
		<div className="rounded-xl border border-cinnabar bg-cinnabar/10 p-6">
			<Title>Gate missed!</Title>
			<Paragraph>
				Peel <span className="font-bold text-cinnabar">{stripsRemaining}</span>{" "}
				config{stripsRemaining === 1 ? "" : "s"} off your pipeline — your choice
				which. Deeper gates cost more.
			</Paragraph>
		</div>
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
