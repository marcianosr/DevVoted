import { type CategoryCode, getCategories } from "~/domains/shared/categories";
import type { Config } from "~/modules/run/configs/config.model";
import type { CheckStatus } from "~/modules/run/configs/effect.model";
import { Popover } from "~/ui/Popover.component";
import { Swatch } from "~/ui/Swatch.component";
import { categoryTheme } from "~/ui/theme/categoryTheme";
import { STORAGE_CAP_KB } from "../../rules.model";
import { Paragraph } from "~/ui/typography/Paragraph.component";
import { ConfigChip } from "../configs/ConfigChip.ui";
import { CheckList } from "../gate/CheckList.ui";
import { SummaryDropdown } from "./SummaryDropdown.ui";

const storagePercent = (storage: number) =>
	Math.min(100, Math.max(0, (storage / STORAGE_CAP_KB) * 100));

type RunHudProps = {
	storage: number;
	gateNumber: number;
	victoryGate: number;
	pollsAnswered: number;
	pollsPerGate: number;
	streak: number;
	category?: CategoryCode;
	coverage: number;
	coverageByCategory: Readonly<Record<string, number>>;
	configs: readonly Config[];
	slots: number;
	checks: readonly CheckStatus[];
};

const LoadoutSummary = ({
	configs,
	slots,
}: Pick<RunHudProps, "configs" | "slots">) => {
	const free = configs.filter((config) => !config.fixed).length;

	return (
		<SummaryDropdown
			trigger={
				<>
					<Paragraph as="span" size="sm" tone="pewter">
						Loadout
					</Paragraph>
					<Paragraph as="span" size="sm" tone="theme">
						{free} / {slots}
					</Paragraph>
				</>
			}
			panelClassName="flex min-w-max max-w-md flex-wrap gap-2"
		>
			{configs.length > 0 ? (
				configs.map((config) => <ConfigChip key={config.id} config={config} />)
			) : (
				<Paragraph as="span" size="sm" tone="pewter">
					No configs equipped yet.
				</Paragraph>
			)}
		</SummaryDropdown>
	);
};

const CoverageSummary = ({
	coverage,
	coverageByCategory,
}: Pick<RunHudProps, "coverage" | "coverageByCategory">) => {
	const all = getCategories().map(({ code, name }) => ({
		code,
		name,
		pct: coverageByCategory[code] ?? 0,
	}));
	const coveredCount = all.filter(({ pct }) => pct > 0).length;

	if (coveredCount === 0)
		return (
			<span className="flex items-baseline gap-2">
				<Paragraph as="span" size="sm" tone="pewter">
					Coverage
				</Paragraph>
				<Paragraph as="span" size="sm" tone="theme">
					{coverage}%
				</Paragraph>
			</span>
		);

	return (
		<SummaryDropdown
			trigger={
				<span className="flex flex-col items-start">
					<span className="flex items-baseline gap-1.5">
						<Paragraph as="span" size="sm" tone="pewter">
							Coverage
						</Paragraph>
						<Paragraph as="span" size="sm" tone="theme">
							{coverage}%
						</Paragraph>
					</span>
					<Paragraph as="span" size="xs" tone="pewter">
						across {coveredCount} categor{coveredCount === 1 ? "y" : "ies"}
					</Paragraph>
				</span>
			}
			panelClassName="flex min-w-max flex-col gap-1.5"
		>
			{all.map(({ code, name, pct }) => (
				<span
					key={code}
					{...categoryTheme(code)}
					className="flex items-center gap-3"
				>
					<Swatch size="sm" />
					<Paragraph as="span" size="sm" tone="theme">
						{name}
					</Paragraph>
					<Paragraph as="span" size="sm" tone="muted" className="ml-auto">
						{pct}%
					</Paragraph>
				</span>
			))}
		</SummaryDropdown>
	);
};

