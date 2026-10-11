import { clsx } from "clsx";

import type {
	LoginDemoCard,
	LoginHero,
} from "~/modules/account/auth/application/loginDemo.viewmodel";
import {
	Auth,
	type AuthProps,
} from "~/modules/account/auth/presentation/Auth.ui";
import { Badge } from "~/ui/kanto-theme/Badge.ui";
import { Button } from "~/ui/kanto-theme/Button.ui";
import type { KantoColor } from "~/ui/kanto-theme/colors";
import { CoverageBar } from "~/ui/kanto-theme/CoverageBar.ui";
import { Link } from "~/ui/kanto-theme/Link.ui";
import { Panel } from "~/ui/kanto-theme/Panel.ui";
import { Question } from "~/ui/kanto-theme/Question.ui";
import { Screen } from "~/ui/kanto-theme/Screen.ui";
import { Segmented, type SegmentedItem } from "~/ui/kanto-theme/Segmented.ui";
import { Typography } from "~/ui/kanto-theme/Typography.ui";

export const COPY = {
	headline: "Five dev polls a day.",
	question: "How far can you run?",
	github: "Continue with GitHub",
	githubPending: "Redirecting…",
	wiki: "Read how this game works",
	coverage: "coverage",
	method: "Sign in with",
	email: "Email",
	githubMethod: "GitHub",
} as const;

export type SignInMethod = "email" | "github";

const METHODS = [
	{ value: "email", label: COPY.email },
	{ value: "github", label: COPY.githubMethod },
] satisfies readonly SegmentedItem<SignInMethod>[];

const PAGE = "my-auto grid w-full gap-10 py-10 md:grid-cols-2 md:items-center";
const HERO = "flex min-w-0 flex-col gap-6";
const HEADLINE =
	"text-4xl leading-tight font-extrabold text-theme-faint md:text-5xl";
const ACCENT = "block text-theme";
const PITCH = "text-base leading-relaxed font-normal text-theme-soft";
const FIGURES = "flex flex-wrap gap-2";
const FIGURE =
	"inline-flex items-center gap-1.5 rounded-full border border-theme-faint px-3 py-1 text-sm";
const FIGURE_VALUE = "font-bold text-theme-faint tabular-nums";
const FIGURE_LABEL = "font-normal text-theme-muted";
const PRESS = "flex flex-col gap-3";
const UNDER_PRESS = "flex flex-col items-center gap-1 text-center";
const DEV_CORNER = "fixed right-4 bottom-4 z-10";
const CARD = "relative poll-card-enter";
const LEAVING = "poll-card-leave";
const REVEALED = "poll-card-revealed";
const CARD_META = "flex flex-wrap items-center gap-3 px-4 pt-4";
const CARD_COUNTER = "ml-auto";
const CARD_FOOTER = "flex w-full items-center gap-3";
const FOOTER_BAR = "min-w-0 grow";

export type GithubPressProps = { pending: boolean; onPress: () => void };

export type DevSignIn = {
	method: SignInMethod;
	onMethod: (method: SignInMethod) => void;
	email: AuthProps;
};

export type LoginScreenProps = {
	theme: KantoColor;
	hero: LoginHero;
	card: LoginDemoCard;
	github: GithubPressProps;
	wikiHref: string;
	devSignIn?: DevSignIn;
};

const GithubPress = ({ github }: Pick<LoginScreenProps, "github">) => (
	<Button
		size="xl"
		width="fill"
		tone="primary"
		icon="github"
		iconAt="lead"
		label={github.pending ? COPY.githubPending : COPY.github}
		disabled={github.pending}
		onPress={github.onPress}
	/>
);

const SignIn = ({
	github,
	devSignIn,
}: Pick<LoginScreenProps, "github" | "devSignIn">) => {
	if (devSignIn === undefined || devSignIn.method === "github") {
		return <GithubPress github={github} />;
	}

	return <Auth {...devSignIn.email} />;
};

const DevCorner = ({ devSignIn }: { devSignIn: DevSignIn }) => (
	<div className={DEV_CORNER}>
		<Segmented
			label={COPY.method}
			items={METHODS}
			value={devSignIn.method}
			onSelect={devSignIn.onMethod}
			look="joined"
		/>
	</div>
);

const Hero = ({
	hero,
	github,
	wikiHref,
	devSignIn,
}: Pick<LoginScreenProps, "hero" | "github" | "wikiHref" | "devSignIn">) => (
	<div className={HERO}>
		<h1 className={HEADLINE}>
			{COPY.headline}
			<span className={ACCENT}>{COPY.question}</span>
		</h1>
		<p className={PITCH}>{hero.pitch}</p>
		<div className={FIGURES}>
			{hero.figures.map((figure) => (
				<span key={figure.label} className={FIGURE}>
					<span className={FIGURE_VALUE}>{figure.value}</span>
					<span className={FIGURE_LABEL}>{figure.label}</span>
				</span>
			))}
		</div>
		<div className={PRESS}>
			<SignIn github={github} devSignIn={devSignIn} />
			<div className={UNDER_PRESS}>
				<Typography variant="caption">
					<Link href={wikiHref}>{COPY.wiki}</Link>
				</Typography>
			</div>
		</div>
	</div>
);

const DemoCard = ({ card }: Pick<LoginScreenProps, "card">) => (
	<Panel
		key={card.cardKey}
		className={clsx(CARD, card.leaving && LEAVING, card.revealed && REVEALED)}
	>
		<div className={CARD_META}>
			<Badge color={card.categoryColor}>{card.category}</Badge>
			<span className={CARD_COUNTER}>
				<Typography variant="hint" as="span">
					{card.counter}
				</Typography>
			</span>
		</div>
		<Panel.Body>
			<Question
				answerType="single"
				question={card.question}
				options={card.options}
				pickedIds={card.pickedIds}
			/>
		</Panel.Body>
		<Panel.Footer>
			<span className={CARD_FOOTER}>
				<Typography variant="hint" as="span">
					{COPY.coverage}
				</Typography>
				<span className={FOOTER_BAR}>
					<CoverageBar {...card.coverage} />
				</span>
			</span>
		</Panel.Footer>
	</Panel>
);

export const LoginScreen = ({
	theme,
	hero,
	card,
	github,
	wikiHref,
	devSignIn,
}: LoginScreenProps) => (
	<Screen theme={theme} width="wide" ground="bare" enter="rise">
		<div className={PAGE}>
			<Hero
				hero={hero}
				github={github}
				wikiHref={wikiHref}
				devSignIn={devSignIn}
			/>
			<DemoCard card={card} />
		</div>
		{devSignIn === undefined ? null : <DevCorner devSignIn={devSignIn} />}
	</Screen>
);
