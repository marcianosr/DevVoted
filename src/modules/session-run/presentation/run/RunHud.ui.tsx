import { useState } from "react";
import { getCategories } from "~/domains/shared/categories";
import { categoryTheme } from "~/ui/theme/categoryTheme";

type RunHudProps = {
	storage: number;
	gateNumber: number;
	victoryGate: number;
	pollsToGate: number;
	coverage: number;
	coverageByCategory: Readonly<Record<string, number>>;
};

const CoverageSummary = ({
	coverage,
	coverageByCategory,
}: Pick<RunHudProps, "coverage" | "coverageByCategory">) => {
	const [open, setOpen] = useState(false);
	const covered = getCategories()
		.map(({ code, name }) => ({
			code,
			name,
			pct: coverageByCategory[code] ?? 0,
		}))
		.filter(({ pct }) => pct > 0);

	if (covered.length === 0)
		return (
			<span className="flex items-baseline gap-1.5">
				<span className="text-pewter">Coverage</span>
				<span className="font-bold text-white">{coverage}%</span>
			</span>
		);

	return (
		<div className="relative">
			<button
				type="button"
				onClick={() => setOpen((isOpen) => !isOpen)}
				className="flex cursor-pointer items-center gap-1.5"
			>
				<span className="text-pewter">Coverage</span>
				<span className="font-bold text-white">{coverage}%</span>
				<span className="text-pewter">
					across {covered.length} categor{covered.length === 1 ? "y" : "ies"}
				</span>
				<span
					className={`text-pewter transition-transform ${open ? "rotate-180" : ""}`}
				>
					▾
				</span>
			</button>
			{open ? (
				<div className="absolute right-0 top-full z-20 mt-2 flex min-w-max flex-col gap-1.5 rounded-lg border border-zinc-700 bg-zinc-900 p-3">
					{covered.map(({ code, name, pct }) => (
						<span
							key={code}
							{...categoryTheme(code)}
							className="flex items-center gap-3"
						>
							<span className="inline-block h-3 w-3 rounded bg-theme" />
							<span className="font-bold text-theme">{name}</span>
							<span className="ml-auto text-zinc-400">{pct}%</span>
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
	pollsToGate,
	coverage,
	coverageByCategory,
}: RunHudProps) => (
	<div className="flex items-center gap-6 border-b border-zinc-800 pb-3 text-sm">
		<span className="flex shrink-0 items-baseline gap-1.5">
			<span className="text-pewter">Storage</span>
			<span className="font-bold text-cerulean">{storage}KB</span>
		</span>
		<span className="flex shrink-0 items-baseline gap-1.5">
			<span className="text-pewter">Gate</span>
			<span className="font-bold text-cerulean">
				{gateNumber} / {victoryGate}
			</span>
		</span>
		<span className="flex shrink-0 items-baseline gap-1.5">
			<span className="font-bold text-cerulean">{pollsToGate}</span>
			<span className="text-pewter">polls to clear</span>
		</span>
		<div className="ml-auto shrink-0">
			<CoverageSummary
				coverage={coverage}
				coverageByCategory={coverageByCategory}
			/>
		</div>
	</div>
);
