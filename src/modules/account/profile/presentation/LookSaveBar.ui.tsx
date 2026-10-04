import { Button } from "~/ui/kanto-theme/Button.ui";

export const COPY = {
	label: "Unsaved look",
	divider: "·",
	hint: "the card above is a preview",
	discard: "discard",
	save: "Save look",
} as const;

const SEAT =
	"pointer-events-none fixed inset-x-0 bottom-6 z-40 flex justify-center px-4";
const BAR =
	"pointer-events-auto flex max-w-full flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl bg-theme-raised py-3 pr-3 pl-6 shadow-2xl ring-2 ring-theme";
const STATUS = "flex flex-wrap items-center gap-x-2 text-sm";
const UNSAVED = "font-bold text-theme";
const HINT = "text-theme-muted";
const DISCARD =
	"cursor-pointer text-sm text-theme-muted underline underline-offset-4 hover:text-theme-soft disabled:cursor-not-allowed";
const ERROR = "basis-full text-sm text-cinnabar";

const BAR_COLOR = "saffron";

export type LookSaveBarProps = {
	canSave: boolean;
	error?: string;
	onSave: () => void;
	onDiscard: () => void;
};

export const LookSaveBar = ({
	canSave,
	error,
	onSave,
	onDiscard,
}: LookSaveBarProps) => (
	<div className={SEAT}>
		<div
			role="region"
			aria-label={COPY.label}
			data-screen-theme={BAR_COLOR}
			className={BAR}
		>
			<span className={STATUS}>
				<span className={UNSAVED}>{COPY.label}</span>
				<span aria-hidden className={HINT}>
					{COPY.divider}
				</span>
				<span className={HINT}>{COPY.hint}</span>
			</span>
			<button type="button" className={DISCARD} onClick={onDiscard}>
				{COPY.discard}
			</button>
			<Button
				size="md"
				tone="primary"
				label={COPY.save}
				onPress={onSave}
				disabled={!canSave}
			/>
			{error === undefined ? null : <span className={ERROR}>{error}</span>}
		</div>
	</div>
);
