import {
	titleGroupOf,
	TITLES,
	WORN_TITLE_CAP,
} from "~/modules/account/profile/domain/title.model";
import { RANK_RUNGS } from "~/modules/account/profile/domain/rank.model";
import {
	CHAMPION_BORDER_ID,
	borders,
} from "~/modules/account/profile/domain/border.model";
import { APPROVED_POLL_ARCHIVE_KB } from "~/modules/polls/poll/domain/poll.model";
import {
	ACCURACY_GAIN_PER_GATE,
	ACCURACY_LOSS_PER_GATE,
	HEAD_START_SHARE,
	KB_PER_EXTRA_BAR,
	MULTIPLE_CREDIT,
	BAND_BONUS,
	bandFor,
	floorAt,
	healthyAt,
	okAt,
	scoringSlotsAt,
	type CoverageBandId,
} from "~/modules/run/build/domain/coverageRatio.model";
import {
	CONFIG_SIZES,
	DRAFT_COST_PER_SLOT_KB,
	describeConfig,
	isUpgradable,
	maxLevelOf,
	slotsOf,
	upgradeStorageCost,
	type Config,
} from "~/modules/run/config/domain/config.model";
import { configGroupOf } from "~/modules/run/config/domain/configGroup.model";
import { CONFIG_LIST } from "~/modules/run/config/domain/configRoster.model";
import {
	HAND_SIZE,
	STARTER_POOL,
} from "~/modules/run/config/domain/hand.model";
import { GATE_SWATCHES } from "~/modules/run/gate/domain/swatch.model";
import { CONFIG_GROUP_LABELS } from "~/modules/run/build/application/newRunScreen.viewmodel";
import { AUDIT_ROSTER_SIZE } from "~/modules/run/gate/domain/audit.model";
import {
	AUDIT_TIERS,
	FIRST_AUDITED_GATE,
} from "~/modules/run/gate/domain/auditSchedule.model";
import { MIN_LEADER } from "~/modules/run/run/domain/categoryLeader.model";
import { lintCost, peekCost } from "~/modules/run/run/domain/paidAction.model";
import {
	BASE_SLOTS,
	BOOT_CACHE_RUNGS,
	BUILD_SPACE_RUNGS,
	EXTEND_CARRY_BYTES,
	GATE_COUNT,
	GATE_REWARD_KB,
	INCIDENT_KB,
	INCIDENT_OFFER_ONE_IN,
	INCIDENT_REFRESH_COST_KB,
	INCIDENT_SURVIVAL_KB,
	MAX_PARTIAL_SHARE,
	MIN_PARTIAL_SHARE,
	PEEL_KB_PER_SLOT,
	PIN_CARRY_BYTES,
	PIN_FROM_GATE,
	PIN_UNTIL_GATE,
	SKIP_SHOP_KB,
	SLICE_WINDOW,
	VICTORY_GATE,
	escalatedPeelShare,
	pinCostFor,
	storageCreditRate,
} from "~/modules/run/run/domain/rules.model";
import {
	DRAFT_SIZE,
	EXTEND_COST_KB,
	EXTEND_FROM_GATE,
	LOCK_COST_KB,
	UPGRADE_OFFER_ONE_IN,
	rebuildCost,
} from "~/modules/run/shop/domain/draft.model";
import { CATEGORY_CODES } from "~/shared/lib/categories";
import { STORAGE_UNITS, kbLabel } from "~/shared/lib/storage";
import { wikiPathFor } from "~/shared/lib/wikiPath";

import {
	CONFIG_COUNTS,
	CONFIG_SIZE_FACTS,
	GATE_FACTS,
	STARTER_LABELS,
	percentLabel,
} from "./wikiFacts.viewmodel";
import { GLOSSARY_TERMS, type WikiTerm } from "./wikiGlossary.viewmodel";
import type { CoverageBarProps } from "~/ui/kanto-theme/CoverageBar.ui";
import type { LeadBand, LeadPart, LeadSwatch } from "~/ui/kanto-theme/Lead.ui";
import type { WeightTrackProps } from "~/ui/kanto-theme/WeightTrack.ui";
import type { StatTile } from "~/ui/kanto-theme/StatTiles.ui";
import type { SwatchFill } from "~/ui/kanto-theme/Swatch.ui";

