import {
	type Config,
	describeConfig,
} from "~/modules/session-run/configs/config.model";
import type {
	CheckState,
	CheckStatus,
} from "~/modules/session-run/configs/effect.model";
import { Subtitle } from "~/ui/typography/Subtitle.component";
import { Title } from "~/ui/typography/Title.component";
import { ConfigChip } from "../configs/ConfigChip.ui";

const STATE_COLOR: Record<CheckState, string> = {
	running: "bg-vermillion",
	skipped: "bg-pewter",
	success: "bg-viridian",
	failed: "bg-cinnabar",
};

const STATE_TEXT: Record<CheckState, string> = {
	running: "text-vermillion",
	skipped: "text-pewter",
	success: "text-viridian",
	failed: "text-cinnabar",
};

/** Configs that gate you show up as checks; the rest are always-on perks. */
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
	/** A glanceable tracker — for the answering screen, where the poll is the focus. */
	compact?: boolean;
};

/** A slim tracker: gate summary, one line per check, then one line per always-on perk. */
const CompactGate = ({
	checks,
	configs,
	gateNumber,
	pollsToGate,
	gateReward,
}: Omit<GateRequirementListProps, "compact">) => {
	const perks = perksOf(configs, checks);
	return (
		<div className="flex flex-col gap-2 rounded-xl border border-zinc-700 px-4 py-3">
			<div className="flex items-baseline justify-between gap-2">
				<Subtitle>Pipelines · Gate #{gateNumber}</Subtitle>
				<span className="text-sm text-pewter">
					{pollsToGate} left · +{gateReward}KB
				</span>
			</div>
			<ul className="flex flex-col gap-1.5">
				{checks.map((check) => (
					<li
						key={check.label}
						className="flex items-center justify-between gap-2 text-sm"
					>
						<span className="flex items-center gap-2 font-bold text-cerulean">
							<span
								className={`inline-block h-2 w-2 shrink-0 rounded-full ${STATE_COLOR[check.state]}`}
							/>
							{check.label}
						</span>
						<span className={STATE_TEXT[check.state]}>{check.progress}</span>
					</li>
				))}
			</ul>
			{perks.length > 0 ? (
				<ul className="flex flex-col gap-1.5 border-t border-zinc-800 pt-2">
					{perks.map((perk) => (
						<li key={perk.id} className="flex items-center gap-2 text-sm">
							<span className="text-viridian">＋</span>
							<span className="font-bold text-white">{perk.label}</span>
							<span className="text-pewter">{describeConfig(perk)}</span>
						</li>
					))}
				</ul>
			) : null}
		</div>
	);
};

const SectionLabel = ({ children }: { children: string }) => (
	<p className="border-b border-zinc-800 px-4 py-2 text-xs uppercase tracking-wide text-pewter">
		{children}
	</p>
);

/** The gate as a CI-Pipelines panel: checks you must pass, then always-on perks, then the reward. */
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
		<div className="overflow-hidden rounded-xl border border-zinc-700">
			<header className="flex flex-col gap-1 border-b border-zinc-700 px-4 py-3">
				<div className="flex items-baseline justify-between">
					<Title as="h2">Pipelines</Title>
					<Subtitle>Gate #{gateNumber}</Subtitle>
				</div>
				<Subtitle>
					{pollsToGate} poll{pollsToGate === 1 ? "" : "s"} left ·{" "}
					{checks.length} active check{checks.length === 1 ? "" : "s"} · all
					must pass
				</Subtitle>
			</header>

			<SectionLabel>Checks · must pass</SectionLabel>
			<ul>
				{checks.map((check) => {
					const source = configs.find(
						(config) => config.id === check.sourceConfigId
					);
					const pct =
						check.target > 0
							? Math.min(100, Math.round((check.current / check.target) * 100))
							: 0;
					return (
						<li
							key={check.label}
							className="border-b border-zinc-800 px-4 py-2.5 last:border-b-0"
						>
							<div className="mb-1 flex items-center justify-between gap-3">
								<span className="flex items-center gap-2 font-bold text-cerulean">
									<span
										className={`inline-block h-2.5 w-2.5 shrink-0 rounded-full ${STATE_COLOR[check.state]}`}
									/>
									{source ? (
										<ConfigChip config={source} />
									) : (
										<span className="rounded border border-pewter px-2 py-1 text-xs uppercase tracking-wide text-pewter">
											base
										</span>
									)}
									{check.label}
								</span>
								<span className={STATE_TEXT[check.state]}>
									{check.progress}
								</span>
							</div>
							{check.description ? (
								<p className="mb-1.5 text-sm text-pewter">
									• {check.description}
								</p>
							) : null}
							<div className="h-2 overflow-hidden rounded bg-zinc-800">
								<div
									className={`h-full rounded ${STATE_COLOR[check.state]}`}
									style={{ width: `${pct}%` }}
								/>
							</div>
						</li>
					);
				})}
			</ul>

			{perks.length > 0 ? (
				<>
					<SectionLabel>Perks · always on</SectionLabel>
					<ul>
						{perks.map((perk) => (
							<li
								key={perk.id}
								className="flex items-center gap-3 border-b border-zinc-800 px-4 py-2.5 last:border-b-0"
							>
								<span className="text-viridian">＋</span>
								<ConfigChip config={perk} />
								<span className="text-sm text-pewter">
									{describeConfig(perk)}
								</span>
							</li>
						))}
					</ul>
				</>
			) : null}

			<footer className="border-t border-zinc-700 px-4 py-3">
				<Subtitle>
					Total reward if all pass:{" "}
					<span className="font-bold text-viridian">
						+{gateReward} KB storage
					</span>
				</Subtitle>
			</footer>
		</div>
	);
};
