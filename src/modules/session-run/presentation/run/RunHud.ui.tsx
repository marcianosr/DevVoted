import { useState } from "react";
import { type CategoryCode, getCategories } from "~/domains/shared/categories";
import { Popover } from "~/ui/Popover.component";
import { Swatch } from "~/ui/Swatch.component";
import { categoryTheme } from "~/ui/theme/categoryTheme";
import { STORAGE_CAP_KB } from "../../rules.model";
import { Paragraph } from "~/ui/typography/Paragraph.component";

const storagePercent = (storage: number) =>
	Math.min(100, Math.max(0, (storage / STORAGE_CAP_KB) * 100));

type RunHudProps = {
	storage: number;
	gateNumber: number;
	victoryGate: number;
	pollsAnswered: number;
	pollsPerGate: number;
	/** Consecutive correct answers across the run; resets only on a wrong answer. */
	streak: number;
	/** The category of the poll being answered; absent outside the answering screen. */
	category?: CategoryCode;
	coverage: number;
	coverageByCategory: Readonly<Record<string, number>>;
};

const CoverageSummary = ({
	coverage,
	coverageByCategory,
}: Pick<RunHudProps, "coverage" | "coverageByCategory">) => {
	const [open, setOpen] = useState(false);
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
		<div className="relative">
			<button
				type="button"
				onClick={() => setOpen((isOpen) => !isOpen)}
				className="flex cursor-pointer items-center gap-1.5"
			>
				<Paragraph as="span" size="sm" tone="pewter">
					Coverage
				</Paragraph>
				<Paragraph as="span" size="sm" tone="theme">
					{coverage}%
				</Paragraph>
				<Paragraph as="span" size="sm" tone="pewter">
					across {coveredCount} categor{coveredCount === 1 ? "y" : "ies"}
				</Paragraph>
				<span
					className={`text-pewter transition-transform ${open ? "rotate-180" : ""}`}
				>
					▾
				</span>
			</button>
			{open ? (
				<div className="absolute right-0 top-full z-20 mt-2 flex min-w-max flex-col gap-1.5 rounded-lg border border-zinc-700 bg-zinc-900 p-3">
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
				</div>
			) : null}
		</div>
	);
};

/** The persistent run HUD: one fixed-height strip of run-global stats above every screen. */
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
}: RunHudProps) => (
	<div
		className="flex items-center gap-6 border-b border-zinc-800 pb-3 text-sm font-black"
		{...(category ? categoryTheme(category) : {})}
	>
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
						Storage caps at 1 MB. Clear gates and answer correctly to earn KB —
						income beyond the cap is discarded.
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
		<div className="ml-auto shrink-0">
			<CoverageSummary
				coverage={coverage}
				coverageByCategory={coverageByCategory}
			/>
		</div>
	</div>
);
