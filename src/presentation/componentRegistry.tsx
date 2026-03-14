import { useState, type ReactNode } from "react";

import { clsx } from "clsx";

import ConfigCard from "~/domains/configs/components/Cards";
import type { Config } from "~/domains/configs/models/config";
import { StorageBreakdown } from "~/domains/economy/components/StorageBreakdown";
import { CategoryCoverageGrid } from "~/domains/runs/components/CategoryCoverageGrid";
import { DEFAULT_GATE_PROGRESSION } from "~/domains/runs/data/defaultGateProgression";
import { createMockRunCategoryCoverage } from "~/domains/runs/models/runCategoryCoverage";
import { getCurrentGate } from "~/domains/runs/services/thresholdCalculator.service";
import type { GateDefinition } from "~/domains/runs/services/thresholdCalculator.service";
import { calculateLevelAndCoverage } from "~/domains/runs/utils/levelCalculations";
import { STORAGE_UNITS } from "~/lib/storage";
import { GameLoopExplainer } from "~/ui/GameLoopExplainer";

// Demo data for ConfigCards
const DEMO_CONFIGS: Config[] = [
	{
		id: ".js-config",
		name: ".js",
		image: "/configs/js",
		cost: STORAGE_UNITS.MB / 4,
		description:
			"+2% coverage on JavaScript polls. Boosts the probability of JS polls appearing.",
		rarity: "common",
		effect: ["streakAmp"],
		targetCategories: ["js"],
		priority: 100,
		coverageBonus: 2,
		categoryWeightBonus: 0.3,
	},
	{
		id: "tsconfig.json",
		name: "tsconfig.json",
		image: "/configs/tsconfig",
		cost: STORAGE_UNITS.MB,
		description:
			"+5% coverage bonus on TypeScript polls. Significantly boosts TS poll probability.",
		rarity: "uncommon",
		effect: ["streakAmp"],
		targetCategories: ["ts"],
		priority: 100,
		coverageBonus: 5,
		categoryWeightBonus: 0.5,
	},
	{
		id: "webpack.config.js",
		name: "webpack.config.js",
		image: "/configs/webpack",
		cost: STORAGE_UNITS.MB * 2,
		description:
			"+3% coverage bonus on ALL categories. The Swiss army knife of configs.",
		rarity: "rare",
		effect: ["globalBoost"],
		targetCategories: [],
		priority: 50,
		coverageBonus: 3,
		categoryWeightBonus: 0,
	},
	{
		id: "nx.json",
		name: "nx.json",
		image: "/configs/nx",
		cost: STORAGE_UNITS.MB * 4,
		description:
			"Monorepo mastery: +8% coverage on all categories, doubles streak bonuses.",
		rarity: "legendary",
		effect: ["globalBoost", "streakAmp"],
		targetCategories: [],
		priority: 10,
		coverageBonus: 8,
		categoryWeightBonus: 0,
	},
];

// Demo data for CategoryCoverageGrid using factory
const DEMO_COVERAGE = [
	createMockRunCategoryCoverage({
		id: 1,
		categoryCode: "js",
		currentCoverage: 72.5,
		currentStreak: 3,
		bestStreak: 5,
		pollsAnswered: 8,
	}),
	createMockRunCategoryCoverage({
		id: 2,
		categoryCode: "ts",
		currentCoverage: 45.0,
		currentStreak: 1,
		bestStreak: 3,
		pollsAnswered: 5,
	}),
	createMockRunCategoryCoverage({
		id: 3,
		categoryCode: "react",
		currentCoverage: 88.2,
		currentStreak: 6,
		bestStreak: 6,
		pollsAnswered: 10,
	}),
	createMockRunCategoryCoverage({
		id: 4,
		categoryCode: "css",
		currentCoverage: 33.0,
		currentStreak: 0,
		bestStreak: 2,
		pollsAnswered: 4,
	}),
	createMockRunCategoryCoverage({
		id: 5,
		categoryCode: "html",
		currentCoverage: 60.0,
		currentStreak: 2,
		bestStreak: 4,
		pollsAnswered: 6,
	}),
	createMockRunCategoryCoverage({
		id: 6,
		categoryCode: "git",
		currentCoverage: 55.5,
		currentStreak: 1,
		bestStreak: 3,
		pollsAnswered: 5,
	}),
];

// Demo component: Game Loop Explainer
const GameLoopDemo = () => (
	<div className="flex items-center justify-center h-full">
		<div className="w-full max-w-2xl">
			<GameLoopExplainer />
		</div>
	</div>
);

