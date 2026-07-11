type HeldSnippet = {
	id: string;
	name: string;
	description: string;
};

type SnippetBarProps = {
	/** Snippets currently held, in the order earned. */
	held: HeldSnippet[];
	/** Whether snippets can be spent on the current poll (false once answered). */
	canSpend: boolean;
	/** Spend the held snippet at this index on the current poll. */
	onSpend: (index: number) => void;
	/** Prototype-only: grant a snippet without gaining coverage first. */
	onDebugEarn: () => void;
	/** A short "you just earned X" message, or null. */
	earnMessage: string | null;
	/** Whether a try/catch is armed to catch a gate failure this window. */
	tryCatchArmed: boolean;
	/** Progress toward the next earned snippet. */
	progress: {
		/** Coverage % still needed to earn the next snippet. */
		toGo: number;
		/** Category nearest the next milestone, or null if no coverage yet. */
		label: string | null;
		/** 0–100 fill toward the next milestone. */
		pct: number;
	};
};

/**
 * Model A prototype surface: shows the snippets you've earned this run and lets
 * you spend one on the current poll. Purely presentational — earn/spend logic
 * lives in the daily-poll container.
 */
export const SnippetBar = ({
	held,
	canSpend,
	onSpend,
	onDebugEarn,
	earnMessage,
	tryCatchArmed,
	progress,
}: SnippetBarProps) => {
	return (
		<div className="flex flex-col gap-2 mb-4 p-3 rounded-lg border border-theme bg-black/20">
			<div className="flex items-center gap-3 flex-wrap">
				<span className="text-xs uppercase tracking-wider text-gray-400">
					Snippets
				</span>

				<div className="flex items-center gap-1.5 flex-wrap">
					{held.length === 0 ? (
						<span className="text-sm text-gray-500">none earned yet</span>
					) : (
						held.map((snippet, index) => (
							<button
								key={`${snippet.id}-${index}`}
								type="button"
								onClick={() => onSpend(index)}
								disabled={!canSpend}
								title={
									canSpend
										? `Spend: ${snippet.description}`
										: snippet.description
								}
								className="font-mono text-xs px-2 py-1 rounded border border-amber-500/60 text-amber-300 bg-amber-500/10 enabled:hover:bg-amber-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{snippet.name}
							</button>
						))
					)}
				</div>

				{tryCatchArmed && (
					<span className="font-mono text-xs px-2 py-1 rounded border border-emerald-500/60 text-emerald-300 bg-emerald-500/10">
						🛡 try/catch armed
					</span>
				)}

				<button
					type="button"
					onClick={onDebugEarn}
					title="Prototype only: grant a random snippet"
					className="ml-auto font-mono text-xs px-2 py-1.5 rounded border border-gray-600 text-gray-400 hover:bg-white/5"
				>
					Test: +1
				</button>
			</div>

			<div className="flex items-center gap-2">
				<div className="h-1.5 flex-1 rounded bg-white/10 overflow-hidden">
					<div
						className="h-full bg-amber-500/70"
						style={{ width: `${progress.pct}%` }}
					/>
				</div>
				<span className="text-xs font-mono text-gray-400 whitespace-nowrap">
					{progress.toGo.toFixed(1)}% to next snippet
					{progress.label ? ` (${progress.label})` : ""}
				</span>
			</div>

			<p className="text-xs text-gray-500">
				Earned every 25% coverage in a category — push one to 75%+ for its
				exclusive signature snippet. Click one to spend it on this poll.
			</p>

			{earnMessage && (
				<p className="text-xs text-amber-300" role="status">
					{earnMessage}
				</p>
			)}
		</div>
	);
};
