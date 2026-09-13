import { Audit, type AuditProps } from "./Audit.ui";
import { Author, type AuthorProps } from "./Author.ui";
import { BuildFooter, type BuildFooterProps } from "./BuildFooter.ui";
import { Header, type HeaderProps } from "./Header.ui";
import { Question, type QuestionProps } from "./Question.ui";
import { Screen, type ScreenWidth } from "./Screen.ui";
import { ScreenFooter, type ScreenFooterProps } from "./ScreenFooter.ui";
import type { TrailProps } from "./Trail.ui";
import { Typography } from "./Typography.ui";

const AUDITS = "flex w-full flex-wrap items-stretch gap-3";

export type PollScreenProps = {
	header: HeaderProps;
	buildFooter: BuildFooterProps;
	trail: TrailProps;
	question: QuestionProps;
	audits?: readonly AuditProps[];
	hint?: string;
	author?: AuthorProps;
	footer?: ScreenFooterProps;
	width?: ScreenWidth;
};

export const PollScreen = ({
	header,
	buildFooter,
	trail,
	question,
	audits = [],
	hint,
	author,
	footer,
	width,
}: PollScreenProps) => (
	<Screen gate={header.swatch.theme} width={width}>
		<Header {...header} />

		{audits.length === 0 ? null : (
			<div className={AUDITS}>
				{audits.map((audit, index) => (
					<Audit key={audit.code ?? index} {...audit} />
				))}
			</div>
		)}

		<Question {...question} trail={trail} />

		{hint === undefined ? null : <Typography variant="hint">{hint}</Typography>}

		{author === undefined ? null : <Author {...author} />}

		{footer === undefined ? null : <ScreenFooter {...footer} />}

		<BuildFooter {...buildFooter} />
	</Screen>
);
