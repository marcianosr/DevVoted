import { freeSlots } from "~/modules/run/build/domain/build.model";
import { type RunState, withLog } from "~/modules/run/run/domain/run.model";
import {
	MAX_SLOTS,
	nextSlotPriceKb,
} from "~/modules/run/run/domain/rules.model";

export const START_SLOT_PREMIUM = 2;

const atPremium = (kb: number | undefined): number | undefined =>
	kb === undefined ? undefined : kb * START_SLOT_PREMIUM;

const bought = (state: RunState): number => state.slotsBought ?? 0;

const beforeTheRun = (state: RunState): boolean =>
	state.status === "configuring";

export const startSlotPriceKb = (state: RunState): number | undefined =>
	state.build.slots >= MAX_SLOTS
		? undefined
		: atPremium(nextSlotPriceKb(bought(state)));

export const startSlotRefundKb = (state: RunState): number | undefined =>
	atPremium(nextSlotPriceKb(bought(state) - 1));

export const canBuyStartSlot = (
	state: RunState,
	archiveKb: number
): boolean => {
	const price = startSlotPriceKb(state);
	return beforeTheRun(state) && price !== undefined && archiveKb >= price;
};

export const canRefundStartSlot = (state: RunState): boolean =>
	beforeTheRun(state) &&
	startSlotRefundKb(state) !== undefined &&
	freeSlots(state.build) > 0;

export type ArchiveSpend = {
	readonly state: RunState;
	readonly archiveKb: number;
};

export const buyStartSlot = (
	state: RunState,
	archiveKb: number
): ArchiveSpend => {
	const price = startSlotPriceKb(state);
	if (price === undefined || !canBuyStartSlot(state, archiveKb))
		return { state, archiveKb };

	const slots = state.build.slots + 1;
	return {
		archiveKb: archiveKb - price,
		state: {
			...state,
			slotsBought: bought(state) + 1,
			build: { ...state.build, slots },
			log: withLog(
				state,
				`Opened on a slot bought for ${price}KB of archive — ${slots} wide.`
			),
		},
	};
};

export const refundStartSlot = (
	state: RunState,
	archiveKb: number
): ArchiveSpend => {
	const refund = startSlotRefundKb(state);
	if (refund === undefined || !canRefundStartSlot(state))
		return { state, archiveKb };

	const slots = state.build.slots - 1;
	return {
		archiveKb: archiveKb + refund,
		state: {
			...state,
			slotsBought: bought(state) - 1,
			build: { ...state.build, slots },
			log: withLog(
				state,
				`Handed a slot back for ${refund}KB of archive — ${slots} wide.`
			),
		},
	};
};
