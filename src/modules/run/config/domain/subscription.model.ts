import type { Config } from "~/modules/run/config/domain/config.model";

export type Billing = {
	readonly configs: readonly Config[];
	readonly paidKb: number;
	readonly lapsed: readonly Config[];
};

const isSubscription = (config: Config): boolean =>
	config.subscriptionKb !== undefined;

export const subscriptionBillFor = (config: Config, gate: number): number =>
	config.subscriptionKb === undefined
		? 0
		: config.subscriptionKb *
			(config.subscriptionGrowthPerGate ?? 1) ** Math.max(0, gate);

export const subscriptionBillTotal = (
	configs: readonly Config[],
	gate: number
): number =>
	configs.reduce(
		(total, config) => total + subscriptionBillFor(config, gate),
		0
	);

export const billSubscriptionsOnClear = (
	configs: readonly Config[],
	storage: number,
	gate: number
): Billing => {
	if (!configs.some(isSubscription)) return { configs, paidKb: 0, lapsed: [] };

	const kept: Config[] = [];
	const lapsed: Config[] = [];
	let balance = storage;

	for (const config of configs) {
		const bill = subscriptionBillFor(config, gate);
		if (bill === 0) {
			kept.push(config);
			continue;
		}
		if (bill > balance) {
			lapsed.push(config);
			continue;
		}
		balance -= bill;
		kept.push(config);
	}

	return { configs: kept, paidKb: storage - balance, lapsed };
};

export type BillLine = {
	readonly id: string;
	readonly label: string;
	readonly kb: number;
	/** The plan bills on every attempt (ADR-035); a config subscription bills on
	 * clears only, so a redo is free for it. */
	readonly billedOnMiss: boolean;
};

export type BillLedger = {
	readonly lines: readonly BillLine[];
	readonly totalKb: number;
	readonly onMissKb: number;
	readonly shortfallKb: number;
};

type BillLedgerInput = {
	readonly configs: readonly Config[];
	readonly gate: number;
	readonly storageKb: number;
	readonly planBillKb: number;
	readonly planTier: number;
};

/** Takes the plan as primitives rather than the run aggregate's `StoragePlan`,
 * so the config aggregate keeps no upward dependency. */
export const billLedger = ({
	configs,
	gate,
	storageKb,
	planBillKb,
	planTier,
}: BillLedgerInput): BillLedger => {
	const planLines: readonly BillLine[] =
		planBillKb > 0
			? [
					{
						id: "storage-plan",
						label: `Storage plan, tier ${planTier}`,
						kb: planBillKb,
						billedOnMiss: true,
					},
				]
			: [];

	const lines = [
		...planLines,
		...configs.filter(isSubscription).map((config) => ({
			id: config.id,
			label: config.label,
			kb: subscriptionBillFor(config, gate),
			billedOnMiss: false,
		})),
	];
	const totalKb = lines.reduce((sum, line) => sum + line.kb, 0);

	return {
		lines,
		totalKb,
		onMissKb: lines
			.filter((line) => line.billedOnMiss)
			.reduce((sum, line) => sum + line.kb, 0),
		shortfallKb: Math.max(0, totalKb - storageKb),
	};
};