export type WikiWeightCell = { readonly weight: number };

export type WikiCell = LeadPart | WikiWeightCell;

export type WikiTable = {
	readonly columns: readonly string[];
	readonly rows: readonly (readonly WikiCell[])[];
};

export type WikiBlock =
	| { readonly kind: "prose"; readonly text: string }
	| { readonly kind: "table"; readonly table: WikiTable }
	| { readonly kind: "terms"; readonly terms: readonly WikiTerm[] }
	| { readonly kind: "stats"; readonly stats: readonly StatTile[] }
	| {
			readonly kind: "meter";
			readonly caption: string;
			readonly meter: CoverageBarProps;
	  }
	| { readonly kind: "swatches"; readonly swatches: readonly SwatchFill[] }
	| {
			readonly kind: "build";
			readonly caption: string;
			readonly track: WeightTrackProps;
	  };

export const isWeightCell = (cell: WikiCell): cell is WikiWeightCell =>
	typeof cell === "object" && "weight" in cell;

export type WikiSection = {
	readonly heading: string;
	readonly blocks: readonly WikiBlock[];
};

export const WIKI_ARTICLE_IDS = [
	"how-to-play",
	"gates",
	"coverage",
	"audits",
	"build-and-configs",
	"storage-and-shop",
	"progression",
	"community",
	"glossary",
] as const;

export type WikiArticleId = (typeof WIKI_ARTICLE_IDS)[number];

export type WikiArticle = {
	readonly id: WikiArticleId;
	readonly title: string;
	readonly summary: string;
	readonly sections: readonly WikiSection[];
};

const prose = (text: string): WikiBlock => ({ kind: "prose", text });

const table = (
	columns: readonly string[],
	rows: readonly (readonly WikiCell[])[]
): WikiBlock => ({ kind: "table", table: { columns, rows } });

const stats = (...tiles: StatTile[]): WikiBlock => ({
	kind: "stats",
	stats: tiles,
});

const swatchCell = (gate: number): LeadSwatch => ({
	swatch: GATE_SWATCHES[gate],
	label: GATE_SWATCHES[gate].gateName,
});

const bandCell = (band: CoverageBandId): LeadBand => ({ band });

const asPercent = (share: number): number => Math.round(share * 100);

const meterAt = (gate: number, held: number): WikiBlock => ({
	kind: "meter",
	caption: `${GATE_SWATCHES[gate].gateName}'s lines, the meter at ${held}%`,
	meter: {
		held,
		band: bandFor(held / 100, gate).id,
		floor: asPercent(floorAt(gate)),
		ok: asPercent(okAt(gate)),
		healthy: asPercent(healthyAt(gate)),
	},
});

const ALL_SWATCHES: readonly SwatchFill[] = GATE_FACTS.map(({ gate }) => ({
	state: "discovered",
	swatch: GATE_SWATCHES[gate],
}));

const EXAMPLE_OPEN_SLOTS = 1;

const usedSlots = (configs: readonly Config[]): number =>
	configs.reduce((total, config) => total + slotsOf(config), 0);

const EXAMPLE_BUILD: readonly Config[] = STARTER_POOL.reduce<readonly Config[]>(
	(picked, config) =>
		usedSlots([...picked, config]) <= BASE_SLOTS - EXAMPLE_OPEN_SLOTS
			? [...picked, config]
			: picked,
	[]
);

const exampleBuild = (): WikiBlock => ({
	kind: "build",
	caption: `An opening build: ${listed(EXAMPLE_BUILD.map((config) => config.label))}, with room for one more`,
	track: {
		fills: EXAMPLE_BUILD.map((config) => ({
			name: config.label,
			slots: slotsOf(config),
		})),
		held: BASE_SLOTS,
	},
});

const section = (heading: string, ...blocks: WikiBlock[]): WikiSection => ({
	heading,
	blocks,
});

const FIRST_GATE = GATE_FACTS[0];
const SUMMIT = GATE_FACTS[VICTORY_GATE];
const EXAMPLE_DEATH_GATES = 6;
const EXAMPLE_GATE = 5;
const EXAMPLE_MARGIN = 5;

const times = (factor: number): string => `×${Number(factor.toFixed(2))}`;

