import type { SkipReason } from "~/modules/run/config/domain/effect.model";

const SKIP_COPY = {
	openerOnly: "the gate's first poll only",
	cacheCold: "the cache is cold here",
	paysAtGateClear: "pays at the gate clear",
	paysOnPeel: "pays at the peel",
	billsAtGateClear: "bills at the gate clear",
	inShop: "applies in the shop",
	noAuditToSuppress: "no audit to suppress here",
	runCapReached: "the run's storage cap is spent",
	notThisPoll: "not on this poll",
} as const satisfies Record<
	Exclude<SkipReason["kind"], "otherCategories">,
	string
>;

const CATEGORY_LIST = new Intl.ListFormat("en", {
	style: "long",
	type: "conjunction",
});

export const skipCopy = (why: SkipReason): string =>
	why.kind === "otherCategories"
		? `${CATEGORY_LIST.format([...why.categories])} only`
		: SKIP_COPY[why.kind];
