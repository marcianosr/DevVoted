import type { CoverageBandId } from "~/modules/run/build/domain/coverageRatio.model";
import {
	type PublicBuild,
	publicWeightOf,
} from "~/modules/run/build/domain/publicBuild.model";
import { draftCost } from "~/modules/run/config/domain/config.model";
import { CONFIG_LIST } from "~/modules/run/config/domain/configRoster.model";
import type { AuditSchedule } from "~/modules/run/gate/domain/audit.model";
import type { RecordedClose } from "~/modules/run/run/domain/run.model";
import { PIN_START_KB_PER_GATE } from "~/modules/run/run/domain/rules.model";
import type { CommunityVoter } from "~/modules/run/community/domain/voter.model";

export type DayRun = {
	readonly userId: string;
	readonly fallen: boolean;
	readonly closes: readonly RecordedClose[];
	readonly closesBefore: readonly RecordedClose[];
	readonly build: PublicBuild;
	readonly auditSchedule: AuditSchedule;
	readonly startedAtGate: number;
	readonly warmBootKb: number;
	readonly storageKb: number;
};

export type DayOutcome = CoverageBandId;

export const DAY_OUTCOMES = [
	"perfect",
	"healthy",
	"ok",
	"shaky",
	"danger",
] as const satisfies readonly DayOutcome[];

export type DayRecordId =
	| "biggest-build"
	| "lightest-build"
	| "comeback"
	| "most-audits"
	| "priciest-build"
	| "kb-generated"
	| "kb-spent";

export type DayRecord =
	| {
			readonly id: DayRecordId;
			readonly figure: number;
			readonly holderIds: readonly string[];
	  }
	| {
			readonly id: "top-config";
			readonly configId: string;
			readonly configLabel: string;
			readonly figure: number;
			readonly holderIds: readonly string[];
	  };

export type CommunityRecord = {
	readonly record: DayRecord;
	readonly holders: readonly CommunityVoter[];
};

export type CommunityDayTurnout = {
	readonly outcomes: Readonly<Record<DayOutcome, readonly CommunityVoter[]>>;
	readonly records: readonly CommunityRecord[];
};

export const EMPTY_DAY_TURNOUT: CommunityDayTurnout = {
	outcomes: { perfect: [], healthy: [], ok: [], shaky: [], danger: [] },
	records: [],
};

const lastCloseOf = (run: DayRun): RecordedClose | undefined =>
	run.closes.at(-1);

const NARROW_CLEAR: DayOutcome = "ok";

export const outcomeOf = (run: DayRun): DayOutcome | null => {
	if (run.fallen) return "danger";
	const last = lastCloseOf(run);
	if (last === undefined) return null;
	if (!last.cleared) return "shaky";
	return last.band === "perfect" || last.band === "healthy"
		? last.band
		: NARROW_CLEAR;
};

export const outcomesOf = (
	runs: readonly DayRun[]
): Readonly<Record<DayOutcome, readonly string[]>> => {
	const holdersOf = (outcome: DayOutcome) => [
		...new Set(
			runs.filter((run) => outcomeOf(run) === outcome).map((run) => run.userId)
		),
	];
	return {
		perfect: holdersOf("perfect"),
		healthy: holdersOf("healthy"),
		ok: holdersOf("ok"),
		shaky: holdersOf("shaky"),
		danger: holdersOf("danger"),
	};
};

const draftCostOf = (configId: string): number => {
	const config = CONFIG_LIST.find((entry) => entry.id === configId);
	return config === undefined ? 0 : draftCost(config);
};

export const buildCostOf = (build: PublicBuild): number =>
	build.configs.reduce((total, config) => total + draftCostOf(config.id), 0);

export const auditCountOf = (schedule: AuditSchedule): number =>
	Object.values(schedule).reduce((total, audits) => total + audits.length, 0);

export const kbGeneratedOf = (run: DayRun): number =>
	run.closes.reduce((total, close) => total + close.kb, 0);

const startKbOf = (run: DayRun): number =>
	PIN_START_KB_PER_GATE * run.startedAtGate + run.warmBootKb;