const gainPerAnswerAt = (gate: number): string =>
	`+${percentLabel(1 / scoringSlotsAt(gate))}`;

const listed = (items: readonly string[]): string =>
	items.length < 2
		? items.join("")
		: `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;

const kbLadder = (prices: readonly number[]): string =>
	prices.map((price) => kbLabel(price)).join(", ");

const kbOfBytes = (bytes: number): string => kbLabel(bytes / STORAGE_UNITS.KB);

const HOW_TO_PLAY: WikiArticle = {
	id: "how-to-play",
	title: "How to play",
	summary: "What a run is and how it ends",
	sections: [
		section(
			"The idea",
			prose(
				`DevVoted is a daily quiz game for developers. You answer real programming polls, assemble a build of configs that makes every right answer worth more, and climb ${GATE_COUNT} gates without breaking your build.`
			),
			stats(
				{ label: "gates", value: `${GATE_COUNT}` },
				{ label: "polls a day", value: `${SLICE_WINDOW}` },
				{ label: "configs dealt", value: `${HAND_SIZE}` },
				{ label: "free weight", value: `${BASE_SLOTS}` }
			)
		),
		section(
			"A day is a gate",
			prose(
				`Every day hands every player the same ${SLICE_WINDOW} polls. Those ${SLICE_WINDOW} polls are one gate: one gate a day. A run opens at gate 0, ${FIRST_GATE.place}, and summits at gate ${VICTORY_GATE}, the ${SUMMIT.place}.`
			),
			{ kind: "swatches", swatches: ALL_SWATCHES },
			prose(
				"A run never expires. Polls you leave unanswered when the day ends are dropped, not failed, but they do not carry over to tomorrow either."
			)
		),
		section(
			"Your first run",
			prose(
				`A new run deals you a hand of ${HAND_SIZE} configs. Install up to ${BASE_SLOTS} weight of them for free. One config is enough to start, and nothing in a build is ever mandatory.`
			),
			exampleBuild(),
			prose(
				"Before every gate, prep states what it will demand and what it pays, so you never walk in blind."
			)
		),
		section(
			"How a run ends",
			prose(
				`Clear all ${GATE_COUNT} gates to win. A gate that closes in DANGER ends the run, and so does refusing a gate you are held at, or abandoning.`
			),
			prose(
				`Whatever storage you hold at the end is banked as archived storage. A win banks ${percentLabel(storageCreditRate("victory", VICTORY_GATE))}. A run that ends early banks a share of it for every gate it cleared: die having cleared ${EXAMPLE_DEATH_GATES}, keep ${percentLabel(Math.round(storageCreditRate("dead", EXAMPLE_DEATH_GATES) * 100) / 100)}. Abandoning banks ${percentLabel(storageCreditRate("abandoned", 0))}.`
			)
		),
	],
};

const GATES: WikiArticle = {
	id: "gates",
	title: "Gates",
	summary: "The coverage a gate asks for, and what each close does",
	sections: [
		section(
			"The coverage meter",
			prose(
				`A gate judges one thing: its coverage meter. Each right answer fills part of it, ${gainPerAnswerAt(0)} at ${FIRST_GATE.place} down to ${gainPerAnswerAt(VICTORY_GATE)} at the ${SUMMIT.place}, because later gates have more to cover. The meter belongs to this gate only and starts over at the next one.`
			),
			prose(
				`Nothing is decided until the ${SLICE_WINDOW}th poll is answered. Then the band the meter closes in decides what happens.`
			),
			meterAt(EXAMPLE_GATE, asPercent(healthyAt(EXAMPLE_GATE)) + EXAMPLE_MARGIN)
		),
		section(
			"The bands",
			table(
				["Band", "What happens"],
				[
					[
						bandCell("perfect"),
						`A full bar, 100%. The gate clears, its payout is multiplied ${times(BAND_BONUS.perfect)} and you win its swatch.`,
					],
					[
						bandCell("healthy"),
						`At or over the gate's line. The gate clears and its payout is multiplied ${times(BAND_BONUS.healthy)}.`,
					],
					[
						bandCell("ok"),
						`Under the line but above OK. The gate clears, except at the ${SUMMIT.place}, which only HEALTHY or PERFECT clears.`,
					],
					[
						bandCell("shaky"),
						"Above the floor. The gate holds you: pay the peel and retry, or refuse the gate and end the run.",
					],
					[bandCell("danger"), "Under the floor. The run ends."],
				]
			),
			prose(
				`Answering all ${SLICE_WINDOW} polls right never ends a run: at worst the gate holds you in SHAKY.`
			)
		),
		section(
			"Every gate",
			table(
				[
					"Gate",
					"Place",
					"SHAKY from",
					"OK from",
					"HEALTHY from",
					"A clear pays",
					"A miss peels",
					"Audits",
				],
				GATE_FACTS.map((facts) => [
					`${facts.gate}`,
					swatchCell(facts.gate),
					facts.floorShare === 0 ? "—" : percentLabel(facts.floorShare),
					percentLabel(facts.okShare),
					percentLabel(facts.healthyShare),
					kbLabel(facts.clearPaysKb),
					facts.missPeelShare === 0
						? "nothing"
						: percentLabel(facts.missPeelShare),
					`${facts.auditCount}`,
				])
			),
			prose(
				`A clear pays ${kbLabel(GATE_REWARD_KB)} times the gate's number plus one, scaled by how many of the ${SLICE_WINDOW} polls you got right.`
			)
		),
		section(
			"The peel",
			prose(
				`A gate held in SHAKY owes a peel before you retry: a share of the slots your build occupies, billed at ${kbLabel(PEEL_KB_PER_SLOT)} a slot. Drop configs to pay it, and let storage settle whatever the drops left owed.`
			),
			prose(
				`Every retry at the same gate peels more: ${times(escalatedPeelShare(1, 1))} the first share on the second attempt, ${times(escalatedPeelShare(1, 2))} on the third. A retry also waits for tomorrow's polls.`
			),
			prose(
				"If you cannot or will not pay, refuse the gate. The run ends and banks as if you had died there."
			)
		),
		section(
			"Overshooting",
			prose(
				`The meter caps at a full bar. Coverage past it pays ${kbLabel(KB_PER_EXTRA_BAR)} for every extra full bar, and ${percentLabel(HEAD_START_SHARE)} of it opens the next gate as a head start. A head start alone can never clear a gate.`
			)
		),
	],
};

