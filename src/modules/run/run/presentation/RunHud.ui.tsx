import { clsx } from "clsx";

import { getCategories } from "~/shared/lib/categories";
import { Popover } from "~/ui/Popover.component";
import { Paragraph } from "~/ui/typography/Paragraph.component";
import {
	ALL_SWATCHES,
	themeColorOf,
	swatchForGate,
} from "~/modules/run/gate/domain/swatch.model";
import { swatchNameClass } from "~/ui/SwatchMark.component";
import { swatchTheme } from "~/ui/theme/swatchTheme";
import { GateSegmentBar } from "~/modules/run/gate/presentation/GateSegmentBar.ui";
import { StorageGauge } from "~/modules/run/run/presentation/StorageGauge.ui";
import { SummaryDropdown } from "~/modules/run/run/presentation/SummaryDropdown.ui";

type RunHudProps = {
	storage: number;
	gatesCleared: number;
	victoryGate: number;
	pollsAnswered: number;
	pollsPerGate: number;
	gateCoverage: number;
	gateCoverageDemand: number;
	coverageByCategory: Readonly<Record<string, number>>;
};

const gateMeterLabel = (held: number, demand: number): string =>
	`${held}% / ${demand}% this gate`;

const CoverageSummary = ({
	gateCoverage,
	gateCoverageDemand,
	coverageByCategory,
}: Pick<
	RunHudProps,
	"gateCoverage" | "gateCoverageDemand" | "coverageByCategory"
>) => {
	const all = getCategories().map(({ code, name }) => ({
		code,
		name,
		pct: coverageByCategory[code] ?? 0,
	}));
	const coveredCount = all.filter(({ pct }) => pct > 0).length;

	if (coveredCount === 0)
		return (
			<span className="flex items-baseline gap-2">
				<Paragraph as="span" size="xs" tone="muted">
					Coverage
				</Paragraph>
				<Paragraph as="span" size="xs" tone="theme">
					{gateMeterLabel(gateCoverage, gateCoverageDemand)}
				</Paragraph>
			</span>
		);

	return (
		<SummaryDropdown
			trigger={
				<span className="flex flex-col items-start">
					<span className="flex items-baseline gap-1.5">
						<Paragraph as="span" size="xs" tone="muted">
							Coverage
						</Paragraph>
						<Paragraph as="span" size="xs" tone="theme">
							{gateMeterLabel(gateCoverage, gateCoverageDemand)}
						</Paragraph>
					</span>
					<Paragraph as="span" size="xs" tone="muted">
						across {coveredCount} categor{coveredCount === 1 ? "y" : "ies"}
					</Paragraph>
				</span>
			}
			panelClassName="flex min-w-max flex-col gap-1.5"
		>
			{all.map(({ code, name, pct }) => (
				<span key={code} className="flex items-center gap-3">
					<Paragraph as="span" size="xs">
						{name}
					</Paragraph>
					<Paragraph as="span" size="xs" tone="muted" className="ml-auto">
						{pct}%
					</Paragraph>
				</span>
			))}
		</SummaryDropdown>
	);
};

const HudHint = ({
	label,
	children,
}: {
	label: string;
	children: React.ReactNode;
}) => (
	<Popover
		ariaLabel={label}
		content={
			<Paragraph size="xs" className="max-w-xs">
				{children}
			</Paragraph>
		}
	>
		<span className="text-pewter" aria-hidden>
			ⓘ
		</span>
	</Popover>
);

const GateName = ({ gate }: { gate: number }) => {
	const swatch = swatchForGate(gate);
	if (!swatch) return null;
	return (
		<span {...swatchTheme(themeColorOf(swatch))}>
			<Paragraph
				as="span"
				size="xs"
				className={clsx("font-bold", swatchNameClass(swatch.finish))}
			>
				{swatch.gateName}
			</Paragraph>
		</span>
	);
};

export const RunHud = ({
	storage,
	gatesCleared,
	victoryGate,
	pollsAnswered,
	pollsPerGate,
	gateCoverage,
	gateCoverageDemand,
	coverageByCategory,
}: RunHudProps) => (
	<div className="border-b border-edge pb-3 text-sm">
		<div className="flex flex-col gap-2 sm:hidden">
			<StorageGauge usedKb={storage} />
			<span className="flex flex-col gap-1">
				<GateSegmentBar
					swatches={ALL_SWATCHES}
					gatesCleared={gatesCleared}
					pollsAnswered={pollsAnswered}
					pollsPerGate={pollsPerGate}
					label={`gate ladder: gate ${gatesCleared} of ${victoryGate}`}
				/>
			</span>
		</div>
		<div className="hidden items-center gap-6 sm:flex">
			<span className="flex shrink-0 items-start gap-1.5">
				<StorageGauge usedKb={storage} />
				<HudHint label="How storage works">
					Storage is money: gate clears pay it, and the shop spends it on
					configs, upgrades and bringing pipeline width forward. Nothing caps
					what you can hold.
				</HudHint>
			</span>
			<span className="flex shrink-0 items-start gap-1.5">
				<span className="flex w-56 flex-col gap-1">
					<Paragraph as="span" size="xs" tone="muted">
						<GateName gate={gatesCleared} /> gate · {gatesCleared} /{" "}
						{victoryGate}
					</Paragraph>
					<GateSegmentBar
						swatches={ALL_SWATCHES}
						gatesCleared={gatesCleared}
						pollsAnswered={pollsAnswered}
						pollsPerGate={pollsPerGate}
						label={`gate ${gatesCleared} of ${victoryGate}`}
					/>
				</span>
				<HudHint label="How gates work">
					Each gate deals 5 polls and demands a coverage total earned inside
					them. Clear it for rewards and a wider pipeline; miss it and the gate
					peels a config, then you shop and run the same gate again.
				</HudHint>
			</span>
			<div className="ml-auto flex shrink-0 items-center gap-6">
				<CoverageSummary
					gateCoverage={gateCoverage}
					gateCoverageDemand={gateCoverageDemand}
					coverageByCategory={coverageByCategory}
				/>
			</div>
		</div>
	</div>
);
