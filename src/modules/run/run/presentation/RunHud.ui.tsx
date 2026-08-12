import { clsx } from "clsx";

import { getCategories } from "~/shared/lib/categories";
import { Popover } from "~/ui/Popover.component";
import { Paragraph } from "~/ui/typography/Paragraph.component";
import {
	ALL_SWATCHES,
	hasThemeColor,
	swatchForGate,
} from "~/modules/run/gate/domain/swatch.model";
import { swatchNameClass } from "~/ui/SwatchMark.component";
import { swatchTheme } from "~/ui/theme/swatchTheme";
import { GateSegmentBar } from "~/modules/run/gate/presentation/GateSegmentBar.ui";
import { StorageGauge } from "~/modules/run/run/presentation/StorageGauge.ui";
import { SummaryDropdown } from "~/modules/run/run/presentation/SummaryDropdown.ui";

type RunHudProps = {
	storage: number;
	capKb: number;
	gatesCleared: number;
	victoryGate: number;
	pollsAnswered: number;
	pollsPerGate: number;
	coverage: number;
	coverageByCategory: Readonly<Record<string, number>>;
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
				<Paragraph as="span" size="xs" tone="pewter">
					Coverage
				</Paragraph>
				<Paragraph as="span" size="xs" tone="theme">
					{coverage}%
				</Paragraph>
			</span>
		);

	return (
		<SummaryDropdown
			trigger={
				<span className="flex flex-col items-start">
					<span className="flex items-baseline gap-1.5">
						<Paragraph as="span" size="xs" tone="pewter">
							Coverage
						</Paragraph>
						<Paragraph as="span" size="xs" tone="theme">
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

/** The ⓘ that sits beside a HUD number, opening its explanation on hover or tap. */
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
		<span {...(hasThemeColor(swatch) ? swatchTheme(swatch.theme) : {})}>
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
	capKb,
	gatesCleared,
	victoryGate,
	pollsAnswered,
	pollsPerGate,
	coverage,
	coverageByCategory,
}: RunHudProps) => (
	<div className="border-b border-zinc-800 pb-3 text-sm">
		<div className="flex flex-col gap-2 sm:hidden">
			<StorageGauge usedKb={storage} capKb={capKb} />
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
				<StorageGauge usedKb={storage} capKb={capKb} />
				<HudHint label="How storage works">
					Current storage caps at {capKb}KB. You can upgrade storage tiers in
					the shop to increase your cap and earn more KB per gate.
				</HudHint>
			</span>
			<span className="flex shrink-0 items-start gap-1.5">
				<span className="flex w-56 flex-col gap-1">
					<Paragraph as="span" size="xs" tone="pewter">
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
					Each gate contains 5 polls and runs checks on the pipeline. Clearing
					the gate earns you gate rewards and unlocks the next gate. Failing the
					gate applies penalties to your pipeline.
				</HudHint>
			</span>
			<div className="ml-auto flex shrink-0 items-center gap-6">
				<CoverageSummary
					coverage={coverage}
					coverageByCategory={coverageByCategory}
				/>
			</div>
		</div>
	</div>
);
