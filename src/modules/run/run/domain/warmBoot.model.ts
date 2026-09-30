import { formatStorage, kbLabel } from "~/shared/lib/storage";

import { bootCacheRungAt } from "~/modules/run/run/domain/rules.model";
import {
	addStorage,
	type RunState,
	type WarmBoot,
	withLog,
} from "~/modules/run/run/domain/run.model";
import {
	isCarriedService,
	isServiceUnlocked,
	REGISTRY_CONTROLS,
	type RegistryControlId,
	registryControlOf,
} from "~/modules/run/shop/domain/registryControl.model";

export type WarmBootPick = {
	readonly bootCacheRung?: number;
	readonly serviceIds: readonly RegistryControlId[];
};

export type WarmBootRefusal =
	"empty" | "no-rung" | "locked" | "uncarriable" | "repeated";

const NOTHING = 0;

const isEmpty = (pick: WarmBootPick): boolean =>
	pick.bootCacheRung === undefined && pick.serviceIds.length === NOTHING;

const hasRepeat = (serviceIds: readonly RegistryControlId[]): boolean =>
	new Set(serviceIds).size !== serviceIds.length;

const rungOf = (pick: WarmBootPick) =>
	pick.bootCacheRung === undefined
		? undefined
		: bootCacheRungAt(pick.bootCacheRung);

const unlockedIn =
	(unlockedServiceIds: readonly string[]) =>
	(id: RegistryControlId): boolean =>
		isServiceUnlocked(registryControlOf(id), unlockedServiceIds);

export const warmBootRefusalOf = (
	pick: WarmBootPick,
	unlockedServiceIds: readonly string[]
): WarmBootRefusal | null => {
	const unlocked = unlockedIn(unlockedServiceIds);
	if (isEmpty(pick)) return "empty";
	if (pick.bootCacheRung !== undefined && rungOf(pick) === undefined)
		return "no-rung";
	if (
		pick.bootCacheRung !== undefined &&
		!unlocked(REGISTRY_CONTROLS.bootCache.id)
	)
		return "locked";
	if (hasRepeat(pick.serviceIds)) return "repeated";
	if (!pick.serviceIds.map(registryControlOf).every(isCarriedService))
		return "uncarriable";
	if (!pick.serviceIds.every(unlocked)) return "locked";
	return null;
};

const carryBytesOf = (serviceIds: readonly RegistryControlId[]): number =>
	serviceIds.reduce(
		(sum, id) => sum + (registryControlOf(id).carryBytes ?? NOTHING),
		NOTHING
	);

export const warmBootOrderOf = (pick: WarmBootPick): WarmBoot => {
	const rung = rungOf(pick);
	return {
		storageKb: rung?.storageKb ?? NOTHING,
		serviceIds: pick.serviceIds,
		archiveBytes:
			(rung?.archiveBytes ?? NOTHING) + carryBytesOf(pick.serviceIds),
	};
};

export const carries = (
	state: { readonly warmBoot?: WarmBoot | null },
	id: RegistryControlId
): boolean => state.warmBoot?.serviceIds.includes(id) ?? false;

const bankedPartOf = (boot: WarmBoot): readonly string[] =>
	boot.storageKb > NOTHING ? [`${kbLabel(boot.storageKb)} banked`] : [];

const carriedPartOf = (boot: WarmBoot): readonly string[] =>
	boot.serviceIds.length > NOTHING
		? [
				`carrying ${boot.serviceIds
					.map((id) => registryControlOf(id).title)
					.join(", ")}`,
			]
		: [];

const bootLineOf = (boot: WarmBoot): string =>
	`Warm boot: ${[...bankedPartOf(boot), ...carriedPartOf(boot)].join(", ")} (-${formatStorage(boot.archiveBytes)} archive).`;

export const bootRun = (state: RunState, boot: WarmBoot): RunState => {
	if (state.warmBoot !== undefined) return state;
	return {
		...state,
		storage: addStorage(state.storage, boot.storageKb),
		warmBoot: boot,
		log: withLog(state, bootLineOf(boot)),
	};
};
