import type { Config } from "~/modules/run/config/domain/config.model";

/**
 * Configs are pure enhancements (ADR-035): every entry is an effect with a
 * price, and nothing here demands anything of the player. The gate's friction
 * lives on the gate itself — its coverage demand and its audits.
 */
export const CONFIGS = {
	js: {
		id: "js",
		label: ".js",
		family: "focus",
		description: "JS polls pay 1.25× coverage.",
		rewardMultiplier: 1,
		focusCategory: "js",
	},
	ts: {
		id: "ts",
		label: ".ts",
		family: "focus",
		description: "TS polls pay 1.25× coverage.",
		rewardMultiplier: 1,
		focusCategory: "ts",
	},
	css: {
		id: "css",
		label: ".css",
		family: "focus",
		description: "CSS polls pay 1.25× coverage.",
		rewardMultiplier: 1,
		focusCategory: "css",
	},
	jsx: {
		id: "jsx",
		label: ".jsx",
		family: "focus",
		description: "React polls pay 1.25× coverage.",
		rewardMultiplier: 1,
		focusCategory: "react",
	},
	git: {
		id: "git",
		label: ".git",
		family: "focus",
		description: "Git polls pay 1.25× coverage.",
		rewardMultiplier: 1,
		focusCategory: "git",
	},
	rb: {
		id: "rb",
		label: ".rb",
		family: "focus",
		description: "Ruby polls pay 1.25× coverage.",
		rewardMultiplier: 1,
		focusCategory: "ruby",
	},
	html: {
		id: "html",
		label: ".html",
		family: "focus",
		description: "HTML polls pay 1.25× coverage.",
		rewardMultiplier: 1,
		focusCategory: "html",
	},
	java: {
		id: "java",
		label: ".java",
		family: "focus",
		description: "Java polls pay 1.25× coverage.",
		rewardMultiplier: 1,
		focusCategory: "java",
	},
	py: {
		id: "py",
		label: ".py",
		family: "focus",
		description: "Python polls pay 1.25× coverage.",
		rewardMultiplier: 1,
		focusCategory: "python",
	},
	frontend: {
		id: "package.json-config",
		label: "package.json",
		family: "focus",
		description: "General Frontend polls pay 1.25× coverage.",
		rewardMultiplier: 1,
		focusCategory: "general-frontend",
	},
	vue: {
		id: ".vue",
		label: ".vue",
		family: "focus",
		description: "Vue polls pay 1.25× coverage.",
		rewardMultiplier: 1,
		focusCategory: "vue",
	},

	unitTests: {
		id: "unit-tests",
		label: "Unit Tests",
		family: "economy",
		description: "+32KB storage on gate clear.",
		rewardMultiplier: 1,
		storageOnClear: 32,
	},
	eslint: {
		id: "eslint",
		label: "ESLint",
		family: "defense",
		description:
			"Cross out a wrong answer on JS/TS polls for an escalating fee.",
		gives: "Cross out a wrong answer on JS/TS polls",
		costs: "The fee doubles each use",
		rewardMultiplier: 1,
		eliminatesWrongOptionsFor: ["js", "ts"],
	},
	stylelint: {
		id: "stylelint",
		label: "Stylelint",
		family: "defense",
		description: "Cross out a wrong answer on CSS polls for an escalating fee.",
		gives: "Cross out a wrong answer on CSS polls",
		costs: "The fee doubles each use",
		rewardMultiplier: 1,
		eliminatesWrongOptionsFor: ["css"],
	},
	intellisense: {
		id: "intellisense",
		label: "Intellisense",
		family: "economy",
		rarity: "rare",
		description: "All coverage earns ×1.5.",
		gives: "All coverage earns ×1.5",
		rewardMultiplier: 1,
		coverageMultiplier: 1.5,
	},
	// Vendor-neutral on purpose: the roster names tools and files, and there is
	// more than one AI assistant. AGENTS.md is the cross-vendor standard, so it
	// names the help without naming a vendor.
	agentsMd: {
		id: "agents-md",
		label: "AGENTS.md",
		family: "amplify",
		rarity: "legendary",
		description: "All coverage earns ×2.",
		gives: "All coverage earns ×2",
		rewardMultiplier: 1,
		coverageMultiplier: 2,
	},
	codeCoverage: {
		id: "code-coverage",
		label: "Code Coverage",
		family: "amplify",
		rarity: "uncommon",
		description: "+0.5% flat coverage per correct answer.",
		gives: "Every correct answer adds +0.5% coverage",
		rewardMultiplier: 1,
		coverageAdd: 0.5,
	},
	indexedDb: {
		id: "indexed-db",
		label: "IndexedDB",
		family: "economy",
		rarity: "uncommon",
		description: "+8KB storage per correct answer (up to 320KB a run).",
		gives: "+8KB per correct answer, up to 320KB a run",
		rewardMultiplier: 1,
		storagePerCorrect: 8,
	},
	coverageGain: {
		id: "coverage-gain",
		label: "Coverage",
		family: "amplify",
		rarity: "uncommon",
		description: "Coverage gains earn ×2.",
		gives: "Coverage gains earn ×2",
		rewardMultiplier: 1,
		coverageMultiplier: 2,
	},
	// Cheap and nearly free at L1 on purpose: interest is only worth anything
	// once the balance is large, and the balance is large only late, so the
	// config ramps with the economy instead of gating on it. 2% per level, so
	// L5 is 10% — a late-game engine you paid for in instalments.
	mooresLaw: {
		id: "moores-law",
		label: "Moore's Law",
		family: "economy",
		description: "+2% of held storage on gate clear.",
		gives: "Every gate clear pays +2% of held storage",
		rewardMultiplier: 1,
		storageInterestPct: 2,
	},
	// Two levels, and the second one sells honesty rather than power. L1 hands
	// over the percentages with nothing attached, so 100% of two players and 100%
	// of a hundred are the same picture — the config can talk you into a wrong
	// answer, and that risk is what the 64KB buys. L2 adds the sample size, which
	// is the only thing that tells those two apart. Hence `maxLevel: 2`: there is
	// no third thing to reveal that is not just the answer.
	telemetry: {
		id: "telemetry",
		label: "Telemetry",
		family: "defense",
		rarity: "uncommon",
		maxLevel: 2,
		description:
			"Pay a doubling fee to see how the community answered this poll.",
		gives: "See how the community answered this poll",
		costs: "The fee doubles each use, and resets each gate",
		rewardMultiplier: 1,
		peeksCommunitySplit: true,
	},
	// The reward axis here is deliberately not a coverage multiplier: four configs
	// already sell coverage magnitude, and a fifth would be a reskin. This one pays
	// in KB, scaled by how many extra picks the window demanded — most in exactly
	// the windows with the most multi-answer polls, nothing in a window of five
	// single-answer polls. That dead spot is visible on the row, not hidden.
	length: {
		id: "length",
		label: ".length",
		family: "economy",
		rarity: "uncommon",
		description:
			"Shows how many correct answers this gate holds, and pays +16KB per answer beyond one per poll.",
		gives: "+16KB per correct answer beyond one per poll",
		rewardMultiplier: 1,
		storagePerExtraPick: 16,
	},
	coldStart: {
		id: "cold-start",
		label: "Cold Start",
		family: "amplify",
		rarity: "uncommon",
		description: "Each gate's first answer earns ×2 coverage.",
		gives: "The gate's first answer earns ×2 coverage",
		rewardMultiplier: 1,
		openerCoverageMultiplier: 2,
	},
	// The one config named after a company, and on purpose: the emissions
	// defeat device is what the mechanic *is*, and "Volkswagen CI" is already
	// the name developers use for a pipeline that is green by fraud. It reads
	// the gate's audits rather than the window (ADR-028, repurposed by ADR-035).
	volkswagenCi: {
		id: "volkswagen-ci",
		label: "Volkswagen CI",
		family: "risk",
		rarity: "legendary",
		// 256 (legendary) + 128: it does nothing at a clean gate, so the price
		// and the slot are the whole cost.
		draftCost: 384,
		description:
			"Reports the gate's first audit as passing — the auditor reads whatever the device wants it to read.",
		gives: "The gate's first audit reports passing",
		rewardMultiplier: 1,
		suppressesAudit: true,
	},
	// The reward is a level — an axis nothing else pays in (the roster's other
	// payouts are coverage, KB, and information). The roll is seeded like the
	// audits' offline picks, and the unpredictability is the identity: an
	// auto-merged version bump you never reviewed and cannot decline. Two
	// levels only, because the odds are the whole product and 1-in-2 is as
	// short as they can get before the merge is the rule rather than the event.
	// A ×3 with a lifespan: the deprecated API still works, just worse every
	// release, until the release that removes it. It out-multiplies AGENTS.md's
	// permanent ×2 (256KB) yet drafts uncommon (64KB), because it dies in four
	// gates — 3, 2.5, 2, 1.5, deleted. The live decision is the exit: ride it
	// to deletion, or sell the fading half back at 32KB while a fresh draft
	// can still replace it.
	deprecated: {
		id: "deprecated",
		label: "Deprecated",
		family: "amplify",
		rarity: "uncommon",
		description:
			"All coverage earns ×3, fading ×0.5 each gate clear. Deleted at ×1.",
		gives: "All coverage earns ×3, fading ×0.5 per clear",
		costs: "Deleted when it fades to ×1",
		rewardMultiplier: 1,
		coverageMultiplier: 3,
		coverageDecayPerClear: 0.5,
	},
	dependabot: {
		id: "dependabot",
		label: "Dependabot",
		family: "economy",
		rarity: "legendary",
		maxLevel: 2,
		description:
			"1 in 3 gate clears: a random config in your pipeline upgrades, free.",
		gives: "A free random config upgrade on 1 in 3 gate clears",
		rewardMultiplier: 1,
		autoUpgradeOneIn: 3,
	},
} as const satisfies Record<string, Config>;

export const CONFIG_LIST: readonly Config[] = Object.values(CONFIGS);