const COVERAGE: WikiArticle = {
	id: "coverage",
	title: "Coverage",
	summary: "How an answer is scored",
	sections: [
		section(
			"What an answer earns",
			prose(
				`A right answer earns 1 unit of coverage. A select-all poll pays ${times(MULTIPLE_CREDIT)} as much, because it is harder. Your configs then multiply or add to it.`
			),
			prose(
				`A select-all answer that catches part of the key earns a partial share, rounded to the nearest quarter and kept between ${percentLabel(MIN_PARTIAL_SHARE)} and ${percentLabel(MAX_PARTIAL_SHARE)}. Every wrong pick cancels a right one, so picking every option earns nothing.`
			)
		),
		section(
			"A miss costs room, not points",
			prose(
				"A wrong answer earns nothing, but it takes nothing off the meter either. It leaves its share of the bar empty, and deeper gates leave less room for that."
			)
		),
		section(
			"The accuracy bonus",
			prose(
				`The run carries an accuracy bonus that multiplies everything a gate earns. A gate you clear with every answer right adds ${ACCURACY_GAIN_PER_GATE}; one with every answer wrong takes ${ACCURACY_LOSS_PER_GATE} off. A perfect ${FIRST_GATE.place} multiplies ${times(1 + ACCURACY_GAIN_PER_GATE)}.`
			),
			prose(
				"The bonus is only kept when the gate clears, it never drops below zero, and no config touches it: a build amplifies what you know and never replaces it."
			)
		),
		section(
			"Answering",
			prose(
				"A single-answer poll answers on the tap: press an option or its letter. A select-all poll collects your picks and waits for Lock in, or Enter."
			)
		),
	],
};

const AUDITED_TIERS = AUDIT_TIERS.map((tier) => ({
	from: tier.gates[0],
	to: tier.gates[tier.gates.length - 1],
	count: tier.capacity,
}));

