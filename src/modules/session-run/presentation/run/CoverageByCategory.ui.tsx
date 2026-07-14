import { getCategories } from "~/domains/shared/categories";
import { categoryTheme } from "~/ui/theme/categoryTheme";
import { Paragraph } from "~/ui/typography/Paragraph.component";
import { Subtitle } from "~/ui/typography/Subtitle.component";

type CoverageByCategoryProps = {
	coverageByCategory: Readonly<Record<string, number>>;
};

export const CoverageByCategory = ({
	coverageByCategory,
}: CoverageByCategoryProps) => {
	const covered = getCategories()
		.map(({ code, name }) => ({
			code,
			name,
			pct: coverageByCategory[code] ?? 0,
		}))
		.filter(({ pct }) => pct > 0);

	if (covered.length === 0) return null;

	return (
		<section className="flex flex-col gap-2">
			<header>
				<Subtitle>Coverage by category</Subtitle>
				<Paragraph>Shows categories you participated in</Paragraph>
			</header>
			<div className="flex flex-wrap gap-3">
				{covered.map(({ code, name, pct }) => (
					<span
						key={code}
						{...categoryTheme(code)}
						className="flex items-center gap-1.5 rounded-lg border border-theme px-3 py-1.5 text-sm"
					>
						<span className="inline-block h-3.5 w-3.5 rounded bg-theme" />
						<span className="font-bold text-theme">{name}</span>
						<span className="text-zinc-300">{pct}%</span>
					</span>
				))}
			</div>
		</section>
	);
};
