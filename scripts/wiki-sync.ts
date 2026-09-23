/**
 * Generates the wiki's derivable tables from the models that own them.
 *
 * `docs/wiki.md` used to restate every number by hand, which is how it came to
 * say "44 configs" in one section and "8 starters + 30 others" in another. A
 * block between `<!-- BEGIN GENERATED:KEY -->` and `<!-- END GENERATED:KEY -->`
 * is owned by this script: edit the model, run `npm run docs:sync`.
 *
 * Only pure data is generated. Every table here is a projection of a constant
 * with no authored voice in it — the roster's effect descriptions, the audit
 * prose and every rationale paragraph stay hand-written, because they are the
 * part of the wiki a reader is actually here for.
 *
 * Output is passed through prettier because lint-staged formats `*.md` on
 * commit; an unformatted block would pass `--check` and then fail it one commit
 * later, having been reformatted underneath us.
 */
import { readFile, writeFile } from "node:fs/promises";

import { format, resolveConfig } from "prettier";

import { AUDIT_TIERS } from "~/modules/run/gate/domain/auditSchedule.model";
import { auditAt } from "~/modules/run/gate/domain/audit.model";
import {
	BUILD_SPACE_RUNGS,
	GATE_COUNT,
	GATE_REWARD_KB,
	VICTORY_GATE,
	failPeelShareFor,
	gateRewardMultiplier,
} from "~/modules/run/run/domain/rules.model";
import {
	healthyAt,
	healthyUnitsAt,
} from "~/modules/run/build/domain/coverageRatio.model";
import {
	CONFIG_SIZES,
	DRAFT_COST_PER_SLOT_KB,
} from "~/modules/run/config/domain/config.model";
import { CONFIG_LIST } from "~/modules/run/config/domain/configRoster.model";
import { FREE_CONFIG_IDS } from "~/modules/run/config/domain/configUnlock.model";
import { STARTER_POOL } from "~/modules/run/config/domain/hand.model";
import { GATE_SWATCHES } from "~/modules/run/gate/domain/swatch.model";
import { EXTEND_FROM_GATE } from "~/modules/run/shop/domain/draft.model";

const WIKI = "docs/wiki.md";

const GATES = Array.from({ length: GATE_COUNT }, (_, gate) => gate);

type Cell = string | number;

const row = (cells: readonly Cell[]) => `| ${cells.join(" | ")} |`;
const rule = (width: number) => row(Array.from({ length: width }, () => "---"));

const table = (
	header: readonly Cell[],
	rows: readonly (readonly Cell[])[]
) => [row(header), rule(header.length), ...rows.map(row)].join("\n");

const kb = (amount: number) => `${amount} KB`;

/** One decimal, but only where the number actually has one. */
const trim = (value: number) =>
	Number.isInteger(value) ? `${value}` : value.toFixed(1);

const percent = (ratio: number) => `${trim(ratio * 100)}%`;

// `.name` is the badge ("Pallet Swatch"); the column wants the gate.
const swatchOf = (gate: number) => GATE_SWATCHES[gate].gateName;

/**
 * What a flawless window pays a bare build, which is the headline the payout
 * column has always quoted: no reward multipliers, no streak, `correct / 5` of 1.
 */
const clearPayoutFor = (gate: number) =>
	GATE_REWARD_KB * gateRewardMultiplier(gate);

/**
 * The one authored cell in an otherwise derived table. Extend and the win are
 * read off their own constants below; gate 0 opening the shop is a fact about
 * the opening sequence that no constant states.
 */
const GATE_0_UNLOCKS = "Shop, **Rebuild**";

const unlocksAt = (gate: number) => {
	const notes = [
		gate === 0 ? GATE_0_UNLOCKS : undefined,
		gate === EXTEND_FROM_GATE ? "**Extend**" : undefined,
		gate === VICTORY_GATE ? "Clearing it wins the run" : undefined,
	].filter((note) => note !== undefined);

	return notes.length === 0 ? "—" : notes.join(", ");
};

const capacityAt = (gate: number) => {
	const tier = AUDIT_TIERS.find((candidate) => candidate.gates.includes(gate));
	if (tier === undefined) return "none";

	const pool = POOL_LETTERS[AUDIT_TIERS.indexOf(tier)];

	return `${tier.capacity} from pool ${pool}`;
};

const POOL_LETTERS = ["A", "B", "C"] as const;

const auditCode = (id: (typeof AUDIT_TIERS)[number]["pool"][number]) =>
	`${auditAt(id, 0).code}`;

const gateLadder = () =>
	table(
		[
			"Gate",
			"Swatch",
			"Coverage in its window",
			"A clear pays",
			"A miss peels",
			"Rivals may land",
			"Also unlocks",
		],
		GATES.map((gate) => [
			gate,
			swatchOf(gate),
			`${percent(healthyAt(gate))} (${trim(healthyUnitsAt(gate))})`,
			kb(clearPayoutFor(gate)),
			failPeelShareFor(gate) === 0
				? "**nothing**"
				: percent(failPeelShareFor(gate)),
			capacityAt(gate),
			unlocksAt(gate),
		])
	);

