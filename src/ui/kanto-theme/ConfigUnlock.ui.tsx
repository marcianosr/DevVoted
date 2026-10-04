import { Badge } from "./Badge.ui";
import { Figures } from "./Figures.ui";
import { Meter } from "./Meter.ui";

const COPY = {
	unlockLead: "unlock",
	alternativeLead: "or",
} as const;

const LINES = "flex flex-col gap-1.5";
const PATH = "flex flex-wrap items-center gap-1.5 text-xs text-theme-muted";
const ALTERNATIVE = "flex items-center gap-2 text-xs text-theme-muted";
const ALTERNATIVE_BAR = "min-w-0 flex-1";
const COUNT = "shrink-0 tabular-nums";
const READER_ONLY = "sr-only";

const SEPARATOR = "·";

export type UnlockProgress = { count: number; target: number };

export type ConfigUnlockPath = {
	text: string;
	progress: UnlockProgress | null;
};

export const unlockLabelOf = (path: ConfigUnlockPath): string =>
	`${COPY.unlockLead} ${SEPARATOR} ${path.text}`;

export const alternativeLabelOf = (path: ConfigUnlockPath): string =>
	`${COPY.alternativeLead} ${SEPARATOR} ${path.text}`;

export const progressLabelOf = ({ count, target }: UnlockProgress): string =>
	`${count}/${target}`;

const Alternative = ({ path }: { path: ConfigUnlockPath }) => {
	if (path.progress === null)
		return (
			<span className={PATH}>
				<Figures text={alternativeLabelOf(path)} />
			</span>
		);

	return (
		<span className={ALTERNATIVE}>
			<span className={READER_ONLY}>{alternativeLabelOf(path)}</span>
			<span aria-hidden>{COPY.alternativeLead}</span>
			<span className={ALTERNATIVE_BAR}>
				<Meter value={path.progress.count} max={path.progress.target} />
			</span>
			<span className={COUNT}>{progressLabelOf(path.progress)}</span>
		</span>
	);
};

export type ConfigUnlockProps = {
	paths: readonly ConfigUnlockPath[];
};

export const ConfigUnlock = ({ paths }: ConfigUnlockProps) => {
	const [required, ...alternatives] = paths;

	return (
		<div className={LINES}>
			<span className={PATH}>
				<Figures text={unlockLabelOf(required)} />
				{required.progress === null ? null : (
					<Badge>{progressLabelOf(required.progress)}</Badge>
				)}
			</span>
			{alternatives.map((path) => (
				<Alternative key={path.text} path={path} />
			))}
		</div>
	);
};