const MobileStakesPanel = ({
	streak,
	coverage,
	configs,
	checks,
}: Pick<RunHudProps, "streak" | "coverage" | "configs" | "checks">) => (
	<>
		<CheckList checks={checks} configs={configs} />
		<hr className="border-zinc-800" />
		<span className="flex items-baseline justify-between gap-4">
			<Paragraph as="span" size="sm" tone="pewter">
				Streak
			</Paragraph>
			<Paragraph as="span" size="sm" tone="theme">
				{streak}
			</Paragraph>
		</span>
		<span className="flex items-baseline justify-between gap-4">
			<Paragraph as="span" size="sm" tone="pewter">
				Coverage
			</Paragraph>
			<Paragraph as="span" size="sm" tone="theme">
				{coverage}%
			</Paragraph>
		</span>
		{configs.length > 0 ? (
			<span className="flex flex-wrap gap-2">
				{configs.map((config) => (
					<ConfigChip key={config.id} config={config} />
				))}
			</span>
		) : null}
	</>
);

export const RunHud = ({
	storage,
	gateNumber,
	victoryGate,
	pollsAnswered,
	pollsPerGate,
	streak,
	category,
	coverage,
	coverageByCategory,
	configs,
	slots,
	checks,
}: RunHudProps) => (
	<div
		className="border-b border-zinc-800 pb-3 text-sm font-black"
		{...(category ? categoryTheme(category) : {})}
	>
		<div className="flex items-center justify-between gap-3 sm:hidden">
			<span className="flex items-baseline gap-2">
				<Paragraph as="span" size="sm" tone="theme">
					{storage}KB
				</Paragraph>
				<span className="text-pewter">·</span>
				<Paragraph as="span" size="sm" tone="pewter">
					Gate
				</Paragraph>
				<Paragraph as="span" size="sm" tone="theme">
					{gateNumber}/{victoryGate}
				</Paragraph>
				<span className="text-pewter">·</span>
				<Paragraph as="span" size="sm" tone="pewter">
					{pollsAnswered}/{pollsPerGate} polls
				</Paragraph>
			</span>
			<SummaryDropdown
				trigger={<span className="text-cinnabar">Stakes</span>}
				triggerClassName="rounded-lg border border-cinnabar/60 px-3 py-1"
				panelClassName="flex w-72 flex-col gap-3"
			>
				<MobileStakesPanel
					streak={streak}
					coverage={coverage}
					configs={configs}
					checks={checks}
				/>
			</SummaryDropdown>
		</div>

		<div className="hidden items-center gap-6 sm:flex">
			<span className="flex shrink-0 items-center gap-1.5">
				<Paragraph as="span" size="sm" tone="pewter">
					Storage
				</Paragraph>
				<Paragraph as="span" size="sm" tone="theme">
					{storage}KB
				</Paragraph>
				<span
					className="ml-1 h-1.5 w-16 overflow-hidden rounded-full bg-zinc-800"
					role="progressbar"
					aria-valuenow={storage}
					aria-valuemin={0}
					aria-valuemax={STORAGE_CAP_KB}
				>
					<span
						className="block h-full rounded-full bg-theme transition-all"
						style={{ width: `${storagePercent(storage)}%` }}
					/>
				</span>
				<Popover
					ariaLabel="How storage works"
					content={
						<p className="max-w-xs text-sm">
							Storage caps at 1 MB. Clear gates and answer correctly to earn KB
							— income beyond the cap is discarded.
						</p>
					}
				>
					<span className="text-pewter" aria-hidden>
						ⓘ
					</span>
				</Popover>
			</span>
			<span className="flex shrink-0 items-baseline gap-1.5">
				<Paragraph as="span" size="sm" tone="pewter">
					Gate
				</Paragraph>
				<Paragraph as="span" size="sm" tone="theme">
					{gateNumber} / {victoryGate}
				</Paragraph>
			</span>
			<span className="flex shrink-0 items-baseline gap-1.5">
				<Paragraph as="span" size="sm" tone="theme">
					{pollsAnswered} / {pollsPerGate}
				</Paragraph>
				<Paragraph as="span" size="sm" tone="pewter">
					polls
				</Paragraph>
			</span>
			<span className="flex shrink-0 items-baseline gap-1.5">
				<Paragraph as="span" size="sm" tone="theme">
					{streak}
				</Paragraph>
				<Paragraph as="span" size="sm" tone="pewter">
					streak
				</Paragraph>
			</span>
			<div className="ml-auto flex shrink-0 items-center gap-6">
				<LoadoutSummary configs={configs} slots={slots} />
				<CoverageSummary
					coverage={coverage}
					coverageByCategory={coverageByCategory}
				/>
			</div>
		</div>
	</div>
);
