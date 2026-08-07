import { getCategories } from "~/domains/shared/categories";
import { Paragraph } from "~/ui/typography/Paragraph.component";
import { Subtitle } from "~/ui/typography/Subtitle.component";
import { Title } from "~/ui/typography/Title.component";

type CoverageByCategoryProps = {
	coverageByCategory: Readonly<Record<string, number>>;
	title?: string;
	subtitle?: string;
	/** Prefixes each value — e.g. "+" when the numbers are gains. */
	prefix?: string;
};

/**
 * The coverage split, biggest earner first, as a two-column list of ruled rows.
 * Ranked rather than kept in category order: the question the split answers is
 * "where did this come from", and a row of equal-looking chips made you read all
 * of them to find that out. The rule under each row is what lets a name on the
 * left and a number on the right read as one line across the gap.
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
					<Title>{title}</Title>
					{subtitle ? <Subtitle>{subtitle}</Subtitle> : null}
				</header>
			) : null}
			<div className="grid gap-x-12 sm:grid-cols-2">
				{covered.map(({ code, name, pct }) => (
					<div
						key={code}
						className="flex items-baseline justify-between gap-6 border-b border-zinc-800 py-2"
					>
						<Paragraph as="span" size="sm">
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
					</div>
				))}
			</div>
		</section>
	);
};