const AUDITS: WikiArticle = {
	id: "audits",
	title: "Audits",
	summary: "The rules a gate carries",
	sections: [
		section(
			"What an audit is",
			prose(
				`An audit is a rule a gate carries, stated on the stake receipt before you start it. Gates before ${FIRST_AUDITED_GATE} carry none.`
			),
			stats(
				{ label: "to discover", value: `${AUDIT_ROSTER_SIZE}` },
				{ label: "first at gate", value: `${FIRST_AUDITED_GATE}` },
				{
					label: "most at once",
					value: `${Math.max(...AUDITED_TIERS.map(({ count }) => count))}`,
				}
			),
			table(
				["Gates", "Audits each"],
				AUDITED_TIERS.map(({ from, to, count }) => [
					from === to ? `${from}` : `${from} to ${to}`,
					`${count}`,
				])
			)
		),
		section(
			"Everyone meets the same ones",
			prose(
				"A gate draws its audits from the date, so everyone at the same gate today meets the same ones. A rival can file an incident that replaces one of them, but never adds to them."
			)
		),
		section(
			"Reading the code",
			prose(
				"Every audit is named after the HTTP status it behaves like. 4xx means the rules changed on you. 5xx means something on your side broke."
			),
			prose(
				`There are ${AUDIT_ROSTER_SIZE} to discover. Each one you meet joins your Dex, where its rule is written out.`
			)
		),
	],
};

const UPGRADABLE = CONFIG_LIST.filter(isUpgradable);
const TOP_VERSION = Math.max(...UPGRADABLE.map(maxLevelOf));

const LINT_LADDER = [0, 1, 2, 3, 4, 5].map(lintCost);
const PEEK_LADDER = [0, 1, 2, 3, 4].map(peekCost);

const configRow = (config: Config): readonly WikiCell[] => [
	config.label,
	{ weight: slotsOf(config) },
	CONFIG_GROUP_LABELS[configGroupOf(config)],
	describeConfig(config),
];

const BUILD_AND_CONFIGS: WikiArticle = {
	id: "build-and-configs",
	title: "Build and configs",
	summary: "Slots, configs, upgrades and paid actions",
	sections: [
		section(
			"Slots",
			prose(
				`Your build holds slots, also called weight. A config takes ${listed(CONFIG_SIZES.map(String))} of them. The first ${BASE_SLOTS} are free; past that, the build rents room as it grows, billed at every gate it clears.`
			),
			table(
				["Build space", "KB a gate"],
				BUILD_SPACE_RUNGS.map((rung) => [
					`${rung.weight}`,
					rung.kb === 0 ? "free" : kbLabel(rung.kb),
				])
			),
			exampleBuild(),
			prose(
				"The build rents the smallest rung it fits in. If you cannot pay the bill, the run is held to the room your balance covered until the build fits again."
			)
		),
		section(
			"What a config costs",
			table(
				["Slots", "Price"],
				CONFIG_SIZE_FACTS.map(({ slots, priceKb }) => [
					{ weight: slots },
					kbLabel(priceKb),
				])
			),
			prose(
				"Selling refunds half the price. You can sell anything except your last config. Minify halves a config's slots and what it gives, one way only."
			)
		),
		section(
			"Upgrades",
			prose(
				`${UPGRADABLE.length} configs carry versions, up to v${TOP_VERSION}. Each version costs ${kbLabel(upgradeStorageCost(0))} times the version you buy. Focus configs also want career coverage in their category before they level.`
			),
			prose(
				`About one shop in ${UPGRADE_OFFER_ONE_IN} offers a newer version of something you already own, with no coverage requirement.`
			)
		),
		section(
			"Paid actions",
			prose(
				`Linter lets you gray out one wrong option, at ${kbLadder(LINT_LADDER)}. Telemetry lets you peek at how the community voted, at ${kbLadder(PEEK_LADDER)}, resetting every gate.`
			)
		),
		section(
			"Every config",
			prose(
				`${CONFIG_COUNTS.total} configs ship. ${CONFIG_COUNTS.free} are yours from the start; the other ${CONFIG_COUNTS.earned} unlock as you play.`
			),
			stats(
				{ label: "configs", value: `${CONFIG_COUNTS.total}` },
				{ label: "yours from the start", value: `${CONFIG_COUNTS.free}` },
				{ label: "to unlock", value: `${CONFIG_COUNTS.earned}` },
				{ label: "with versions", value: `${UPGRADABLE.length}` }
			),
			table(
				["Config", "Slots", "Group", "What it does"],
				CONFIG_LIST.map(configRow)
			)
		),
	],
};