// Demo component: Config Cards showcase
const ConfigCardsDemo = () => (
	<div className="flex flex-col items-center justify-center h-full gap-6">
		<p className="text-gray-400 text-lg">
			Power-ups met verschillende rarities
		</p>
		<div className="flex flex-wrap gap-4 justify-center">
			{DEMO_CONFIGS.map((config) => (
				<ConfigCard key={config.id} config={config} />
			))}
		</div>
	</div>
);

// Demo component: Category Coverage Grid
const CoverageDemo = () => (
	<div
		className="flex items-center justify-center h-full"
		data-category-theme="react"
	>
		<div className="w-full max-w-2xl border border-gray-700 p-6">
			<CategoryCoverageGrid
				categoryCoverage={DEMO_COVERAGE}
				currentCategoryCode="react"
			/>
		</div>
	</div>
);

// Demo component: Storage Breakdown
const StorageDemo = () => (
	<div className="flex items-center justify-center h-full">
		<div className="w-full max-w-md border border-gray-700 p-6">
			<StorageBreakdown
				storageUsed={STORAGE_UNITS.MB * 3.5}
				storageLimit={STORAGE_UNITS.MB * 8}
				storageAvailable={STORAGE_UNITS.MB * 4.5}
				configsStorage={STORAGE_UNITS.MB * 2}
				rerollsStorage={STORAGE_UNITS.MB * 1}
				deinstallPenalty={STORAGE_UNITS.MB * 0.5}
			/>
		</div>
	</div>
);

// Combined demo showing multiple elements
const FullDemo = () => (
	<div className="grid grid-cols-2 gap-8 h-full p-4" data-category-theme="js">
		<div className="flex flex-col gap-4">
			<div className="border border-gray-700 p-4">
				<CategoryCoverageGrid
					categoryCoverage={DEMO_COVERAGE.slice(0, 4)}
					currentCategoryCode="js"
				/>
			</div>
			<div className="border border-gray-700 p-4">
				<StorageBreakdown
					storageUsed={STORAGE_UNITS.MB * 3.5}
					storageLimit={STORAGE_UNITS.MB * 8}
					storageAvailable={STORAGE_UNITS.MB * 4.5}
					configsStorage={STORAGE_UNITS.MB * 2}
					rerollsStorage={STORAGE_UNITS.MB * 1}
					deinstallPenalty={STORAGE_UNITS.MB * 0.5}
				/>
			</div>
		</div>
		<div className="flex flex-wrap gap-3 content-start">
			{DEMO_CONFIGS.map((config) => (
				<ConfigCard key={config.id} config={config} />
			))}
		</div>
	</div>
);

// Demo data for Leaderboard with real player names
type DemoLeaderboardEntry = {
	userId: string;
	displayName: string;
	photoUrl: string | null;
	role: string | null;
	challengeModeId: string | null;
	totalCoverage: number;
	pollsSeen: number;
	bestStreak: number;
	currentStreak: number;
	correctPolls: number;
};

const DEMO_LEADERBOARD_ENTRIES: DemoLeaderboardEntry[] = [
	{
		userId: "1",
		displayName: "Matthijs Groen",
		photoUrl: null,
		role: "poll-editor",
		challengeModeId: "vanilla",
		totalCoverage: 142.5,
		pollsSeen: 28,
		bestStreak: 8,
		currentStreak: 5,
		correctPolls: 22,
	},
	{
		userId: "2",
		displayName: "Piet de Vries",
		photoUrl: null,
		role: null,
		challengeModeId: "vanilla",
		totalCoverage: 118.3,
		pollsSeen: 24,
		bestStreak: 6,
		currentStreak: 3,
		correctPolls: 18,
	},
	{
		userId: "3",
		displayName: "Sander van Maurik",
		photoUrl: null,
		role: null,
		challengeModeId: "specialist",
		totalCoverage: 95.7,
		pollsSeen: 20,
		bestStreak: 5,
		currentStreak: 2,
		correctPolls: 15,
	},
	{
		userId: "4",
		displayName: "Tom Schoutens",
		photoUrl: null,
		role: null,
		challengeModeId: "vanilla",
		totalCoverage: 82.4,
		pollsSeen: 18,
		bestStreak: 4,
		currentStreak: 4,
		correctPolls: 13,
	},
	{
		userId: "5",
		displayName: "nickve28",
		photoUrl: null,
		role: null,
		challengeModeId: "generalist",
		totalCoverage: 67.2,
		pollsSeen: 15,
		bestStreak: 3,
		currentStreak: 1,
		correctPolls: 10,
	},
	{
		userId: "6",
		displayName: "Ruud Schroen",
		photoUrl: null,
		role: null,
		challengeModeId: "vanilla",
		totalCoverage: 45.8,
		pollsSeen: 12,
		bestStreak: 2,
		currentStreak: 0,
		correctPolls: 7,
	},
];

