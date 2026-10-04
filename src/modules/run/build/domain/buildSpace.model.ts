import { emptySlotCreditPerSlotKb } from "~/modules/run/config/domain/config.model";
import {
	type Build,
	occupiedSlots,
} from "~/modules/run/build/domain/build.model";
import {
	BUILD_SPACE_RUNGS,
	type BuildSpaceRung,
} from "~/modules/run/run/domain/rules.model";

export type SpaceHolder = {
	readonly build: Build;
	readonly spaceDroppedTo?: number;
};

export type BuildSpace = {
	readonly weight: number;
	readonly space: number;
	readonly freeWeight: number;
	readonly emptyCreditKb: number;
	readonly upkeepKb: number;
	readonly cap: number;
	readonly roomLeft: number;
	readonly overflow: number;
};

export type UpkeepSettlement = {
	readonly paidKb: number;
	readonly droppedTo?: number;
};

const FREE_RUNG = BUILD_SPACE_RUNGS[0];
const TOP_RUNG = BUILD_SPACE_RUNGS[BUILD_SPACE_RUNGS.length - 1];

export const rungFitting = (weight: number): BuildSpaceRung =>
	BUILD_SPACE_RUNGS.find((rung) => rung.weight >= weight) ?? TOP_RUNG;

const widestRungCovered = (balanceKb: number): BuildSpaceRung =>
	BUILD_SPACE_RUNGS.filter((rung) => rung.kb <= Math.max(0, balanceKb)).at(
		-1
	) ?? FREE_RUNG;

const billableWeightOf = (build: Build): number =>
	occupiedSlots(
		build.configs.filter((config) => config.id !== build.vendorLockedConfigId)
	);

export const buildSpaceOf = ({
	build,
	spaceDroppedTo,
}: SpaceHolder): BuildSpace => {
	const weight = billableWeightOf(build);
	const rung = rungFitting(weight);
	const freeWeight = Math.max(0, rung.weight - weight);
	const emptyCreditKb = emptySlotCreditPerSlotKb(build.configs) * freeWeight;
	const cap = spaceDroppedTo ?? TOP_RUNG.weight;

	return {
		weight,
		space: rung.weight,
		freeWeight,
		emptyCreditKb,
		upkeepKb: Math.max(0, rung.kb - emptyCreditKb),
		cap,
		roomLeft: Math.max(0, cap - weight),
		overflow: Math.max(0, weight - cap),
	};
};

export const fitsBuildSpace = (holder: SpaceHolder, slots: number): boolean =>
	slots <= buildSpaceOf(holder).roomLeft;

export const settleUpkeep = (
	build: Build,
	balanceKb: number
): UpkeepSettlement => {
	const owedKb = buildSpaceOf({ build }).upkeepKb;
	if (owedKb <= balanceKb) return { paidKb: owedKb };

	const covered = widestRungCovered(balanceKb);
	return { paidKb: covered.kb, droppedTo: covered.weight };
};
