import type { CategoryCode } from "~/shared/lib/categories";

import type {
	CheckKind,
	Config,
} from "~/modules/run/config/domain/config.model";

/**
 * Every config owes the gate something (ADR-022), by one of three routes: an
 * authored `check`, a `focusCategory`, or the categories it lints. Enforced
 * here rather than on `Config` because the roster is the only place configs are
 * authored, and because a partial `Config` is legitimate elsewhere (the
 * configure screen prices previewed loadouts).
 *
 * A config with none of them contributes no checklist row at all, which made a
 * build carrying it pass gates vacuously on 0/5. AGENTS.md was that config;
 * the type is here so the next one cannot be. The linter route is a non-empty
 * tuple on purpose: an empty category list would satisfy the type and still owe
 * nothing, which is the exact hole this guards.
 */
type RosterConfig = Config &
	(
		| { readonly check: CheckKind }
		| { readonly focusCategory: CategoryCode }
		| {
				readonly eliminatesWrongOptionsFor: readonly [
					CategoryCode,
					...CategoryCode[],
				];
		  }
	);

export const CONFIGS = {
	js: {
		id: "js",
		label: ".js",
		family: "focus",
		description:
			"JS polls pay 1.25× — but if JS shows, you must get one right.",
		requirementDelta: 0,
		rewardMultiplier: 1,
		focusCategory: "js",
	},
	ts: {
		id: "ts",
		label: ".ts",
		family: "focus",
		description:
			"TS polls pay 1.25× — but if TypeScript shows, you must get one right.",
		requirementDelta: 0,
		rewardMultiplier: 1,
		focusCategory: "ts",
	},
	css: {
		id: "css",
		label: ".css",
		family: "focus",
		description:
			"CSS polls pay 1.25× — but if CSS shows, you must get one right.",
		requirementDelta: 0,
		rewardMultiplier: 1,
		focusCategory: "css",
	},
	jsx: {
		id: "jsx",
		label: ".jsx",
		family: "focus",
		description:
			"React polls pay 1.25× — but if React shows, you must get one right.",
		requirementDelta: 0,
		rewardMultiplier: 1,
		focusCategory: "react",
	},
	git: {
		id: "git",
		label: ".git",
		family: "focus",
		description:
			"Git polls pay 1.25× — but if Git shows, you must get one right.",
		requirementDelta: 0,
		rewardMultiplier: 1,
		focusCategory: "git",
	},
	rb: {
		id: "rb",
		label: ".rb",
		family: "focus",
		description:
			"Ruby polls pay 1.25× — but if Ruby shows, you must get one right.",
		requirementDelta: 0,
		rewardMultiplier: 1,
		focusCategory: "ruby",
	},
	html: {
		id: "html",
		label: ".html",
		family: "focus",
		description:
			"HTML polls pay 1.25× — but if HTML shows, you must get one right.",
		requirementDelta: 0,
		rewardMultiplier: 1,
		focusCategory: "html",
	},
	java: {
		id: "java",
		label: ".java",
		family: "focus",
		description:
			"Java polls pay 1.25× — but if Java shows, you must get one right.",
		requirementDelta: 0,
		rewardMultiplier: 1,
		focusCategory: "java",
	},
	py: {
		id: "py",
		label: ".py",
		family: "focus",
		description:
			"Python polls pay 1.25× — but if Python shows, you must get one right.",
		requirementDelta: 0,
		rewardMultiplier: 1,
		focusCategory: "python",
	},
	frontend: {
		id: "package.json-config",
		label: "package.json",
		family: "focus",
		description:
			"General Frontend polls pay 1.25× — but if General Frontend shows, you must get one right.",
		requirementDelta: 0,
		rewardMultiplier: 1,
		focusCategory: "general-frontend",
	},
	vue: {
		id: ".vue",
		label: ".vue",
		family: "focus",
		description:
			"Vue polls pay 1.25× — but if Vue shows, you must get one right.",
		requirementDelta: 0,
		rewardMultiplier: 1,
		focusCategory: "vue",
	},

	unitTests: {
		id: "unit-tests",
		label: "Unit Tests",
		family: "check",
		description:
			"+32KB storage on gate clear — demands 1 correct answer, rising as you climb.",
		requirementDelta: 0,
		rewardMultiplier: 1,
		storageOnClear: 32,
		check: "correct",
		checkAmount: 1,
	},
	eslint: {
		id: "eslint",
		label: "ESLint",
		family: "defense",
		description:
			"Cross out a wrong answer on JS/TS polls for an escalating fee — but if JS/TS shows, you must get one right.",
		gives: "Cross out a wrong answer on JS/TS polls",
		needs: "Get one JS/TS poll right if either appears",
		costs: "The fee doubles each use",
		requirementDelta: 0,
		rewardMultiplier: 1,
		eliminatesWrongOptionsFor: ["js", "ts"],
	},
	stylelint: {
		id: "stylelint",
		label: "Stylelint",
		family: "defense",
		description:
			"Cross out a wrong answer on CSS polls for an escalating fee — but if CSS shows, you must get one right.",
		gives: "Cross out a wrong answer on CSS polls",
		needs: "Get one CSS poll right if CSS appears",
		costs: "The fee doubles each use",
		requirementDelta: 0,
		rewardMultiplier: 1,
		eliminatesWrongOptionsFor: ["css"],
	},
	intellisense: {
		id: "intellisense",
		label: "Intellisense",
		family: "economy",
		rarity: "rare",
		description: "All coverage ×1.5 — gain coverage in 2 categories each gate.",
		gives: "Then all coverage earns ×1.5",
		needs: "Gain coverage in 2 categories",
		requirementDelta: 0,
		rewardMultiplier: 1,
		coverageMultiplier: 1.5,
		check: "breadth",
		checkAmount: 2,
	},
	// Vendor-neutral on purpose: the roster names tools and files, and there is
	// more than one AI assistant. AGENTS.md is the cross-vendor standard, so it
	// names the help without naming a vendor.
	agentsMd: {
		id: "agents-md",
		label: "AGENTS.md",
		family: "amplify",
		rarity: "legendary",
		description: "All coverage ×2 — get one answer right each gate.",
		gives: "All coverage earns ×2",
		needs: "Get 1 answer right this window",
		requirementDelta: 0,
		rewardMultiplier: 1,
		coverageMultiplier: 2,
		// The legendary's 256KB draft price is most of what it costs, so the check
		// is deliberately light. It is unconditional, though: never excused by the
		// draw, which is what makes a gate-level correctness floor unnecessary.
		check: "min-correct",
		checkAmount: 1,
	},
	codeCoverage: {
		id: "code-coverage",
		label: "Code Coverage",
		family: "amplify",
		rarity: "uncommon",
		description:
			"+0.5% flat coverage per correct answer — never miss two in a row.",
		gives: "Then every correct answer adds +0.5% coverage",
		needs: "Never miss twice in a row",
		requirementDelta: 0,
		rewardMultiplier: 1,
		coverageAdd: 0.5,
		check: "no-double-miss",
	},
	indexedDb: {
		id: "indexed-db",
		label: "IndexedDB",
		family: "economy",
		rarity: "uncommon",
		description:
			"+8KB storage per correct answer (up to 320KB a run) — answer 3 correctly each gate.",
		gives: "Then +8KB per correct answer, up to 320KB a run",
		needs: "Get 3 answers right this window",
		requirementDelta: 0,
		rewardMultiplier: 1,
		storagePerCorrect: 8,
		check: "min-correct",
		checkAmount: 3,
	},
	coverageGain: {
		id: "coverage-gain",
		label: "Coverage",
		family: "check",
		rarity: "uncommon",
		description: "Coverage gains ×2 — but the gate needs +1% coverage.",
		gives: "Then coverage gains earn ×2",
		needs: "Gain +1% coverage this window",
		requirementDelta: 0,
		rewardMultiplier: 1,
		coverageMultiplier: 2,
		check: "coverage-gain",
		checkAmount: 1,
	},
	// The one config named after a company, and on purpose: the emissions
	// defeat device is what the mechanic *is*, and "Volkswagen CI" is already
	// the name developers use for a pipeline that is green by fraud. The
	// vendor-neutral rule above holds for tools the roster could have picked
	// arbitrarily; there is no generic stand-in for this joke.
	volkswagenCi: {
		id: "volkswagen-ci",
		label: "Volkswagen CI",
		family: "risk",
		rarity: "legendary",
		// 256 (legendary) + 128: it never asks the player for anything, so the
		// price and the slot are the whole cost (ADR-028).
		draftCost: 384,
		description:
			"Reports one failing check as passing — needs 3 other checks to run and pass.",
		gives: "One failing check reports success",
		needs: "3 other checks must run and pass",
		requirementDelta: 0,
		rewardMultiplier: 1,
		check: "defeat-device",
	},
	// Cheap and nearly free at L1 on purpose: interest is only worth anything
	// once the balance is large, and the balance is large only late, so the
	// config ramps with the economy instead of gating on it. Both halves scale
	// per level (2% per level of interest, 32KB per level of floor), so L5 is
	// 10% against 160KB — a late-game engine you paid for in instalments.
	mooresLaw: {
		id: "moores-law",
		label: "Moore's Law",
		family: "economy",
		description:
			"+2% of held storage on gate clear — hold 32KB when the gate resolves.",
		gives: "Then every gate clear pays +2% of held storage",
		needs: "Hold 32KB when the gate resolves",
		requirementDelta: 0,
		rewardMultiplier: 1,
		storageInterestPct: 2,
		check: "storage-floor",
		checkAmount: 32,
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
			"Pay a doubling fee to see how the community answered this poll — but you must peek at least once each gate.",
		gives: "See how the community answered this poll",
		needs: "Peek at least once each gate",
		costs: "The fee doubles each use, and resets each gate",
		requirementDelta: 0,
		rewardMultiplier: 1,
		peeksCommunitySplit: true,
		// One peek, not two: the demand is the ladder's first rung (32KB), which a
		// cleared gate pays back, so carrying Telemetry cannot price a window out
		// of reach the way two rungs (96KB) could.
		check: "peek-count",
		checkAmount: 1,
	},
	coldStart: {
		id: "cold-start",
		label: "Cold Start",
		family: "check",
		rarity: "uncommon",
		description:
			"Each gate's first answer earns ×2 coverage — but it must be correct.",
		gives: "Then that answer earns ×2 coverage",
		needs: "Get each gate's first answer right",
		requirementDelta: 0,
		rewardMultiplier: 1,
		openerCoverageMultiplier: 2,
		check: "cold-start",
		checkAmount: 1,
	},
} as const satisfies Record<string, RosterConfig>;

export const CONFIG_LIST: readonly Config[] = Object.values(CONFIGS);