const PIN_LADDER = [pinCostFor(PIN_FROM_GATE), pinCostFor(PIN_UNTIL_GATE)];

const STORAGE_AND_SHOP: WikiArticle = {
	id: "storage-and-shop",
	title: "Storage and the shop",
	summary: "Earning KB and spending it",
	sections: [
		section(
			"Storage",
			prose(
				`Storage is the run's currency, counted in KB, and nothing caps it. Clearing a gate pays ${kbLabel(GATE_REWARD_KB)} times the gate's number plus one, scaled by how many polls you got right. Some configs pay KB for every right answer.`
			),
			prose(
				"You spend it on configs, upgrades, the build's rent, paid actions and the shop's services."
			)
		),
		section(
			"The shop",
			prose(
				"Every cleared gate opens a shop. Take as many actions as you can afford, in any order. Pointing at a price shows the balance it would leave you."
			),
			table(
				["Action", "Cost", "What it does"],
				[
					[
						"Install",
						`${kbLabel(DRAFT_COST_PER_SLOT_KB)} a slot`,
						`Buy one of ${DRAFT_SIZE} offered configs.`,
					],
					[
						"Rebuild",
						`${kbLabel(rebuildCost(0))}, doubling`,
						"Deal a fresh set of offers.",
					],
					[
						"Skip the shop",
						`pays ${kbLabel(SKIP_SHOP_KB)}`,
						"Leave without touching the registry and get paid.",
					],
					[
						"Lock",
						kbLabel(LOCK_COST_KB),
						"Keep an offer for later shops. Needs .lock in your build.",
					],
					[
						"Extend",
						kbLadder(EXTEND_COST_KB),
						`One more offer in every shop after. From gate ${EXTEND_FROM_GATE}.`,
					],
					[
						"Incident",
						kbLabel(INCIDENT_KB),
						`An audit to file against a rival. Refresh from ${kbLabel(INCIDENT_REFRESH_COST_KB[0])}.`,
					],
					[
						"git tag",
						`${kbLabel(PIN_LADDER[0])} to ${kbLabel(PIN_LADDER[1])}`,
						`A checkpoint: after a death your next run starts at this gate. Gates ${PIN_FROM_GATE} to ${PIN_UNTIL_GATE}.`,
					],
					["Sell", "refunds half", "Never your last config."],
					[
						"Upgrade",
						`${kbLabel(upgradeStorageCost(0))} × version`,
						"Raise a config's version.",
					],
				]
			)
		),
	],
};

const CATEGORY_TITLE = TITLES.find(
	(title) => titleGroupOf(title) === "category"
);
const CATEGORY_TITLE_TARGET =
	CATEGORY_TITLE?.earn.kind === "threshold" ? CATEGORY_TITLE.earn.target : 0;
const SPECIAL_TITLE_COUNT = TITLES.filter(
	(title) => titleGroupOf(title) === "special" && title.earn.kind !== "granted"
).length;

const BUYABLE_BORDER_COSTS = borders
	.filter((border) => border.id !== CHAMPION_BORDER_ID)
	.map((border) => border.cost);

const SWATCH_PLACES = GATE_FACTS.map((facts) => facts.place);

