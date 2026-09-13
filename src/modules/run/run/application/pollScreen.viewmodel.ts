import {
	abArmLabel,
	type Config,
	otherArmOf,
} from "~/modules/run/config/domain/config.model";
import { chipFor } from "~/modules/run/config/application/configChip.viewmodel";
import {
	gateSwatchAt,
	swatchTrackTo,
} from "~/modules/run/gate/application/swatchTrack.viewmodel";
import type { AuditView } from "~/modules/run/run/application/gateStake.viewmodel";
import {
	BALANCE_WORD,
	fundsOf,
} from "~/modules/run/run/application/prepScreen.viewmodel";
import type { RunView } from "~/modules/run/run/application/runView.viewmodel";
import type { PaidRefusal } from "~/modules/run/run/domain/paidAction.model";
import { VICTORY_GATE } from "~/modules/run/run/domain/rules.model";
import { CATEGORY_METADATA, type CategoryCode } from "~/shared/lib/categories";
import { kbLabel } from "~/shared/lib/storage";

import type { AuditProps } from "~/ui/kanto-theme/Audit.ui";
import type { BuildCounts } from "~/ui/kanto-theme/BuildFooter.ui";
import type { BuildProps } from "~/ui/kanto-theme/Build.ui";
import type { ConfigChipBadge } from "~/ui/kanto-theme/ConfigChip.ui";
import type { CoverageBarProps } from "~/ui/kanto-theme/CoverageBar.ui";
import type { HeaderProps } from "~/ui/kanto-theme/Header.ui";
import type { TrailProps } from "~/ui/kanto-theme/Trail.ui";

const OPTION_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const OFFLINE_NOTE = "an audit has these offline this gate";
const HIDDEN_CATEGORY = "?????";

export const letterAt = (index: number): string => OPTION_LETTERS[index] ?? "?";

export const categoryNameOf = (view: RunView, code: string): string =>
	view.categoryHidden
		? HIDDEN_CATEGORY
		: (CATEGORY_METADATA[code as keyof typeof CATEGORY_METADATA]?.name ?? code);

export const auditPropsOf = (
	audits: readonly AuditView[]
): readonly AuditProps[] =>
	audits
		.filter((audit) => !audit.suppressed)
		.map((audit) => ({
			code: audit.code,
			name: audit.name,
			cue: audit.answerCue ?? audit.description,
		}));

const GATE_SEPARATOR = "·";

/**
 * The one place this screen names a gate. The header used to fall back to its
 * own copy of the string and the close button needs the same words, so both read
 * it from here rather than drifting apart.
 */
export const gateLabelFor = (gate: number): string => {
	const swatch = gateSwatchAt(gate);

	return `Gate ${swatch.gate} ${GATE_SEPARATOR} ${swatch.gateName}`;
};

export const pollHeaderFor = (
	view: RunView,
	bar: CoverageBarProps
): HeaderProps => {
	const gate = view.gateStake.gateNumber;

	return {
		swatch: gateSwatchAt(gate),
		title: gateLabelFor(gate),
		gateCount: VICTORY_GATE,
		swatches: swatchTrackTo(gate),
		funds: fundsOf(view.storage, BALANCE_WORD),
		swatchState: "current",
		bar,
	};
};

export const pollBarFor = (view: RunView, pin = false): CoverageBarProps => ({
	...view.gateStake.coverageLadder,
	held: view.gateStake.coverageHeld,
	pin,
});

const holdsFor = (view: RunView): string | undefined => {
	const count = view.correctAnswersThisGate;
	if (count === null) return undefined;
	const word = view.mirroredPolls ? "incorrect" : "correct";
	return `${count} ${word} ${count === 1 ? "answer" : "answers"} in this gate`;
};

export const trailFor = (view: RunView): TrailProps => ({
	count: view.pollsPerGate,
	current: Math.min(view.answeredThisGate.length + 1, view.pollsPerGate),
	verdicts: view.answeredThisGate.map((answer) => answer.outcome),
	holds: holdsFor(view),
});

const offlineIdsOf = (view: RunView): ReadonlySet<string> =>
	new Set(view.offlineConfigs.map((offline) => offline.config.id));

export type PressAction = "lint" | "peek" | "switch-arm";

export type PollPress = {
	readonly configId: string;
	readonly action: PressAction;
	readonly label: string;
	readonly ready: boolean;
	readonly refusal: string | undefined;
};

