import { APPROVED_POLL_ARCHIVE_KB } from "~/modules/polls/poll/domain/poll.model";
import { CATEGORY_CODES, type CategoryCode } from "~/shared/lib/categories";

export type CategoryBounty = {
	readonly code: CategoryCode;
	readonly published: number;
	readonly bountyKb: number;
};

export type PublishedCounts = Partial<Record<CategoryCode, number>>;

const BOUNTY_TIERS = [
	{ below: 10, kb: 48 },
	{ below: 25, kb: 32 },
] as const;

export const bountyKbFor = (publishedCount: number): number =>
	BOUNTY_TIERS.find(({ below }) => publishedCount < below)?.kb ??
	APPROVED_POLL_ARCHIVE_KB;

export const isThinCategory = (bounty: CategoryBounty): boolean =>
	bounty.bountyKb > APPROVED_POLL_ARCHIVE_KB;

export const categoryBountiesOf = (counts: PublishedCounts): CategoryBounty[] =>
	CATEGORY_CODES.map((code) => {
		const published = counts[code] ?? 0;
		return { code, published, bountyKb: bountyKbFor(published) };
	});