const getPlayerGateNumber = (pollsSeen: number): number =>
	getCurrentGate(pollsSeen, DEFAULT_GATE_PROGRESSION).gate;

// Demo component: Static Leaderboard with mock data
const LeaderboardDemo = () => (
	<div className="flex items-center justify-center h-full">
		<div className="w-full max-w-5xl">
			<header className="mb-6">
				<h2 className="text-3xl text-theme">Live Run Rankings</h2>
				<small className="text-gray-400">
					Sorted by total coverage across all categories
				</small>
			</header>
			<ol className="grid grid-cols-2 md:grid-cols-3 gap-4">
				{DEMO_LEADERBOARD_ENTRIES.map((entry, idx) => {
					const { displayCoverage, level } = calculateLevelAndCoverage(
						entry.totalCoverage
					);
					const isFirstPlace = idx === 0;

					return (
						<li
							key={entry.userId}
							className={clsx("border p-4", {
								"border-prismatic-first": isFirstPlace,
								"border-gray-600": !isFirstPlace,
							})}
						>
							<header className="flex gap-2 justify-between">
								<span className="text-xl">#{idx + 1}</span>
								<span className="text-sm text-gray-400">
									Gate {getPlayerGateNumber(entry.pollsSeen)}
								</span>
							</header>
							<section
								className={clsx("pb-1 border-b", {
									"border-b-prismatic": isFirstPlace,
									"border-gray-600": !isFirstPlace,
								})}
							>
								<h4
									className={clsx("text-xl leading-tight", {
										"prismatic-text": isFirstPlace,
										"text-white": !isFirstPlace,
									})}
								>
									{entry.displayName}
								</h4>
								{entry.role === "poll-editor" && (
									<small className="text-xs text-gray-500">poll-editor</small>
								)}
							</section>
							<section
								className={clsx("border-b py-2 flex justify-center", {
									"border-b-prismatic border-b-4": isFirstPlace,
									"border-gray-600": !isFirstPlace,
								})}
							>
								{level > 1 && (
									<span className="text-rose-500 mr-2">[L{level}]</span>
								)}
								<p className="text-xl flex gap-2 items-center">
									{displayCoverage}% <span className="text-sm">coverage</span>
								</p>
							</section>
							<section className="text-sm mt-2">
								<ul className="px-4 list-disc text-gray-300">
									<li>correct polls: {entry.correctPolls}</li>
									<li>best streak: {entry.bestStreak}</li>
									<li>current streak: {entry.currentStreak}</li>
								</ul>
							</section>
						</li>
					);
				})}
			</ol>
		</div>
	</div>
);

// Demo data for Daily Poll
const DEMO_POLL_QUESTION = "What does `Array.prototype.at(-1)` return?";
const DEMO_POLL_OPTIONS = [
	{ id: 1, option: "The first element of the array", correct: false },
	{ id: 2, option: "The last element of the array", correct: true },
	{ id: 3, option: "`undefined`", correct: false },
	{ id: 4, option: "Throws a `RangeError`", correct: false },
];

// Demo component: Daily Poll with radio buttons
const DailyPollDemo = () => {
	const [selectedOption, setSelectedOption] = useState<number | null>(null);

	return (
		<div className="flex items-center justify-center h-full">
			<div className="w-full max-w-2xl">
				<header className="mb-2">
					<span className="text-sm text-gray-500 font-mono">
						Poll #42 • JavaScript
					</span>
				</header>
				<h2 className="text-3xl md:text-4xl text-theme mb-8 font-display">
					{DEMO_POLL_QUESTION}
				</h2>
				<div className="space-y-3">
					{DEMO_POLL_OPTIONS.map((option) => {
						const isSelected = selectedOption === option.id;

						return (
							<label
								key={option.id}
								className={clsx(
									"flex items-center gap-4 p-4 border cursor-pointer transition-colors",
									{
										"border-theme bg-theme/10": isSelected,
										"border-gray-600 hover:border-gray-400": !isSelected,
									}
								)}
							>
								<input
									type="radio"
									name="poll-option"
									value={option.id}
									checked={isSelected}
									onChange={() => setSelectedOption(option.id)}
									className="w-5 h-5 accent-theme"
								/>
								<span
									className={clsx("text-lg", {
										"text-theme": isSelected,
										"text-white": !isSelected,
									})}
								>
									{option.option}
								</span>
							</label>
						);
					})}
				</div>
				<footer className="mt-6 flex justify-between items-center">
					<span className="text-sm text-gray-500">
						{selectedOption
							? "Klik op 'Bevestig' om je antwoord in te dienen"
							: "Selecteer een antwoord"}
					</span>
					<button
						disabled={!selectedOption}
						className={clsx(
							"px-6 py-2 font-bold transition-colors",
							selectedOption
								? "bg-theme text-black hover:bg-theme/80"
								: "bg-gray-700 text-gray-500 cursor-not-allowed"
						)}
					>
						Bevestig
					</button>
				</footer>
			</div>
		</div>
	);
};