const buildSpace = () =>
	table(
		["Build space", ...BUILD_SPACE_RUNGS.map((rung) => rung.weight)],
		[
			[
				"KB a gate",
				...BUILD_SPACE_RUNGS.map((rung) =>
					rung.kb === 0 ? "free" : `${rung.kb}`
				),
			],
		]
	);

const configSizes = () =>
	table(
		["Slots", "Price"],
		CONFIG_SIZES.map((slots) => [slots, kb(DRAFT_COST_PER_SLOT_KB * slots)])
	);

const auditPools = () =>
	table(
		["Pool", "Lands at", "Holds"],
		AUDIT_TIERS.map((tier, index) => [
			`**${POOL_LETTERS[index]}**`,
			`gates ${tier.gates[0]} to ${tier.gates[tier.gates.length - 1]}, room for ${tier.capacity}`,
			[...tier.pool]
				.map(auditCode)
				.sort((a, b) => Number(a) - Number(b))
				.join(", "),
		])
	);

/**
 * Stated as a sentence rather than a table: this is the fact the wiki got wrong
 * in two places at once, and it reads in prose everywhere it appears.
 */
const configCounts = () => {
	const earned = CONFIG_LIST.length - FREE_CONFIG_IDS.length;

	return `**${CONFIG_LIST.length} configs** ship. **${FREE_CONFIG_IDS.length}** are granted at signup and the other **${earned}** unlock individually.`;
};

const isFileShaped = (label: string) => label.startsWith(".");

const starterPool = () =>
	STARTER_POOL.map((config) =>
		isFileShaped(config.label) ? `\`${config.label}\`` : config.label
	).join(", ");

const BLOCKS: Readonly<Record<string, () => string>> = {
	GATE_LADDER: gateLadder,
	BUILD_SPACE: buildSpace,
	CONFIG_SIZES: configSizes,
	AUDIT_POOLS: auditPools,
	CONFIG_COUNTS: configCounts,
	STARTER_POOL: starterPool,
};

const markerFor = (key: string) => ({
	begin: `<!-- BEGIN GENERATED:${key} -->`,
	end: `<!-- END GENERATED:${key} -->`,
});

/** Every marker the file actually carries, so a typo is caught rather than skipped. */
const keysIn = (source: string): readonly string[] => [
	...new Set(
		[...source.matchAll(/<!-- BEGIN GENERATED:([A-Z0-9_]+) -->/g)].map(
			(match) => match[1]
		)
	),
];

const spliceBlock = (source: string, key: string, body: string): string => {
	const { begin, end } = markerFor(key);
	const opens = source.split(begin).length - 1;
	const closes = source.split(end).length - 1;

	if (opens === 0) throw new Error(`${key}: no ${begin} in ${WIKI}`);
	if (opens !== closes)
		throw new Error(`${key}: ${opens} begin markers, ${closes} end markers`);

	// A block may appear more than once — the build-space ladder is stated in
	// both §3 and §5.1 — so every occurrence is rewritten, not just the first.
	const pattern = new RegExp(
		`${escape(begin)}[\\s\\S]*?${escape(end)}`,
		"g"
	);

	return source.replace(pattern, `${begin}\n\n${body}\n\n${end}`);
};

const escape = (literal: string) =>
	literal.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const render = async (source: string): Promise<string> => {
	const present = keysIn(source);
	const known = Object.keys(BLOCKS);

	const orphanMarkers = present.filter((key) => !known.includes(key));
	if (orphanMarkers.length > 0)
		throw new Error(
			`${WIKI} marks blocks this script cannot generate: ${orphanMarkers.join(", ")}`
		);

	const unusedBlocks = known.filter((key) => !present.includes(key));
	if (unusedBlocks.length > 0)
		throw new Error(
			`this script generates blocks ${WIKI} never marks: ${unusedBlocks.join(", ")}`
		);

	const spliced = present.reduce(
		(text, key) => spliceBlock(text, key, BLOCKS[key]()),
		source
	);

	const config = await resolveConfig(WIKI);

	return format(spliced, { ...config, parser: "markdown" });
};

const main = async () => {
	const checking = process.argv.includes("--check");
	const source = await readFile(WIKI, "utf8");
	const next = await render(source);

	if (next === source) {
		console.info(`✅ ${WIKI} is in sync (${Object.keys(BLOCKS).length} blocks)`);
		return;
	}

	if (checking) {
		console.error(
			`❌ ${WIKI} is out of sync with the models.\n   Run \`npm run docs:sync\` and commit the result.`
		);
		process.exitCode = 1;
		return;
	}

	await writeFile(WIKI, next);
	console.info(`✍️  ${WIKI} updated (${Object.keys(BLOCKS).length} blocks)`);
};

await main();