const dayStartKbOf = (run: DayRun): number =>
	run.closesBefore.at(-1)?.storageKbAfter ?? startKbOf(run);

export const kbSpentOf = (run: DayRun): number =>
	Math.max(0, dayStartKbOf(run) + kbGeneratedOf(run) - run.storageKb);

export const isComeback = (run: DayRun): boolean => {
	const last = lastCloseOf(run);
	if (last === undefined || !last.cleared) return false;
	return [...run.closesBefore, ...run.closes].some(
		(close) => close.gate === last.gate && !close.cleared
	);
};

export const dayRunOn =
	(date: string) =>
	(run: Omit<DayRun, "closesBefore">): DayRun | null => {
		const closedThatDay = (close: RecordedClose) => close.closedOn === date;
		const closes = run.closes.filter(closedThatDay);
		if (!run.fallen && closes.length === 0) return null;
		return {
			...run,
			closes,
			closesBefore: run.closes.filter((close) => !closedThatDay(close)),
		};
	};

const distinct = (ids: readonly string[]): readonly string[] => [
	...new Set(ids),
];

const extremeOf = (
	id: DayRecordId,
	runs: readonly DayRun[],
	figureOf: (run: DayRun) => number,
	pick: (...values: number[]) => number
): DayRecord | null => {
	if (runs.length === 0) return null;
	const figure = pick(...runs.map(figureOf));
	return {
		id,
		figure,
		holderIds: distinct(
			runs.filter((run) => figureOf(run) === figure).map((run) => run.userId)
		),
	};
};

const highestOf = (
	id: DayRecordId,
	runs: readonly DayRun[],
	figureOf: (run: DayRun) => number
): DayRecord | null =>
	extremeOf(
		id,
		runs.filter((run) => figureOf(run) > 0),
		figureOf,
		Math.max
	);

const totalOf = (
	id: DayRecordId,
	runs: readonly DayRun[],
	figureOf: (run: DayRun) => number
): DayRecord | null => {
	const top = highestOf(id, runs, figureOf);
	if (top === null) return null;
	const figure = runs.reduce((total, run) => total + figureOf(run), 0);
	return { ...top, figure };
};

const weightOf = (run: DayRun): number => publicWeightOf(run.build);

const comebackOf = (runs: readonly DayRun[]): DayRecord | null => {
	const holderIds = distinct(runs.filter(isComeback).map((run) => run.userId));
	return holderIds.length === 0
		? null
		: { id: "comeback", figure: holderIds.length, holderIds };
};

const topConfigOf = (runs: readonly DayRun[]): DayRecord | null => {
	const holdersByConfig = new Map<
		string,
		{ label: string; holders: Set<string> }
	>();
	for (const run of runs)
		for (const config of run.build.configs) {
			const entry = holdersByConfig.get(config.id) ?? {
				label: config.label,
				holders: new Set<string>(),
			};
			holdersByConfig.set(config.id, {
				...entry,
				holders: entry.holders.add(run.userId),
			});
		}
	const [top] = [...holdersByConfig.entries()].sort(
		([, a], [, b]) => b.holders.size - a.holders.size
	);
	if (top === undefined) return null;
	const [configId, { label, holders }] = top;
	return {
		id: "top-config",
		configId,
		configLabel: label,
		figure: holders.size,
		holderIds: [...holders],
	};
};

const isRecord = (record: DayRecord | null): record is DayRecord =>
	record !== null;

export const dayRecordsOf = (runs: readonly DayRun[]): readonly DayRecord[] => {
	const built = runs.filter((run) => run.build.configs.length > 0);
	return [
		highestOf("biggest-build", built, weightOf),
		extremeOf("lightest-build", built, weightOf, Math.min),
		comebackOf(runs),
		highestOf("most-audits", runs, (run) => auditCountOf(run.auditSchedule)),
		topConfigOf(runs),
		highestOf("priciest-build", built, (run) => buildCostOf(run.build)),
		totalOf("kb-generated", runs, kbGeneratedOf),
		totalOf("kb-spent", runs, kbSpentOf),
	].filter(isRecord);
};