// Demo data for CI Gates - showing progression from easy to hard
const DEMO_CI_GATES: GateDefinition[] = DEFAULT_GATE_PROGRESSION.slice(0, 6);

// Helper to format gate requirements
const formatRequirement = (
	threshold: number,
	requiredCategories: number
): string => {
	if (requiredCategories === 1) {
		return `${threshold}% in 1 category`;
	}
	return `${threshold}% in ${requiredCategories} categories`;
};

// Demo component: CI Gates progression
const CIGatesDemo = () => (
	<div className="flex items-center justify-center h-full">
		<div className="w-full max-w-5xl">
			<header className="mb-6 text-center">
				<h2 className="text-3xl text-theme">
					CI Gates: Progressive Difficulty
				</h2>
				<small className="text-gray-400">
					Elke 5 polls moet je een gate halen om door te gaan
				</small>
			</header>
			<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
				{DEMO_CI_GATES.map((gate) => (
					<div
						key={gate.gate}
						className={clsx("border p-4", {
							"border-green-500": gate.gate <= 2,
							"border-yellow-500": gate.gate > 2 && gate.gate <= 4,
							"border-red-500": gate.gate > 4,
						})}
					>
						<header className="flex justify-between items-center mb-2">
							<span className="text-2xl font-bold text-theme">
								Gate #{gate.gate}
							</span>
							<span
								className={clsx("text-xs px-2 py-1 rounded", {
									"bg-blue-900 text-blue-300": gate.evaluationMode === "OR",
									"bg-purple-900 text-purple-300":
										gate.evaluationMode === "AND",
								})}
							>
								{gate.evaluationMode === "OR" ? "Keuze" : "Allemaal"}
							</span>
						</header>
						<div className="text-sm text-gray-300">
							<p className="text-xs text-gray-500 mb-2">
								Na {gate.gate * gate.pollsPerGate} polls
							</p>
							<ul className="space-y-1">
								{gate.requirements.map((req, idx) => (
									<li
										key={idx}
										className={clsx("flex items-center gap-2", {
											"before:content-['•']": gate.evaluationMode === "AND",
											"before:content-['○']": gate.evaluationMode === "OR",
										})}
									>
										<span>
											{formatRequirement(req.threshold, req.requiredCategories)}
										</span>
									</li>
								))}
							</ul>
							{gate.evaluationMode === "OR" && gate.requirements.length > 1 && (
								<p className="text-xs text-blue-400 mt-2 italic">
									Kies één van bovenstaande opties
								</p>
							)}
							{gate.evaluationMode === "AND" &&
								gate.requirements.length > 1 && (
									<p className="text-xs text-purple-400 mt-2 italic">
										Alle requirements moeten gehaald worden
									</p>
								)}
						</div>
					</div>
				))}
			</div>
			<footer className="mt-6 text-center text-sm text-gray-500">
				<p>
					Early gates: flexibel (OR) | Late gates: strenger (AND) | Totaal: 11
					gates over ~55 polls
				</p>
			</footer>
		</div>
	</div>
);

/**
 * Registry of interactive components that can be embedded in slides.
 *
 * Usage in slides.ts:
 * {
 *   id: "demo-slide",
 *   type: "component",
 *   title: "Live Demo",
 *   componentId: "game-loop",
 *   accentColor: "cerulean",
 * }
 */
export const COMPONENT_REGISTRY: Record<string, () => ReactNode> = {
	"game-loop": () => <GameLoopDemo />,
	"daily-poll": () => <DailyPollDemo />,
	"config-cards": () => <ConfigCardsDemo />,
	"ci-gates": () => <CIGatesDemo />,
	leaderboard: () => <LeaderboardDemo />,
	coverage: () => <CoverageDemo />,
	storage: () => <StorageDemo />,
	"full-demo": () => <FullDemo />,
};

export const getComponent = (componentId: string): (() => ReactNode) | null => {
	return COMPONENT_REGISTRY[componentId] ?? null;
};
