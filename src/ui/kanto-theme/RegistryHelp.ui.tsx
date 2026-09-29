import { Button, type ButtonTone } from "./Button.ui";
import { Typography } from "./Typography.ui";

const COPY = {
	prompt: "What do you want this build to do?",
	hide: "hide",
} as const;

const BLOCK =
	"flex w-full flex-col gap-3 rounded-xl border border-theme-faint bg-theme-raised px-4 py-3";
const PROMPT_ROW = "flex w-full flex-wrap items-baseline gap-3";
const PROMPT = "grow";
const CHIPS = "flex flex-wrap gap-2";

const CHIP_TONE: ButtonTone = "ambient";
const HIDE_TONE: ButtonTone = "bare";

export type RegistryHelpChip = {
	id: string;
	label: string;
	count: number;
};

export type RegistryHelpProps = {
	chips: readonly RegistryHelpChip[];
	pickedId?: string;
	onPick: (id: string) => void;
	onHide: () => void;
};

export const RegistryHelp = ({
	chips,
	pickedId,
	onPick,
	onHide,
}: RegistryHelpProps) => (
	<div className={BLOCK}>
		<div className={PROMPT_ROW}>
			<span className={PROMPT}>
				<Typography variant="label" as="span">
					{COPY.prompt}
				</Typography>
			</span>
			<Button tone={HIDE_TONE} label={COPY.hide} onPress={onHide} />
		</div>

		<div className={CHIPS}>
			{chips.map(({ id, label, count }) => (
				<Button
					key={id}
					tone={CHIP_TONE}
					label={label}
					detail={`${count}`}
					detailOn="always"
					pressed={id === pickedId}
					onPress={() => onPick(id)}
				/>
			))}
		</div>
	</div>
);
