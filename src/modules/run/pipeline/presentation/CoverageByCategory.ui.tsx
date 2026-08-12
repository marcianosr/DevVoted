import { getCategories } from "~/domains/shared/categories";
import { Paragraph } from "~/ui/typography/Paragraph.component";
import { Subtitle } from "~/ui/typography/Subtitle.component";

type CoverageByCategoryProps = {
	coverageByCategory: Readonly<Record<string, number>>;
	title?: string;
	subtitle?: string;
	/** Prefixes each value — e.g. "+" when the numbers are gains. */
	prefix?: string;
};

/**
 * The coverage split, biggest earner first, as one flowing line of
 * name-and-percentage pairs. Ranked rather than kept in category order: the
 * question the split answers is "where did this come from", and a row of
 * equal-looking chips made you read all of them to find that out. A single
 * dot-separated line reads as a footnote to the payout above it, rather than
 * a second ledger competing for the same attention.
 */
export const CoverageByCategory = ({
	coverageByCategory,
	title,
	subtitle,
	prefix = "",
}: CoverageByCategoryProps) => {
	const covered = getCategories()
		.map(({ code, name }) => ({
			code,
			name,
			pct: coverageByCategory[code] ?? 0,
		}))
		.filter(({ pct }) => pct > 0)
		.sort((left, right) => right.pct - left.pct);

	if (covered.length === 0) return null;

	return (
		<section className="flex flex-col gap-2">
			{title ? (
				<header>
					<Subtitle>{title}</Subtitle>
					{subtitle ? <Paragraph tone="muted">{subtitle}</Paragraph> : null}
				</header>
			) : null}
			<Paragraph as="div" size="sm" className="flex flex-wrap gap-2">
				{covered.map(({ code, name, pct }, index) => (
					<span key={code} className="flex items-baseline gap-2">
						{index > 0 ? <span className="text-zinc-600">·</span> : null}
						<Paragraph as="span" size="sm" className="font-bold">
							{name}
						</Paragraph>
						<Paragraph
							as="span"
							size="sm"
							tone="viridian"
							className="font-bold tabular-nums"
						>
							{prefix}
							{pct}%
						</Paragraph>
					</span>
				))}
			</Paragraph>
		</section>
	);
};
