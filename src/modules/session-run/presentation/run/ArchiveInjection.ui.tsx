import { Paragraph } from "~/ui/typography/Paragraph.component";
import { Subtitle } from "~/ui/typography/Subtitle.component";
import { Title } from "~/ui/typography/Title.component";
import { StatBadge } from "./StatBadge.ui";

type ArchiveInjectionProps = {
	/** Total storage banked in the persistent vault across past runs. */
	vault: number;
	/** Storage injected into this run's opening balance (may be capped below the vault). */
	injected: number;
};

/** Run-start head start: how much archived storage carries into this run. */
export const ArchiveInjection = ({
	vault,
	injected,
}: ArchiveInjectionProps) => (
	<section className="flex flex-col gap-4 rounded-xl border border-cerulean bg-cerulean/10 p-6">
		<header>
			<Title as="h2" size="sm">
				Head start
			</Title>
			<Subtitle>Storage you archived carries into this run</Subtitle>
		</header>
		<div className="flex flex-wrap gap-8">
			<StatBadge label="Vault" value={`${vault}KB`} />
			<StatBadge label="Injected this run" value={`+${injected}KB`} />
		</div>
		{injected < vault ? (
			<Paragraph className="text-zinc-400">
				{vault - injected}KB stays banked — injection is capped for this run.
			</Paragraph>
		) : null}
	</section>
);
