import { Button } from "~/ui/kanto-theme/Button.ui";
import { Climber } from "~/ui/kanto-theme/Climber.ui";
import type { KantoColor } from "~/ui/kanto-theme/colors";
import { Link } from "~/ui/kanto-theme/Link.ui";
import { Typography } from "~/ui/kanto-theme/Typography.ui";

export const COPY = {
	legend: "Advertisement",
	dismiss: (title: string) => `Dismiss ${title}`,
	cookie: "🍪",
} as const;

const THEME: KantoColor = "viridian";
const DISMISS_GLYPH = "×";

const CARD =
	"relative flex flex-wrap items-center gap-4 rounded-2xl sm:flex-nowrap border border-theme-faint bg-theme-faint px-4 pt-5 pb-4";
const LEGEND =
	"absolute -top-2 left-4 rounded-xs bg-theme-raised px-1.5 text-[10px] leading-4 font-bold tracking-widest text-theme-muted uppercase";
const COOKIE = "flex size-9 shrink-0 items-center justify-center text-2xl";
const COPY_BLOCK = "flex min-w-0 flex-1 basis-48 flex-col gap-0.5";
const ACTIONS = "ml-auto flex shrink-0 items-center gap-2";

const STRIP =
	"flex min-w-0 items-center gap-2 rounded-md border border-theme-faint bg-theme-faint px-3 py-1.5 text-xs";
const STRIP_LEGEND =
	"shrink-0 rounded-xs bg-theme-raised px-1 text-[10px] font-bold tracking-widest text-theme-muted uppercase";
const STRIP_TITLE = "shrink-0 font-bold text-theme-soft";
const STRIP_TEXT = "min-w-0 truncate text-theme-muted";
const STRIP_CTA = "ml-auto shrink-0";

export type AdvertisementIcon =
	| { kind: "cookie" }
	| { kind: "face"; name: string; photoUrl?: string; borderUrl: string };

export type AdvertisementCta = { label: string; href: string };

export type AdvertisementCardProps = {
	title: string;
	text: string;
	icon: AdvertisementIcon;
	cta: AdvertisementCta;
	variant?: "card" | "strip";
	onDismiss?: () => void;
};

const Icon = ({ icon }: { icon: AdvertisementIcon }) =>
	icon.kind === "cookie" ? (
		<span aria-hidden className={COOKIE}>
			{COPY.cookie}
		</span>
	) : (
		<Climber
			name={icon.name}
			photoUrl={icon.photoUrl}
			borderUrl={icon.borderUrl}
			size="lg"
		/>
	);

const Strip = ({ title, text, cta }: AdvertisementCardProps) => (
	<aside aria-label={COPY.legend} data-screen-theme={THEME} className={STRIP}>
		<span className={STRIP_LEGEND}>{COPY.legend}</span>
		<span className={STRIP_TITLE}>{title}</span>
		<span className={STRIP_TEXT}>{text}</span>
		<span className={STRIP_CTA}>
			<Link href={cta.href}>{cta.label}</Link>
		</span>
	</aside>
);

const Card = ({
	title,
	text,
	icon,
	cta,
	onDismiss,
}: AdvertisementCardProps) => (
	<aside aria-label={COPY.legend} data-screen-theme={THEME} className={CARD}>
		<span className={LEGEND}>{COPY.legend}</span>
		<Icon icon={icon} />
		<div className={COPY_BLOCK}>
			<Typography variant="accent" as="p">
				{title}
			</Typography>
			<Typography variant="hint">{text}</Typography>
		</div>
		<div className={ACTIONS}>
			<Button tone="action" label={cta.label} href={cta.href} />
			{onDismiss === undefined ? null : (
				<Button
					tone="ambient"
					glyph={DISMISS_GLYPH}
					label={COPY.dismiss(title)}
					onPress={onDismiss}
				/>
			)}
		</div>
	</aside>
);

export const AdvertisementCard = (props: AdvertisementCardProps) =>
	props.variant === "strip" ? <Strip {...props} /> : <Card {...props} />;
