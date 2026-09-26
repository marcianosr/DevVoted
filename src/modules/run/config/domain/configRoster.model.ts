import { AB_ARMS, type Config } from "~/modules/run/config/domain/config.model";

export const CONFIGS = {
	js: {
		id: "js",
		label: ".js",
		description: "JavaScript polls pay 1.25× coverage.",
		focusCategory: "js",
	},
	ts: {
		id: "ts",
		label: ".ts",
		description: "TypeScript polls pay 1.25× coverage.",
		focusCategory: "ts",
	},
	css: {
		id: "css",
		label: ".css",
		description: "CSS polls pay 1.25× coverage.",
		focusCategory: "css",
	},
	jsx: {
		id: "jsx",
		label: ".jsx",
		description: "React polls pay 1.25× coverage.",
		focusCategory: "react",
	},
	git: {
		id: "git",
		label: ".git",
		description: "Git polls pay 1.25× coverage.",
		focusCategory: "git",
	},
	rb: {
		id: "rb",
		label: ".rb",
		description: "Ruby polls pay 1.25× coverage.",
		focusCategory: "ruby",
	},
	html: {
		id: "html",
		label: ".html",
		description: "HTML polls pay 1.25× coverage.",
		focusCategory: "html",
	},
	java: {
		id: "java",
		label: ".java",
		description: "Java polls pay 1.25× coverage.",
		focusCategory: "java",
	},
	py: {
		id: "py",
		label: ".py",
		description: "Python polls pay 1.25× coverage.",
		focusCategory: "python",
	},
	frontend: {
		id: "package.json-config",
		label: "package.json",
		description: "General Frontend polls pay 1.25× coverage.",
		focusCategory: "general-frontend",
	},
	vue: {
		id: ".vue",
		label: ".vue",
		description: "Vue polls pay 1.25× coverage.",
		focusCategory: "vue",
	},

	unitTests: {
		id: "unit-tests",
		label: "Build Artifacts",
		description: "+32KB storage on gate clear.",
		storageOnClear: 32,
	},
	eslint: {
		id: "eslint",
		label: "ESLint",
		description:
			"Cross out a wrong answer on JavaScript / TypeScript polls for an escalating fee.",
		gives: "Cross out a wrong answer on JavaScript / TypeScript polls",
		costs: "The fee doubles each use, and resets each gate",
		eliminatesWrongOptionsFor: ["js", "ts"],
	},
	stylelint: {
		id: "stylelint",
		label: "Stylelint",
		description: "Cross out a wrong answer on CSS polls for an escalating fee.",
		gives: "Cross out a wrong answer on CSS polls",
		costs: "The fee doubles each use, and resets each gate",
		eliminatesWrongOptionsFor: ["css"],
	},
	intellisense: {
		id: "intellisense",
		label: "Intellisense",
		slots: 4,
		description: "All coverage earns ×1.5.",
		gives: "All coverage earns ×1.5",
		coverageMultiplier: 1.5,
	},
	agentsMd: {
		id: "agents-md",
		label: "AGENTS.md",
		slots: 8,
		description: "All coverage earns ×2.",
		gives: "All coverage earns ×2",
		coverageMultiplier: 2,
	},
	codeCoverage: {
		id: "code-coverage",
		label: "Code Coverage",
		slots: 2,
		description: "Every correct answer is worth 10% more coverage.",
		gives: "Correct answers pay +10% coverage",
		coverageAdd: 0.1,
	},
	indexedDb: {
		id: "indexed-db",
		label: "IndexedDB",
		slots: 2,
		description: "+8KB storage per correct answer (up to 320KB a run).",
		gives: "+8KB per correct answer, up to 320KB a run",
		storagePerCorrect: 8,
	},
	database: {
		id: "database",
		label: "Database",
		slots: 2,
		description:
			"Each exact answer opens an 8KB transaction. Clearing the gate commits it at ×2; a gate that holds or ends the run rolls it back. Shares IndexedDB's 320KB run cap.",
		gives: "+16KB per exact answer, paid when the gate clears",
		costs: "A gate that does not clear rolls back every KB it was holding",
		escrowPerCorrect: 8,
	},
	andAnd: {
		id: "and-and",
		label: "&&",
		slots: 4,
		description:
			"Correct answers chain. The first link pays 1KB and every link after it pays double the last; any wrong answer sends the chain back to the start. Shares IndexedDB's 320KB run cap.",
		gives:
			"+1KB on the first correct answer, doubling with every link after it",
		costs: "One wrong answer sends the chain back to its first link",
		chainStartKb: 1,
	},
	yagni: {
		id: "yagni",
		label: "YAGNI",
		description:
			"Every slot your build leaves empty takes 8KB off the build space bill at each gate clear.",
		gives: "-8KB a gate for every empty slot in the build",
		costs: "It fills a slot itself, so it can push the build into a wider rung",
		emptySlotDiscountKb: 8,
	},
	mooresLaw: {
		id: "moores-law",
		label: "Moore's Law",
		description: "+2% of held storage on gate clear.",
		gives: "Every gate clear pays +2% of held storage",
		storageInterestPct: 2,
	},
	telemetry: {
		id: "telemetry",
		label: "Telemetry",
		slots: 2,
		maxLevel: 2,
		description:
			"Pay a doubling fee to see how the community answered this poll.",
		gives: "See how the community answered this poll",
		costs: "The fee doubles each use, and resets each gate",
		peeksCommunitySplit: true,
	},
	length: {
		id: "length",
		label: ".length",
		slots: 2,
		description: "Shows how many correct answers this gate holds.",
		gives: "The count of correct answers waiting in this gate",
		revealsCorrectCount: true,
	},
	abTest: {
		id: "ab-test",
		label: "A/B Test",
		slots: 2,
		description: AB_ARMS.coverage.description,
		gives: AB_ARMS.coverage.gives,
		costs: "Only one arm ships at a time — switch in the shop, free",
		abArm: "coverage",
		coverageMultiplier: AB_ARMS.coverage.coverageMultiplier,
	},
	yarnLock: {
		id: "yarn-lock",
		label: ".lock",
		slots: 1,
		description:
			"Lock a shop offer for 16KB — every reroll and every next shop keeps it until you install or release it.",
		gives: "Lock shop offers so rerolls and later shops keep them",
		costs: "16KB a lock — every lock releases if .lock leaves the build",
		locksOffers: true,
	},
	cache: {
		id: "cache",
		label: "Cache",
		slots: 4,
		description:
			"Correct answers cache their category — each cached hit pays +0.25 units of coverage there, up to +1. A wrong answer flushes that category.",
		gives: "+0.25 units per cached hit in a category, up to +1",
		costs: "A wrong answer flushes that category's cache",
		cacheHitStep: 0.25,
	},
	regressionTest: {
		id: "regression-test",
		label: "Regression Test",
		slots: 2,
		description:
			"A poll you have answered wrong before pays ×2 coverage. Getting it right retires the test.",
		gives: "Polls you have previously missed pay ×2 coverage",
		costs: "The set shrinks as you learn — a poll pays once and never again",
		missedPollMultiplier: 2,
	},
	coldStart: {
		id: "cold-start",
		label: "Cold Start",
		slots: 2,
		description:
			"The gate's first answer earns nothing. Every answer after it earns ×1.5.",
		gives: "Every answer after the gate's first earns ×1.5",
		costs: "The gate's opening answer pays no coverage",
		openerCoverageMultiplier: 0,
		throttleCoverageMultiplier: 1.5,
	},
	volkswagenCi: {
		id: "volkswagen-ci",
		label: "Volkswagen CI",
		slots: 8,
		draftCost: 384,
		description:
			"Reports the gate's first audit as passing — the auditor reads whatever the device wants it to read.",
		gives: "The gate's first audit reports passing",
		suppressesAudit: true,
	},
	prefetch: {
		id: "prefetch",
		label: "Prefetch",
		slots: 4,
		description:
			"Shows the category and option count of every poll left this gate and how many of them take more than one answer, plus all of the next gate's categories.",
		gives:
			"The categories, option counts and answer types of this gate's remaining polls, and the next gate's categories",
		revealsUpcomingCategories: true,
	},
	gitRebase: {
		id: "git-rebase",
		label: "git rebase -i",
		slots: 4,
		maxLevel: 2,
		description:
			"Before a gate starts, lists its polls by category and lets you reorder them. v2 names which of them take more than one answer. The order locks the moment you answer.",
		gives: "Reorder the gate's polls before it starts, with answer types at v2",
		costs:
			"The order locks when you answer — you commit before you read a question",
		reordersGatePolls: true,
	},
	wtfpl: {
		id: "wtfpl",
		label: "WTFPL",
		slots: 8,
		draftCost: 512,
		description:
			"Every shop offers the entire roster. No warranty: while installed, nothing sells back for anything.",
		gives: "Every shop offers the entire roster",
		costs: "No warranty — every config sells for 0KB while it's installed",
		offersFullRoster: true,
	},
	freemium: {
		id: "freemium",
		label: "Freemium",
		slots: 8,
		draftCost: 0,
		description:
			"Free to install. Every config drafts at half price, and each gate you clear bills you double the last.",
		gives: "Every config drafts at half price",
		costs:
			"Bills 8KB at your first clear, doubling every gate — it lapses when you cannot pay",
		draftCostFactor: 0.5,
		subscriptionKb: 8,
		subscriptionGrowthPerGate: 2,
	},
	deprecated: {
		id: "deprecated",
		label: "Deprecated",
		slots: 4,
		description:
			"All coverage earns ×3, fading ×0.5 each gate clear. Deleted at ×1.",
		gives: "All coverage earns ×3, fading ×0.5 per clear",
		costs: "Deleted when it fades to ×1",
		coverageMultiplier: 3,
		coverageDecayPerClear: 0.5,
	},
	overclock: {
		id: "overclock",
		label: "Overclock",
		slots: 4,
		description:
			"The gate's first answer earns ×4 coverage. Everything after runs hot: ×0.5. The ×4 returns at the next gate.",
		gives: "The gate's first answer earns ×4 coverage",
		costs: "Every later answer runs hot at ×0.5 until the gate clears",
		openerCoverageMultiplier: 4,
		throttleCoverageMultiplier: 0.5,
	},
	dependabot: {
		id: "dependabot",
		label: "Dependabot",
		slots: 8,
		maxLevel: 2,
		description:
			"5 correct answers in a row upgrade a random config in your build, free. A wrong answer or a failed gate starts the count over.",
		gives: "A free random config upgrade every 5 correct answers in a row",
		autoUpgradeAfterCorrect: 5,
	},
	garbageCollection: {
		id: "garbage-collection",
		label: "Garbage Collection",
		slots: 2,
		description: "Every config you drop to pay a peel refunds its sell value.",
		gives: "Peeled configs refund their sell value",
		costs: "Only a drop pays — minifying to fit the peel refunds nothing",
		refundsPeeledConfigs: true,
	},
	planningPoker: {
		id: "planning-poker",
		label: "Planning Poker",
		slots: 1,
		description:
			"On the prep screen before every gate, bet on how many of its 5 polls you will answer correctly. Answer at least that many and it pays coverage — a bolder bet pays more, and so does a deeper gate. The gate will not open until you have bet, and no bet can cost you anything.",
		gives: "Coverage when you answer at least as many as you bet",
		costs:
			"Fall one short and it pays nothing — and the gate holds in prep until you bet, which locks when you answer",
		coveragePerEstimate: 0.25,
	},
	strict: {
		id: "strict",
		label: "strict: true",
		slots: 1,
		description:
			"Toggle it before you answer. An exact answer pays half a unit more; anything less takes half a unit off the gate.",
		gives: "+0.5 units on an exact answer",
		costs: "0.5 units on a partial, a miss or a timeout",
		wagersAnswer: 0.5,
	},
	prettierrc: {
		id: "prettierrc",
		label: "Math.ceil()",
		slots: 2,
		description:
			"A partial select-all answer earns the fraction it needs to reach a whole unit: a quarter caught pays 1, three quarters pays 2. The top-up is flat, so no multiplier amplifies it.",
		gives: "Partial select-all answers top up to a whole unit",
		roundsPartialUnitsUp: true,
	},
	sla: {
		id: "sla",
		label: "SLA",
		slots: 2,
		description:
			"On the prep screen before every gate, name OK, HEALTHY or PERFECT. Close in that band or better and the gate's payout rises 10%, 25% or 50%. Fall short of your own promise and it pays nothing. The gate will not open until you have promised, and no promise can cost you anything.",
		gives: "The band you promise pays +10%, +25% or +50% on the clear",
		costs:
			"A band you promise and miss pays nothing at all — and the gate holds in prep until you name one",
		commitsBand: true,
	},
	tryCatch: {
		id: "try-catch",
		label: "Try/Catch",
		slots: 4,
		description:
			"A gate that would end the run holds instead, owing its peel. The catch is spent doing it and deletes itself, paying its own weight into that peel.",
		gives: "The gate that would end your run holds instead",
		costs: "Deleted the moment it fires, and it only fires once",
		catchesFatal: true,
	},
	vendorLockIn: {
		id: "vendor-lock-in",
		label: "vendor lock-in",
		slots: 4,
		description:
			"Names one config in your build as your vendor. Its weight stops counting against the space you rent, and you cannot sell or drop it for the rest of the run.",
		gives: "One config stops counting against your build space",
		costs: "That config cannot be sold or dropped for the rest of the run",
		vendorLocks: true,
	},
	dryRun: {
		id: "dry-run",
		label: "Dry Run",
		slots: 2,
		description:
			"Marks the gate meter with where this answer lands, right or wrong, before you submit it.",
		gives: "The gate meter shows where a right and a wrong answer land",
		projectsGateOutcome: true,
	},
} as const satisfies Record<string, Config>;

export const CONFIG_LIST: readonly Config[] = Object.values(CONFIGS);

export const readsMissedHistory = (
	configs: readonly { readonly id: string }[]
): boolean =>
	configs.some((config) =>
		CONFIG_LIST.some(
			(entry) =>
				entry.id === config.id && entry.missedPollMultiplier !== undefined
		)
	);