const REFUSAL_COPY: Record<PaidRefusal, string> = {
	offline: "offline",
	otherCategory: "waits for another category",
	frozen: "frozen",
	rateLimited: "rate limited",
	lastWrongStanding: "one wrong left",
	alreadyPeeked: "already read",
	cannotAfford: "cannot afford",
};

const categoriesWord = (categories: readonly CategoryCode[]): string =>
	categories.map((code) => code.toUpperCase()).join(" or ");

const lintRefusalCopy = (
	config: Config,
	refusal: PaidRefusal | undefined
): string | undefined => {
	if (refusal === undefined) return undefined;
	if (refusal !== "otherCategory") return REFUSAL_COPY[refusal];
	const categories = config.eliminatesWrongOptionsFor ?? [];
	return categories.length === 0
		? REFUSAL_COPY.otherCategory
		: `waits for ${categoriesWord(categories)}`;
};

const pressesOf = (view: RunView): readonly PollPress[] => {
	const { lintReady, lintCost, lintRefusal } = view.paidActions;
	const { peekReady, peekCost, peekRefusal } = view.paidActions;

	return view.configs.flatMap((config): PollPress[] => {
		if (config.eliminatesWrongOptionsFor !== undefined)
			return [
				{
					configId: config.id,
					action: "lint",
					label: `lint ${kbLabel(lintCost)}`,
					ready: lintReady && view.paidActions.linter?.id === config.id,
					refusal: lintRefusalCopy(config, lintRefusal),
				},
			];

		if (config.peeksCommunitySplit === true)
			return [
				{
					configId: config.id,
					action: "peek",
					label: `peek ${kbLabel(peekCost)}`,
					ready: peekReady,
					refusal:
						peekRefusal === undefined ? undefined : REFUSAL_COPY[peekRefusal],
				},
			];

		const arm = otherArmOf(config);
		if (arm !== undefined)
			return [
				{
					configId: config.id,
					action: "switch-arm",
					label: `ship ${abArmLabel(arm)}`,
					ready: true,
					refusal: undefined,
				},
			];

		return [];
	});
};

/**
 * One source for both the chip badges and the footer count, so the count can
 * never again promise a press the screen does not draw (ADR-069).
 */
export const pollPressesOf = (view: RunView): readonly PollPress[] => {
	const offline = offlineIdsOf(view);
	return pressesOf(view).filter((press) => !offline.has(press.configId));
};

export const buildCountsOf = (view: RunView): BuildCounts => {
	const offline = offlineIdsOf(view);
	const ready = new Set(
		pollPressesOf(view)
			.filter((press) => press.ready)
			.map((press) => press.configId)
	);
	const online = view.configs.filter(
		(config) =>
			!offline.has(config.id) &&
			view.configStatuses[config.id]?.kind === "online"
	);

	return {
		applies: online.filter((config) => !ready.has(config.id)).length,
		ready: online.filter((config) => ready.has(config.id)).length,
		offline: offline.size,
		changing: 0,
	};
};

export type PressHandlers = {
	readonly onPress?: (action: PressAction, configId: string) => void;
};

/**
 * A refused press wears its reason as the label. `hint` only reaches the DOM as
 * an aria-label, which no sighted player reads and which would replace the
 * button's own name for everyone else.
 */
const badgesFor = (
	press: PollPress | undefined,
	onPress: PressHandlers["onPress"]
): ConfigChipBadge[] => {
	if (press === undefined || onPress === undefined) return [];

	return [
		{
			label: press.ready ? press.label : (press.refusal ?? press.label),
			onPress: () => onPress(press.action, press.configId),
			disabled: !press.ready,
		},
	];
};

export const pollBuildFor = (
	view: RunView,
	panels: Pick<BuildProps, "openInfo" | "onToggleInfo"> & PressHandlers = {}
): BuildProps => {
	const { onPress, ...rest } = panels;
	const offline = offlineIdsOf(view);
	const presses = new Map(
		pollPressesOf(view).map((press) => [press.configId, press])
	);
	const chip = (config: Config, note?: string) => ({
		name: config.label,
		badges: badgesFor(presses.get(config.id), onPress),
		...chipFor(config, note),
	});

	return {
		configs: view.configs
			.filter((config) => !offline.has(config.id))
			.map((config) => chip(config)),
		skipped: view.offlineConfigs.map((entry) =>
			chip(entry.config, entry.audit)
		),
		skippedNote: view.offlineConfigs.length === 0 ? undefined : OFFLINE_NOTE,
		...rest,
	};
};
