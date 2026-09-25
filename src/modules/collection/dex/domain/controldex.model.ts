import {
	isServiceUnlocked,
	REGISTRY_CONTROL_LIST,
	type RegistryControlSpec,
} from "~/modules/run/shop/domain/registryControl.model";

/** Every service the roster knows, earned or not: the Dex is the catalogue (ADR-116). */
export type ControldexEntry = {
	readonly control: RegistryControlSpec;
	readonly unlocked: boolean;
};

export const controldex = (
	unlockedServiceIds: readonly string[]
): readonly ControldexEntry[] =>
	REGISTRY_CONTROL_LIST.map((control) => ({
		control,
		unlocked: isServiceUnlocked(control, unlockedServiceIds),
	}));
