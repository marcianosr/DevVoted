import type { Config } from "~/modules/session-run/configs/config";
import { Paragraph } from "~/ui/typography/Paragraph.component";
import { ConfigChip } from "./ConfigChip.ui";

type ConfigRowProps = {
	config: Config;
	action?: string;
	onClick?: () => void;
};

/** A config chip alongside its description — for bench, draft, and strip lists. */
export const ConfigRow = ({ config, action, onClick }: ConfigRowProps) => (
	<div className="flex items-center gap-3">
		<ConfigChip config={config} action={action} onClick={onClick} />
		<Paragraph>{config.description}</Paragraph>
	</div>
);
