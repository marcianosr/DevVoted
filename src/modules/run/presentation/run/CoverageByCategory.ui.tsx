import { getCategories } from "~/domains/shared/categories";
import { Swatch } from "~/ui/Swatch.component";
import { categoryTheme } from "~/ui/theme/categoryTheme";
import { Subtitle } from "~/ui/typography/Subtitle.component";
import { Title } from "~/ui/typography/Title.component";

type CoverageByCategoryProps = {
	coverageByCategory: Readonly<Record<string, number>>;
	title?: string;
	subtitle?: string;
	/** Prefixes each value — e.g. "+" when the numbers are gains. */
	prefix?: string;
};

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
		.filter(({ pct }) => pct > 0);

	if (covered.length === 0) return null;

	return (
		<section className="flex flex-col gap-2">
			{title ? (
				<header>
					<Title>{title}</Title>
					{subtitle ? <Subtitle>{subtitle}</Subtitle> : null}
				</header>
			) : null}
			<div className="flex flex-wrap gap-2">
				{covered.map(({ code, name, pct }) => (
					<span
						key={code}
						{...categoryTheme(code)}
						className="flex items-center gap-1.5 rounded-lg border border-theme px-3 py-1.5 text-sm"
					>
						<Swatch />
						<span className="font-bold text-theme">{name}</span>
						<span className="text-zinc-300">
							{prefix}
							{pct}%
						</span>
					</span>
				))}
			</div>
		</section>
	);
};
