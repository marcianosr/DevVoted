import {
	isServiceUnlocked,
	REGISTRY_CONTROL_LIST,
	type RegistryControlSpec,
} from "~/modules/run/shop/domain/registryControl.model";

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