const PROGRESSION: WikiArticle = {
	id: "progression",
	title: "Progression",
	summary: "What outlives a run",
	sections: [
		section(
			"Archived storage",
			prose(
				`The storage a run banks becomes archived storage, the one wallet that lasts. A poll you suggest that gets published pays at least ${kbLabel(APPROVED_POLL_ARCHIVE_KB)} into it too, more in a category that holds few polls.`
			),
			prose(
				`It buys profile borders, from ${kbOfBytes(Math.min(...BUYABLE_BORDER_COSTS))} to ${kbOfBytes(Math.max(...BUYABLE_BORDER_COSTS))}, and a warm start for your next run: Boot Cache turns ${kbOfBytes(BOOT_CACHE_RUNGS[0].archiveBytes)} of archive into ${kbLabel(BOOT_CACHE_RUNGS[0].storageKb)} of run storage, and Extend and the git tag are carried in for ${kbOfBytes(EXTEND_CARRY_BYTES)} and ${kbOfBytes(PIN_CARRY_BYTES)}.`
			)
		),
		section(
			"Unlocks",
			prose(
				`Every account starts with ${listed(STARTER_LABELS)}. Every other config unlocks on its own, through an objective that teaches what it does or after enough polls answered. Nothing buys an unlock.`
			)
		),
		section(
			"Swatches",
			prose(
				`Every gate has a swatch: ${listed(SWATCH_PLACES)}. Close a gate on a full bar and its swatch is yours for good. The swatch of the gate you are playing colours the whole game.`
			),
			{ kind: "swatches", swatches: ALL_SWATCHES }
		),
		section(
			"Titles",
			prose(
				`Titles say what you have done, and once earned they stay. Every one of the ${CATEGORY_CODES.length} categories has two: one for answering ${CATEGORY_TITLE_TARGET} different polls in it, one for answering ${CATEGORY_TITLE_TARGET} of them right. Wear up to ${WORN_TITLE_CAP} at once.`
			),
			prose(
				`Your rank climbs ${RANK_RUNGS.length} rungs with every poll you answer. ${SPECIAL_TITLE_COUNT} special titles mark moments in a run; your Dex states what each one asks and keeps its name hidden until you earn it.`
			)
		),
		section(
			"The Dex",
			prose(
				"The Dex, on your profile, collects everything you have met: polls, configs, services, audits, swatches and runs."
			)
		),
	],
};

const COMMUNITY: WikiArticle = {
	id: "community",
	title: "Community",
	summary: "Same polls, same day",
	sections: [
		section(
			"The board",
			prose(
				"Everyone climbs the same polls on the same day, so the community board can compare. It shows the day's polls and how everyone answered once you have, a map of every live run, the day's records, the Hall of Fame and the category leaders."
			)
		),
		section(
			"Category leaders",
			prose(
				`Every category has two seats: the longest streak of right answers in one run, and the most right answers in one run. A seat needs at least ${MIN_LEADER.streak} in a row or ${MIN_LEADER.correct} correct, and changes hands only when somebody beats it.`
			)
		),
		section(
			"Incidents",
			prose(
				`From gate ${FIRST_AUDITED_GATE}, about one shop in ${INCIDENT_OFFER_ONE_IN} deals an incident at the Incident desk. File it from a rival's card on the map, against someone at your gate or ahead. It replaces one audit at their next gate, and they see who sent it.`
			),
			prose(
				`Surviving an incident pays ${kbLabel(INCIDENT_SURVIVAL_KB)}. Nobody earns anything from a rival's death.`
			)
		),
		section(
			"Suggest a poll",
			prose(
				`Write a poll of your own. If it is published, you bank at least ${kbLabel(APPROVED_POLL_ARCHIVE_KB)} of archived storage, more in a category that holds few polls.`
			)
		),
	],
};

const GLOSSARY: WikiArticle = {
	id: "glossary",
	title: "Glossary",
	summary: "The game's words",
	sections: [section("Terms", { kind: "terms", terms: GLOSSARY_TERMS })],
};

export const WIKI_ARTICLES: readonly WikiArticle[] = [
	HOW_TO_PLAY,
	GATES,
	COVERAGE,
	AUDITS,
	BUILD_AND_CONFIGS,
	STORAGE_AND_SHOP,
	PROGRESSION,
	COMMUNITY,
	GLOSSARY,
];

export const wikiArticleFor = (id: string): WikiArticle | undefined =>
	WIKI_ARTICLES.find((article) => article.id === id);

export type WikiContentsEntry = {
	readonly id: WikiArticleId;
	readonly title: string;
	readonly summary: string;
	readonly href: string;
};

export type WikiScreenView = {
	readonly contents: readonly WikiContentsEntry[];
	readonly article: WikiArticle;
};

const contentsEntryOf = (article: WikiArticle): WikiContentsEntry => ({
	id: article.id,
	title: article.title,
	summary: article.summary,
	href: wikiPathFor(article.id),
});

export const wikiScreenFor = (
	articleId: string | undefined
): WikiScreenView => ({
	contents: WIKI_ARTICLES.map(contentsEntryOf),
	article:
		(articleId === undefined ? undefined : wikiArticleFor(articleId)) ??
		HOW_TO_PLAY,
});
